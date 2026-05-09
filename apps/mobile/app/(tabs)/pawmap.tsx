import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useQuery } from '@tanstack/react-query';
import { Colors, Fonts, FontSize } from '@pawflo/theme';
import type { Place, PlaceType } from '@pawflo/types';
import { api } from '@/lib/apiClient';
import { strings } from '@/i18n/strings.pl';

const s = strings.pawmap;

// ─── Types ────────────────────────────────────────────────────────────────────

type PlaceWithDistance = Place & { distanceKm: number };
type Filter = 'all' | PlaceType;

// ─── Visual config per type ───────────────────────────────────────────────────

const TYPE_CONFIG: Record<PlaceType, { color: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
  VET:     { color: Colors.coral,     icon: 'medkit' },
  SHOP:    { color: Colors.bone,      icon: 'storefront' },
  GROOMER: { color: Colors.coralSoft, icon: 'cut' },
};

const WARSAW: Region = {
  latitude:       52.2297,
  longitude:      21.0122,
  latitudeDelta:  0.12,
  longitudeDelta: 0.12,
};

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function PawMapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [filter,   setFilter]   = useState<Filter>('all');
  const [selected, setSelected] = useState<PlaceWithDistance | null>(null);
  const [coords,   setCoords]   = useState<{ lat: number; lng: number } | null>(null);
  const [gpsNote,  setGpsNote]  = useState<string>(s.locationLoading);

  // Request location permission and get current position on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (!cancelled) {
          setGpsNote(s.locationDenied);
          setCoords({ lat: WARSAW.latitude, lng: WARSAW.longitude });
        }
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (!cancelled) {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsNote(s.locationNote);
        mapRef.current?.animateToRegion(
          {
            latitude:      pos.coords.latitude,
            longitude:     pos.coords.longitude,
            latitudeDelta:  0.12,
            longitudeDelta: 0.12,
          },
          600,
        );
      }
    })().catch(() => {
      if (!cancelled) {
        setGpsNote(s.locationFallback);
        setCoords({ lat: WARSAW.latitude, lng: WARSAW.longitude });
      }
    });

    return () => { cancelled = true; };
  }, []);

  // Fetch places once we have coordinates
  const { data, isLoading } = useQuery({
    queryKey: ['places', coords?.lat, coords?.lng, filter],
    queryFn: () =>
      api.places.list({
        lat:    coords!.lat,
        lng:    coords!.lng,
        radius: 15,
        type:   filter !== 'all' ? filter : undefined,
      }),
    enabled: coords !== null,
    staleTime: 5 * 60 * 1000, // 5 min — places don't change often
  });

  const places = data?.places ?? [];

  function handleMarkerPress(place: PlaceWithDistance) {
    setSelected(place);
    mapRef.current?.animateToRegion(
      { latitude: place.lat, longitude: place.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 },
      350,
    );
  }

  function handleCall(phone: string) {
    Linking.openURL(`tel:${phone}`);
  }

  function handleMapPress() {
    setSelected(null);
  }

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all',     label: s.filterAll },
    { key: 'VET',     label: s.filterVet },
    { key: 'SHOP',    label: s.filterShop },
    { key: 'GROOMER', label: s.filterGroomer },
  ];

  return (
    <View style={styles.root}>
      {/* Full-screen map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={WARSAW}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.lat, longitude: place.lng }}
            onPress={() => handleMarkerPress(place)}
            pinColor={TYPE_CONFIG[place.type].color}
          />
        ))}
      </MapView>

      {/* Filter bar — sits inside safe area top */}
      <SafeAreaView style={styles.filterSafe} edges={['top']} pointerEvents="box-none">
        <View style={styles.filterWrap} pointerEvents="auto">
          <Text style={styles.mapTitle}>{s.title}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {FILTERS.map((f) => (
              <Pressable
                key={f.key}
                style={[styles.filterPill, filter === f.key && styles.filterPillActive]}
                onPress={() => { setFilter(f.key); setSelected(null); }}
                accessibilityRole="button"
              >
                <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>

      {/* Legend */}
      <View style={[styles.legend, { top: insets.top + 100 }]} pointerEvents="none">
        {(['VET', 'SHOP', 'GROOMER'] as PlaceType[]).map((type) => (
          <View key={type} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: TYPE_CONFIG[type].color }]} />
            <Text style={styles.legendText}>{s.types[type]}</Text>
          </View>
        ))}
      </View>

      {/* Loading overlay while fetching places */}
      {isLoading && (
        <View style={[styles.loadingBadge, { top: insets.top + 100, left: 16 }]} pointerEvents="none">
          <ActivityIndicator size="small" color={Colors.coral} />
        </View>
      )}

      {/* Selected place info card */}
      {selected && (
        <View style={[styles.infoCard, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.infoHeader}>
            <View style={[styles.typeIcon, { backgroundColor: TYPE_CONFIG[selected.type].color + '22' }]}>
              <Ionicons
                name={TYPE_CONFIG[selected.type].icon}
                size={20}
                color={TYPE_CONFIG[selected.type].color}
              />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoName} numberOfLines={1}>{selected.name}</Text>
              <Text style={styles.infoAddress} numberOfLines={1}>
                {selected.address}, {selected.city}
              </Text>
            </View>
            <Pressable onPress={() => setSelected(null)} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.textFaint} />
            </Pressable>
          </View>

          <View style={styles.infoMeta}>
            <View style={styles.typeBadge}>
              <Text style={[styles.typeBadgeText, { color: TYPE_CONFIG[selected.type].color }]}>
                {s.types[selected.type]}
              </Text>
            </View>
            <Text style={styles.distanceText}>
              {selected.distanceKm < 1
                ? `${Math.round(selected.distanceKm * 1000)} m`
                : `${selected.distanceKm.toFixed(1)} km`}
            </Text>
          </View>

          {selected.phone ? (
            <Pressable
              style={styles.callBtn}
              onPress={() => handleCall(selected.phone!)}
              accessibilityRole="button"
            >
              <Ionicons name="call-outline" size={16} color={Colors.cream} />
              <Text style={styles.callBtnText}>{s.call}</Text>
            </Pressable>
          ) : (
            <View style={styles.callBtnDisabled}>
              <Ionicons name="call-outline" size={16} color={Colors.textFaint} />
              <Text style={styles.callBtnDisabledText}>{s.noPhone}</Text>
            </View>
          )}
        </View>
      )}

      {/* GPS / status note — bottom left */}
      {!selected && (
        <View style={[styles.gpsNote, { bottom: insets.bottom + 12 }]} pointerEvents="none">
          <Ionicons name="location-outline" size={12} color={Colors.textFaint} />
          <Text style={styles.gpsNoteText}>{gpsNote}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  map:  { ...StyleSheet.absoluteFillObject },

  // Filter bar
  filterSafe: { position: 'absolute', top: 0, left: 0, right: 0 },
  filterWrap: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: Colors.ink,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    gap: 8,
  },
  mapTitle: {
    fontFamily: 'Fraunces-Bold',
    fontSize: FontSize.h4,
    color: Colors.cream,
    paddingHorizontal: 4,
  },
  filterRow: { gap: 8, paddingHorizontal: 4 },
  filterPill: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.inkSoft,
    paddingHorizontal: 14,
    paddingVertical: 7,
    minHeight: 34,
    justifyContent: 'center',
    backgroundColor: Colors.inkSoft,
  },
  filterPillActive: { borderColor: Colors.coral, backgroundColor: 'rgba(240,138,138,0.15)' },
  filterText:       { fontFamily: Fonts.sans, fontSize: FontSize.caption, color: Colors.bone },
  filterTextActive: { color: Colors.coral },

  // Legend
  legend: {
    position: 'absolute',
    right: 16,
    backgroundColor: 'rgba(27,20,17,0.85)',
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:  { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: Fonts.sans, fontSize: FontSize.micro, color: Colors.bone },

  // Loading badge
  loadingBadge: {
    position: 'absolute',
    backgroundColor: 'rgba(27,20,17,0.85)',
    borderRadius: 10,
    padding: 10,
  },

  // Place info card
  infoCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.ink,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoText:    { flex: 1 },
  infoName:    { fontFamily: 'Fraunces-Bold', fontSize: FontSize.h4, color: Colors.cream, marginBottom: 2 },
  infoAddress: { fontFamily: Fonts.sans, fontSize: FontSize.caption, color: Colors.textFaint },
  closeBtn:    { padding: 4 },

  infoMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 12, gap: 8 },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: Colors.inkSoft,
  },
  typeBadgeText: { fontFamily: Fonts.sans, fontSize: FontSize.caption },
  distanceText:  { fontFamily: Fonts.sans, fontSize: FontSize.caption, color: Colors.textFaint },

  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.coral,
    borderRadius: 12,
    paddingVertical: 13,
    minHeight: 48,
  },
  callBtnText: { fontFamily: 'Cabinet Grotesk-Bold', fontSize: FontSize.body, color: Colors.cream },

  callBtnDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 13,
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.inkSoft,
  },
  callBtnDisabledText: { fontFamily: Fonts.sans, fontSize: FontSize.body, color: Colors.textFaint },

  // GPS note
  gpsNote: {
    position: 'absolute',
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(27,20,17,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  gpsNoteText: { fontFamily: Fonts.sans, fontSize: FontSize.micro, color: Colors.textFaint },
});
