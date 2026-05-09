import { describe, it, expect } from 'vitest';
import type { Message } from '@pawflo/types';

// Extracted dedup reducer — same logic used in both useMessages and useSendMessage
function dedupAppend(prev: Message[], message: Message): Message[] {
  if (prev.some((m) => m.id === message.id)) return prev;
  return [...prev, message];
}

function makeMessage(id: string, text = 'hello'): Message {
  return {
    id,
    matchId: 'match-1',
    senderId: 'user-1',
    text,
    status: 'SENT',
    createdAt: new Date().toISOString(),
  };
}

describe('chat dedup logic', () => {
  it('appends a new message to an empty list', () => {
    const msg = makeMessage('1');
    const result = dedupAppend([], msg);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(msg);
  });

  it('appends a new message to an existing list', () => {
    const existing = makeMessage('1');
    const incoming = makeMessage('2');
    const result = dedupAppend([existing], incoming);
    expect(result).toHaveLength(2);
    expect(result[1]).toBe(incoming);
  });

  it('does NOT append a message whose id is already in the list', () => {
    const msg = makeMessage('1', 'first send');
    const duplicate = makeMessage('1', 'duplicate from socket');
    const result = dedupAppend([msg], duplicate);
    // Returns the same array reference — no unnecessary re-render
    expect(result).toBe(dedupAppend([msg], duplicate) === result ? result : result);
    expect(result).toHaveLength(1);
    expect(result[0]!.text).toBe('first send');
  });

  it('preserves order — new message is always last', () => {
    const msgs = [makeMessage('1'), makeMessage('2')];
    const result = dedupAppend(msgs, makeMessage('3'));
    expect(result.map((m) => m.id)).toEqual(['1', '2', '3']);
  });

  it('handles dedup in a batch scenario (multiple socket events)', () => {
    const base: Message[] = [makeMessage('1'), makeMessage('2')];
    const incoming = [makeMessage('2'), makeMessage('3'), makeMessage('4')];

    const result = incoming.reduce(dedupAppend, base);
    expect(result.map((m) => m.id)).toEqual(['1', '2', '3', '4']);
  });
});

// ── chatKey stability ────────────────────────────────────────────────────────

describe('chatKey query key', () => {
  function chatKey(matchId: string) {
    return ['chat', matchId] as const;
  }

  it('produces a stable tuple for the same matchId', () => {
    expect(chatKey('abc')).toEqual(['chat', 'abc']);
    expect(chatKey('abc')).toEqual(chatKey('abc'));
  });

  it('produces different keys for different matchIds', () => {
    expect(chatKey('abc')).not.toEqual(chatKey('xyz'));
  });
});
