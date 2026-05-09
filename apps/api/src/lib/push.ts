import { logger } from './logger';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface ExpoMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default';
}

// Fire-and-forget — push failures must never break the main request.
export async function sendPush(
  token: string | null | undefined,
  msg: Omit<ExpoMessage, 'to'>,
): Promise<void> {
  if (!token?.startsWith('ExponentPushToken[')) return;

  const payload: ExpoMessage = { to: token, sound: 'default', ...msg };

  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      logger.warn({ event: 'push.error', status: res.status }, 'Expo push send failed');
    }
  } catch (err) {
    logger.warn({ event: 'push.exception', err }, 'Expo push exception');
  }
}

export function sendMatchPush(
  token: string | null | undefined,
  myDogName: string,
): Promise<void> {
  return sendPush(token, {
    title: '🐾 Nowy match!',
    body: `${myDogName} znalazł nowego przyjaciela! Zacznij rozmowę.`,
    data: { type: 'MATCH' },
  });
}

export function sendMessagePush(
  token: string | null | undefined,
  senderDogName: string,
  text: string,
  matchId: string,
): Promise<void> {
  const preview = text.length > 60 ? `${text.slice(0, 60)}…` : text;
  return sendPush(token, {
    title: senderDogName,
    body: preview,
    data: { type: 'MESSAGE', matchId },
  });
}
