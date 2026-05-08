import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Fonts, FontSize } from '@pawflo/theme';
import { strings } from '@/i18n/strings.pl';
import { useCandidates, useMatches, useSwipe } from '@/hooks/useMachDog';
import { SwipeCard } from '@/components/ui/SwipeCard';
import type { MatchSummary } from '@pawflo/types';

const s = strings.machdog;

export default function MachdogScreen() {
  const router    = useRouter();
  const insets    = useSafeAreaInsets();
  const candidates = useCandidates();
  const matches    = useMatches();
  const swipe      = useSwipe();

  const [cardIndex, setCardIndex] = useState(0);
  const [matchModal, setMatchModal] = useState<{ name: string } | null>(null);

  const deck = candidates.data ?? [];
  const current = deck[cardIndex] ?? null;

  // isFetching covers both initial load and subsequent refetch() calls
  const isLoading  = candidates.isLoading || candidates.isFetching;
  const isDepleted = !isLoading && cardIndex >= deck.length;

  async function handleSwipe(direction: 'LIKE' | 'PASS') {
    if (!current) return;
    try {
      const result = await swipe.mutateAsync({ swipeeId: current.id, direction });
      if (result.matched) {
        setMatchModal({ name: current.name });
      }
    } catch {
      // error silently — next card still advances
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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{s.title}</Text>
          {(matches.data?.length ?? 0) > 0 && (
            <View style={styles.matchBadge}>
              <Text style={styles.matchBadgeText}>{matches.data!.length}</Text>
            </View>
          )}
        </View>

        {/* Swipe deck */}
        <View style={styles.deckArea}>
          {isLoading ? (
            <ActivityIndicator color={Colors.coral} size="large" />
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

        {/* Matches section */}
        {(matches.data?.length ?? 0) > 0 && (
          <View style={styles.matchesSection}>
            <Text style={styles.sectionLabel}>{s.matchesSection}</Text>
            <FlatList
              data={matches.data}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.matchesList}
              renderItem={({ item }) => (
                <MatchAvatar
                  match={item}
                  onPress={() => router.push({ pathname: '/chat/[matchId]', params: { matchId: item.id, dogName: item.otherDog?.name ?? '' } })}
                />
              )}
            />
          </View>
        )}

        {matches.data?.length === 0 && !isLoading && (
          <View style={styles.matchesSection}>
            <Text style={styles.sectionLabel}>{s.matchesSection}</Text>
            <Text style={styles.noMatchesText}>{s.noMatchesYet}</Text>
          </View>
        )}
      </ScrollView>

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
            <Pressable style={styles.modalBtn} onPress={dismissMatch}>
              <Text style={styles.modalBtnText}>{s.matchContinue}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function MatchAvatar({ match, onPress }: { match: MatchSummary; onPress: () => void }) {
  const photo = match.otherDog?.photos[0];
  return (
    <Pressable style={styles.avatarWrap} onPress={onPress} hitSlop={8}>
      {photo ? (
        <Image source={{ uri: photo.url }} style={styles.avatarImg} />
      ) : (
        <View style={[styles.avatarImg, styles.avatarPlaceholder]}>
          <Text style={{ fontSize: 24 }}>🐶</Text>
        </View>
      )}
      <Text style={styles.avatarName} numberOfLines={1}>
        {match.otherDog?.name ?? '—'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.ink },
  flex:   { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 12 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
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
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 520,
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

  matchesSection: { marginTop: 28 },
  sectionLabel: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.label,
    color: Colors.bone,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  matchesList: { gap: 12, paddingHorizontal: 8 },
  noMatchesText: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.bodySm,
    color: Colors.textFaint,
    paddingHorizontal: 8,
    lineHeight: FontSize.bodySm * 1.6,
  },

  avatarWrap: { alignItems: 'center', gap: 6, width: 72 },
  avatarImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.coral,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.inkSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarName: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.caption,
    color: Colors.bone,
    maxWidth: 72,
    textAlign: 'center',
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
  modalEmoji:    { fontSize: 56 },
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
});
