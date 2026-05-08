import { useRef, useState } from 'react';
import {
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
import { Colors, Fonts, FontSize } from '@pawflo/theme';
import { strings } from '@/i18n/strings.pl';

const s = strings.pawmap;

// ─── Types ────────────────────────────────────────────────────────────────────

type PlaceType = 'vet' | 'shop' | 'groomer';

interface Place {
  id:      string;
  name:    string;
  type:    PlaceType;
  address: string;
  city:    string;
  lat:     number;
  lng:     number;
  phone?:  string;
}

// ─── Static place data (Warsaw) ───────────────────────────────────────────────

const PLACES: Place[] = [
  // Veterinarians
  { id: 'v1', name: 'Klinika Weterynaryjna Animedo', type: 'vet',
    address: 'ul. Marszałkowska 45', city: 'Warszawa',
    lat: 52.2297, lng: 21.0122, phone: '+48221112233' },
  { id: 'v2', name: 'Przychodnia Weterynaryjna Veti', type: 'vet',
    address: 'ul. Puławska 100', city: 'Warszawa',
    lat: 52.2178, lng: 21.0222, phone: '+48224445566' },
  { id: 'v3', name: 'VetHouse Wola', type: 'vet',
    address: 'ul. Wolska 32', city: 'Warszawa',
    lat: 52.2347, lng: 20.9900, phone: '+48227778899' },
  { id: 'v4', name: 'ZooMed Praga', type: 'vet',
    address: 'ul. Targowa 15', city: 'Warszawa',
    lat: 52.2497, lng: 21.0522 },
  { id: 'v5', name: 'Centrum Weterynaryjne Ursynów', type: 'vet',
    address: 'al. KEN 68', city: 'Warszawa',
    lat: 52.1480, lng: 21.0420, phone: '+48223456789' },
  { id: 'v6', name: 'Klinika PetCare Śródmieście', type: 'vet',
    address: 'ul. Nowy Świat 72', city: 'Warszawa',
    lat: 52.2320, lng: 21.0180 },

  // Pet shops
  { id: 's1', name: 'Zooland Centrum', type: 'shop',
    address: 'ul. Złota 59', city: 'Warszawa',
    lat: 52.2297, lng: 21.0012, phone: '+48221234567' },
  { id: 's2', name: 'Kakadu Pet Shop', type: 'shop',
    address: 'ul. Nowy Świat 22', city: 'Warszawa',
    lat: 52.2317, lng: 21.0197 },
  { id: 's3', name: 'Pets Paradise Mokotów', type: 'shop',
    address: 'ul. Puławska 55', city: 'Warszawa',
    lat: 52.2200, lng: 21.0102 },
  { id: 's4', name: 'ZooKraina Wilanów', type: 'shop',
    address: 'ul. Klimczaka 1', city: 'Warszawa',
    lat: 52.1657, lng: 21.0497, phone: '+48229876543' },
  { id: 's5', name: 'Pupil Sklep Zoologiczny', type: 'shop',
    address: 'ul. Grochowska 42', city: 'Warszawa',
    lat: 52.2410, lng: 21.0800 },

  // Groomers
  { id: 'g1', name: 'Dog Spa Mokotów', type: 'groomer',
    address: 'ul. Wołoska 18', city: 'Warszawa',
    lat: 52.2050, lng: 21.0000, phone: '+48500100200' },
  { id: 'g2', name: 'Piękny Pies Salon', type: 'groomer',
    address: 'ul. Hoża 30', city: 'Warszawa',
    lat: 52.2260, lng: 21.0150 },
  { id: 'g3', name: 'Groomer & Friends Żoliborz', type: 'groomer',
    address: 'ul. Mickiewicza 25', city: 'Warszawa',
    lat: 52.2660, lng: 20.9780, phone: '+48600200300' },
  { id: 'g4', name: 'Psia Elegancja Praga', type: 'groomer',
    address: 'ul. Kawęczyńska 7', city: 'Warszawa',
    lat: 52.2530, lng: 21.0600 },
];

// ─── Visual config per type ───────────────────────────────────────────────────

const TYPE_CONFIG: Record<PlaceType, { color: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
  vet:     { color: Colors.coral,     icon: 'medkit' },
  shop:    { color: Colors.bone,      icon: 'storefront' },
  groomer: { color: Colors.coralSoft, icon: 'cut' },
};

const WARSAW: Region = {
  latitude:       52.2297,
  longitude:      21.0122,
  latitudeDelta:  0.12,
  longitudeDelta: 0.12,
};

// ─── Main screen ──────────────────────────────────────────────────────────────

type Filter = 'all' | PlaceType;

export default function PawMapScreen() {
  const insets    = useSafeAreaInsets();
  const mapRef    = useRef<MapView>(null);

  const [filter,   setFilter]   = useState<Filter>('all');
  const [selected, setSelected] = useState<Place | null>(null);

  const visible = filter === 'all' ? PLACES : PLACES.filter((p) => p.type === filter);

  function handleMarkerPress(place: Place) {
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
    { key: 'vet',     label: s.filterVet },
    { key: 'shop',    label: s.filterShop },
    { key: 'groomer', label: s.filterGroomer },
  ];

  return (
    <View style={styles.root}>
      {/* Full-screen map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={WARSAW}
        onPress={handleMapPress}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {visible.map((place) => (
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
                onPress={() => setFilter(f.key)}
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
        {(['vet', 'shop', 'groomer'] as PlaceType[]).map((type) => (
          <View key={type} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: TYPE_CONFIG[type].color }]} />
            <Text style={styles.legendText}>{s.types[type]}</Text>
          </View>
        ))}
      </View>

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

      {/* GPS note — bottom left */}
      {!selected && (
        <View style={[styles.gpsNote, { bottom: insets.bottom + 12 }]} pointerEvents="none">
          <Ionicons name="location-outline" size={12} color={Colors.textFaint} />
          <Text style={styles.gpsNoteText}>{s.locationNote}</Text>
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

  infoMeta: { flexDirection: 'row', marginTop: 10, marginBottom: 12 },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: Colors.inkSoft,
  },
  typeBadgeText: { fontFamily: Fonts.sans, fontSize: FontSize.caption },

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
