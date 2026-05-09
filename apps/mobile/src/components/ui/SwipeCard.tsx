import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { CandidateDog } from '@pawflo/types';
import { Colors, Fonts, FontSize } from '@pawflo/theme';

const { width: SCREEN_W } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_W * 0.28;
const SWIPE_OUT_DURATION = 240;

const SIZE_LABEL: Record<string, string> = { SMALL: 'Mały', MEDIUM: 'Średni', LARGE: 'Duży' };

type Props = {
  dog: CandidateDog;
  onSwipe: (direction: 'LIKE' | 'PASS') => void;
};

export function SwipeCard({ dog, onSwipe }: Props) {
  const pan = useRef(new Animated.ValueXY()).current;

  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_W / 2, 0, SCREEN_W / 2],
    outputRange: ['-7deg', '0deg', '7deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = pan.x.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const passOpacity = pan.x.interpolate({
    inputRange: [-60, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) > SWIPE_THRESHOLD) {
          flyOut(gesture.dx > 0 ? 'LIKE' : 'PASS', gesture.dy);
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      },
    }),
  ).current;

  function flyOut(direction: 'LIKE' | 'PASS', dy = 0) {
    const toX = direction === 'LIKE' ? SCREEN_W * 1.6 : -SCREEN_W * 1.6;
    Animated.timing(pan, {
      toValue: { x: toX, y: dy },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipe(direction));
  }

  // Reset card position when the dog changes (next card rendered)
  useEffect(() => {
    pan.setValue({ x: 0, y: 0 });
  }, [dog.id, pan]);

  const photo = dog.photos[0];
  const ageLabel = dog.birthDate ? formatAge(dog.birthDate) : null;

  return (
    <Animated.View
      style={[
        styles.card,
        { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }] },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Photo */}
      {photo ? (
        <Image source={{ uri: photo.url }} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoPlaceholderText}>🐾</Text>
        </View>
      )}

      {/* LIKE / PASS badge overlays */}
      <Animated.View style={[styles.badge, styles.likeBadge, { opacity: likeOpacity }]}>
        <Text style={styles.likeText}>LUBIĘ</Text>
      </Animated.View>
      <Animated.View style={[styles.badge, styles.passBadge, { opacity: passOpacity }]}>
        <Text style={styles.passText}>PASS</Text>
      </Animated.View>

      {/* Info + actions overlay at the bottom */}
      <View style={styles.bottomOverlay}>
        <View style={styles.info}>
          <Text style={styles.dogName} numberOfLines={1}>
            {dog.name}{ageLabel ? `, ${ageLabel}` : ''}
          </Text>
          <View style={styles.metaRow}>
            {dog.breed ? (
              <Text style={styles.metaText} numberOfLines={1}>{dog.breed}</Text>
            ) : null}
            <View style={styles.sizePill}>
              <Text style={styles.sizePillText}>{SIZE_LABEL[dog.size] ?? dog.size}</Text>
            </View>
          </View>
          {dog.owner.locationCity ? (
            <Text style={styles.city}>📍 {dog.owner.locationCity}</Text>
          ) : null}
          {dog.bio ? (
            <Text style={styles.bio} numberOfLines={2}>{dog.bio}</Text>
          ) : null}
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.btn, styles.btnPass]}
            onPress={() => flyOut('PASS')}
            accessibilityRole="button"
            accessibilityLabel="Pomiń psa"
          >
            <Text style={styles.btnPassText}>✕</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, styles.btnLike]}
            onPress={() => flyOut('LIKE')}
            accessibilityRole="button"
            accessibilityLabel="Lubię psa"
          >
            <Text style={styles.btnLikeText}>♥</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

function formatAge(birthDate: string): string {
  const months = Math.floor(
    (Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44),
  );
  if (months < 2) return '< 1 mies.';
  if (months < 12) return `${months} mies.`;
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? 'rok' : years < 5 ? 'lata' : 'lat'}`;
}

const styles = StyleSheet.create({
  card: {
    width: SCREEN_W,
    flex: 1,
    overflow: 'hidden',
    backgroundColor: Colors.inkSoft,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  photo: { width: '100%', height: '100%', position: 'absolute' },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.inkSoft,
  },
  photoPlaceholderText: { fontSize: 72 },

  // LIKE / PASS badges
  badge: {
    position: 'absolute',
    top: 28,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 3,
  },
  likeBadge: { left: 20, borderColor: Colors.coral, transform: [{ rotate: '-15deg' }] },
  passBadge: { right: 20, borderColor: Colors.bone, transform: [{ rotate: '15deg' }] },
  likeText: {
    fontFamily: 'Cabinet Grotesk-Bold',
    fontSize: FontSize.h4,
    color: Colors.coral,
    letterSpacing: 2,
  },
  passText: {
    fontFamily: 'Cabinet Grotesk-Bold',
    fontSize: FontSize.h4,
    color: Colors.bone,
    letterSpacing: 2,
  },

  // Bottom overlay: info text + action buttons
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(27,20,17,0.78)',
  },
  info: {
    padding: 20,
    paddingBottom: 12,
  },
  dogName: {
    fontFamily: 'Fraunces-Bold',
    fontSize: FontSize.h2,
    color: Colors.cream,
    marginBottom: 4,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  metaText: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.bodySm,
    color: Colors.bone,
    flexShrink: 1,
  },
  sizePill: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(248,239,226,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sizePillText: { fontFamily: Fonts.sans, fontSize: FontSize.caption, color: Colors.bone },
  city: { fontFamily: Fonts.sans, fontSize: FontSize.caption, color: Colors.coralSoft, marginBottom: 4 },
  bio: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.caption,
    color: Colors.bone,
    lineHeight: FontSize.caption * 1.5,
    opacity: 0.8,
    marginTop: 2,
  },

  // Action buttons bar
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(229,219,197,0.15)',
  },
  btn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  btnPass: { backgroundColor: Colors.inkSoft, borderWidth: 2, borderColor: Colors.bone },
  btnLike: { backgroundColor: Colors.coral },
  btnPassText: { fontSize: 26, color: Colors.bone },
  btnLikeText: { fontSize: 26, color: Colors.cream },
});
