import { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
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
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const photoIndexRef = useRef(0);
  const photosRef = useRef(dog.photos);
  photosRef.current = dog.photos;

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        rotate: `${interpolate(
          translateX.value,
          [-SCREEN_W / 2, 0, SCREEN_W / 2],
          [-7, 0, 7],
          Extrapolation.CLAMP,
        )}deg`,
      },
    ],
  }));

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, 60], [0, 1], Extrapolation.CLAMP),
  }));

  const passStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-60, 0], [1, 0], Extrapolation.CLAMP),
  }));

  function cyclePhoto() {
    const len = photosRef.current.length;
    if (len < 2) return;
    const next = (photoIndexRef.current + 1) % len;
    photoIndexRef.current = next;
    setPhotoIndex(next);
  }

  // Called from JS thread (button press) or via runOnJS from UI thread (gesture onEnd)
  function flyOut(direction: 'LIKE' | 'PASS', dy = 0) {
    if (direction === 'LIKE') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const toX = direction === 'LIKE' ? SCREEN_W * 1.6 : -SCREEN_W * 1.6;
    translateX.value = withTiming(toX, { duration: SWIPE_OUT_DURATION }, (finished) => {
      'worklet';
      if (finished) runOnJS(onSwipe)(direction);
    });
    translateY.value = withTiming(dy, { duration: SWIPE_OUT_DURATION });
  }

  const pan = Gesture.Pan()
    .minDistance(0)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      'worklet';
      const isSwipe = Math.abs(e.translationX) > SWIPE_THRESHOLD;
      const isTap = Math.abs(e.translationX) < 8 && Math.abs(e.translationY) < 8;

      if (isSwipe) {
        runOnJS(flyOut)(e.translationX > 0 ? 'LIKE' : 'PASS', e.translationY);
      } else if (isTap) {
        runOnJS(cyclePhoto)();
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  // Reset card position and photo index when the dog changes (next card rendered)
  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
    photoIndexRef.current = 0;
    setPhotoIndex(0);
  }, [dog.id]);

  const photo = dog.photos[photoIndex] ?? dog.photos[0];
  const ageLabel = dog.birthDate ? formatAge(dog.birthDate) : null;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, cardStyle]}>
        {/* Photo */}
        {photo ? (
          <Image source={{ uri: photo.url }} style={styles.photo} contentFit="cover" />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>🐾</Text>
          </View>
        )}

        {/* Progress dots */}
        {dog.photos.length > 1 && (
          <View style={styles.dotsRow}>
            {dog.photos.map((_, i) => (
              <View key={i} style={[styles.dotBar, i === photoIndex && styles.dotBarActive]} />
            ))}
          </View>
        )}

        {/* LIKE / PASS badge overlays */}
        <Animated.View style={[styles.badge, styles.likeBadge, likeStyle]}>
          <Text style={styles.likeText}>LUBIĘ</Text>
        </Animated.View>
        <Animated.View style={[styles.badge, styles.passBadge, passStyle]}>
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
    </GestureDetector>
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

  photo: { ...StyleSheet.absoluteFillObject },

  dotsRow: {
    position: 'absolute',
    top: 10,
    left: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
  },
  dotBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(248,239,226,0.35)',
  },
  dotBarActive: {
    backgroundColor: Colors.cream,
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.inkSoft,
  },
  photoPlaceholderText: { fontSize: 72 },

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
