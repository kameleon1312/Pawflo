import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Fonts, FontSize } from '@pawflo/theme';
import { strings } from '@/i18n/strings.pl';
import { useMatches } from '@/hooks/useMachDog';
import type { MatchSummary } from '@pawflo/types';

const s = strings.dopasowania;

export default function DopasowaniaScreen() {
  const router = useRouter();
  const { data: matches, isLoading, isError, refetch } = useMatches();

  function handleOpen(match: MatchSummary) {
    router.push({
      pathname: '/chat/[matchId]',
      params: { matchId: match.id, dogName: match.otherDog?.name ?? '' },
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{s.title}</Text>
        {(matches?.length ?? 0) > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{matches!.length}</Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.center} color={Colors.coral} size="large" />
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>⚠️</Text>
          <Text style={styles.emptyText}>{s.errorNetwork}</Text>
          <Pressable style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryBtnText}>{s.retry}</Text>
          </Pressable>
        </View>
      ) : matches?.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🐾</Text>
          <Text style={styles.emptyText}>{s.empty}</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <MatchRow match={item} onPress={() => handleOpen(item)} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function MatchRow({ match, onPress }: { match: MatchSummary; onPress: () => void }) {
  const photo = match.otherDog?.photos[0];
  const name = match.otherDog?.name ?? '—';
  const timeLabel = formatTime(match.lastMessageAt ?? match.createdAt);

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Otwórz czat z ${name}`}
    >
      {photo ? (
        <Image source={{ uri: photo.url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={{ fontSize: 28 }}>🐶</Text>
        </View>
      )}
      <View style={styles.rowInfo}>
        <Text style={styles.rowName} numberOfLines={1}>{name}</Text>
        <Text style={styles.rowTime}>{timeLabel}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.ink },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(229,219,197,0.12)',
  },
  title: {
    fontFamily: 'Fraunces-Bold',
    fontSize: FontSize.h2,
    color: Colors.cream,
    flex: 1,
  },
  countBadge: {
    backgroundColor: Colors.coral,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: {
    fontFamily: 'Cabinet Grotesk-Bold',
    fontSize: FontSize.caption,
    color: Colors.cream,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
  },
  emptyEmoji: { fontSize: 56 },
  emptyText: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.body,
    color: Colors.textFaint,
    textAlign: 'center',
    lineHeight: FontSize.body * 1.5,
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.coral,
  },
  retryBtnText: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.bodySm,
    color: Colors.coral,
  },

  list: { paddingVertical: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(229,219,197,0.08)',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.coral,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.inkSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: { flex: 1, gap: 3 },
  rowName: {
    fontFamily: 'Cabinet Grotesk-Bold',
    fontSize: FontSize.body,
    color: Colors.cream,
  },
  rowTime: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.caption,
    color: Colors.textFaint,
  },
  chevron: {
    fontSize: 22,
    color: Colors.textFaint,
  },
});
