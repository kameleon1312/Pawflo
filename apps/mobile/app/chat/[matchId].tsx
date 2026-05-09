import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSize } from '@pawflo/theme';
import { strings } from '@/i18n/strings.pl';
import { useAuthStore } from '@/stores/authStore';
import { useMessages, useSendMessage } from '@/hooks/useChat';
import { useUnmatch } from '@/hooks/useMachDog';
import type { Message } from '@pawflo/types';

const s = strings.chat;

export default function ChatScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const userId  = useAuthStore((st) => st.user?.id);

  const { matchId, dogName } = useLocalSearchParams<{ matchId: string; dogName: string }>();

  const messages  = useMessages(matchId);
  const send      = useSendMessage(matchId);
  const unmatch   = useUnmatch();

  const [text,      setText]      = useState('');
  const [sendError, setSendError] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  // Scroll to bottom whenever new messages arrive
  useEffect(() => {
    if ((messages.data?.length ?? 0) > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 80);
    }
  }, [messages.data?.length]);

  function handleUnmatch() {
    const s = strings.chat;
    Alert.alert(s.unmatchTitle, s.unmatchMessage, [
      { text: s.unmatchCancel, style: 'cancel' },
      {
        text: s.unmatchConfirm,
        style: 'destructive',
        onPress: async () => {
          try {
            await unmatch.mutateAsync(matchId);
            router.back();
          } catch {
            Alert.alert('', s.unmatchError);
          }
        },
      },
    ]);
  }

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || send.isPending) return;

    setText('');
    setSendError(false);
    try {
      await send.mutateAsync(trimmed);
    } catch {
      setSendError(true);
      setText(trimmed); // restore so user can retry
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.cream} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{dogName ?? '—'}</Text>
        <Pressable
          onPress={handleUnmatch}
          hitSlop={12}
          style={styles.moreBtn}
          accessibilityRole="button"
          accessibilityLabel="Opcje dopasowania"
        >
          <Ionicons name="ellipsis-horizontal" size={22} color={Colors.textFaint} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        {messages.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.coral} />
          </View>
        ) : (messages.data?.length ?? 0) === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyEmoji}>🐾</Text>
            <Text style={styles.emptyTitle}>{s.emptyTitle}</Text>
            <Text style={styles.emptySub}>{s.emptySub}</Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages.data}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <MessageBubble
                message={item}
                isOwn={item.senderId === userId}
                showDate={shouldShowDate(messages.data!, index)}
              />
            )}
          />
        )}

        {/* Error banner */}
        {sendError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{s.errorSend}</Text>
          </View>
        )}

        {/* Input bar */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder={s.inputPlaceholder}
            placeholderTextColor={Colors.textFaint}
            multiline
            maxLength={2000}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <Pressable
            style={[styles.sendBtn, (!text.trim() || send.isPending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || send.isPending}
            accessibilityRole="button"
            accessibilityLabel="Wyślij wiadomość"
          >
            {send.isPending
              ? <ActivityIndicator size="small" color={Colors.cream} />
              : <Ionicons name="send" size={18} color={Colors.cream} />}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── MessageBubble ────────────────────────────────────────────────────────────

function MessageBubble({
  message, isOwn, showDate,
}: {
  message: Message;
  isOwn: boolean;
  showDate: boolean;
}) {
  return (
    <>
      {showDate && (
        <Text style={styles.dateSep}>{formatDateSep(message.createdAt)}</Text>
      )}
      <View style={[styles.bubbleRow, isOwn ? styles.bubbleRowOwn : styles.bubbleRowOther]}>
        <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
          <Text style={[styles.bubbleText, isOwn ? styles.bubbleTextOwn : styles.bubbleTextOther]}>
            {message.text}
          </Text>
          <Text style={[styles.bubbleTime, isOwn ? styles.bubbleTimeOwn : styles.bubbleTimeOther]}>
            {formatTime(message.createdAt)}
          </Text>
        </View>
      </View>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shouldShowDate(messages: Message[], index: number): boolean {
  if (index === 0) return true;
  const prev = messages[index - 1];
  const curr = messages[index];
  if (!prev || !curr) return false;
  return new Date(prev.createdAt).toDateString() !== new Date(curr.createdAt).toDateString();
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function formatDateSep(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Dzisiaj';
  if (d.toDateString() === yesterday.toDateString()) return 'Wczoraj';
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: Colors.ink },
  flex:  { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 32 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(229,219,197,0.12)',
  },
  backBtn:     { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontFamily: 'Fraunces-Bold', fontSize: FontSize.h4, color: Colors.cream },
  moreBtn:     { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  emptyEmoji: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { fontFamily: 'Fraunces-Bold', fontSize: FontSize.h3, color: Colors.cream, textAlign: 'center' },
  emptySub:   { fontFamily: Fonts.sans, fontSize: FontSize.bodySm, color: Colors.textFaint, textAlign: 'center', lineHeight: FontSize.bodySm * 1.6 },

  messageList: { paddingHorizontal: 12, paddingVertical: 12, gap: 4 },

  dateSep: {
    textAlign: 'center',
    fontFamily: Fonts.sans,
    fontSize: FontSize.micro,
    color: Colors.textFaint,
    marginVertical: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  bubbleRow:      { flexDirection: 'row', marginVertical: 2 },
  bubbleRowOwn:   { justifyContent: 'flex-end' },
  bubbleRowOther: { justifyContent: 'flex-start' },

  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  bubbleOwn:   { backgroundColor: Colors.coral, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: Colors.inkSoft, borderBottomLeftRadius: 4 },

  bubbleText:      { fontFamily: Fonts.sans, fontSize: FontSize.body, lineHeight: FontSize.body * 1.4 },
  bubbleTextOwn:   { color: Colors.cream },
  bubbleTextOther: { color: Colors.bone },

  bubbleTime:      { fontFamily: Fonts.sans, fontSize: 10, alignSelf: 'flex-end' },
  bubbleTimeOwn:   { color: 'rgba(248,239,226,0.6)' },
  bubbleTimeOther: { color: Colors.textFaint },

  errorBanner: {
    backgroundColor: 'rgba(240,138,138,0.15)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  errorText: { fontFamily: Fonts.sans, fontSize: FontSize.caption, color: Colors.coral, textAlign: 'center' },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(229,219,197,0.12)',
    backgroundColor: Colors.ink,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: Colors.inkSoft,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: Fonts.sans,
    fontSize: FontSize.body,
    color: Colors.cream,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: { opacity: 0.4 },
});
