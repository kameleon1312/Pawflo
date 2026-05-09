import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Fonts, FontSize } from '@pawflo/theme';
import { strings } from '@/i18n/strings.pl';
import { useCandidates, useMatches, useSwipe } from '@/hooks/useMachDog';
import { SwipeCard } from '@/components/ui/SwipeCard';

const s = strings.machdog;

export default function MachdogScreen() {
  const router     = useRouter();
  const candidates = useCandidates();
  const matches    = useMatches();
  const swipe      = useSwipe();

  const [cardIndex, setCardIndex] = useState(0);
  const [matchModal, setMatchModal] = useState<{ name: string } | null>(null);

  const deck = candidates.data ?? [];
  const current = deck[cardIndex] ?? null;

  const isLoading  = candidates.isLoading || candidates.isFetching;
  const isError    = candidates.isError && !isLoading;
  const isDepleted = !isLoading && !isError && cardIndex >= deck.length;

  async function handleSwipe(direction: 'LIKE' | 'PASS') {
    if (!current) return;
    try {
      const result = await swipe.mutateAsync({ swipeeId: current.id, direction });
      if (result.matched) {
        setMatchModal({ name: current.name });
      }
    } catch {
      // swipe error — advance to next card anyway
    }
    setCardIndex((i) => i + 1);
  }

  function dismissMatch() {
    setMatchModal(null);
  }

  function handleRefresh() {
    setCardIndex(0);
    candidates.refetch();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{s.title}</Text>
        {(matches.data?.length ?? 0) > 0 && (
          <View style={styles.matchBadge}>
            <Text style={styles.matchBadgeText}>{matches.data!.length}</Text>
          </View>
        )}
      </View>

      {/* Swipe deck — fills remaining space */}
      <View style={styles.deckArea}>
        {isLoading ? (
          <ActivityIndicator color={Colors.coral} size="large" />
        ) : isError ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>⚠️</Text>
            <Text style={styles.emptyText}>{String((candidates.error as Error)?.message ?? 'Błąd połączenia')}</Text>
            <Pressable style={styles.refreshBtn} onPress={handleRefresh}>
              <Text style={styles.refreshBtnText}>{s.noMoreCta}</Text>
            </Pressable>
          </View>
        ) : isDepleted ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🐾</Text>
            <Text style={styles.emptyText}>{s.noMoreCandidates}</Text>
            <Pressable style={styles.refreshBtn} onPress={handleRefresh}>
              <Text style={styles.refreshBtnText}>{s.noMoreCta}</Text>
            </Pressable>
          </View>
        ) : current ? (
          <SwipeCard dog={current} onSwipe={handleSwipe} />
        ) : null}
      </View>

      {/* Match celebration modal */}
      <Modal
        visible={!!matchModal}
        transparent
        animationType="fade"
        onRequestClose={dismissMatch}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>🐾</Text>
            <Text style={styles.modalTitle}>{s.matchTitle}</Text>
            <Text style={styles.modalSubtitle}>
              {matchModal?.name && `${matchModal.name} `}{s.matchSubtitle}
            </Text>
            <Pressable
              style={styles.modalBtn}
              onPress={() => { dismissMatch(); router.navigate('/(tabs)/dopasowania'); }}
            >
              <Text style={styles.modalBtnText}>{s.matchGoToChat}</Text>
            </Pressable>
            <Pressable style={styles.modalBtnSecondary} onPress={dismissMatch}>
              <Text style={styles.modalBtnSecondaryText}>{s.matchContinue}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.ink },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontFamily: 'Fraunces-Bold',
    fontSize: FontSize.h2,
    color: Colors.cream,
    flex: 1,
  },
  matchBadge: {
    backgroundColor: Colors.coral,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  matchBadgeText: {
    fontFamily: 'Cabinet Grotesk-Bold',
    fontSize: FontSize.caption,
    color: Colors.cream,
  },

  deckArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyState: { alignItems: 'center', gap: 16, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 56 },
  emptyText: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.body,
    color: Colors.textFaint,
    textAlign: 'center',
    lineHeight: FontSize.body * 1.5,
  },
  refreshBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.coral,
  },
  refreshBtnText: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.bodySm,
    color: Colors.coral,
  },

  // Match modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(27,20,17,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  modalCard: {
    backgroundColor: Colors.inkSoft,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    gap: 12,
  },
  modalEmoji: { fontSize: 56 },
  modalTitle: {
    fontFamily: 'Fraunces-Bold',
    fontSize: FontSize.h2,
    color: Colors.cream,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.bodySm,
    color: Colors.bone,
    textAlign: 'center',
    lineHeight: FontSize.bodySm * 1.6,
  },
  modalBtn: {
    marginTop: 8,
    backgroundColor: Colors.coral,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 40,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    fontFamily: 'Cabinet Grotesk-Bold',
    fontSize: FontSize.body,
    color: Colors.cream,
  },
  modalBtnSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  modalBtnSecondaryText: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.bodySm,
    color: Colors.textFaint,
  },
});
