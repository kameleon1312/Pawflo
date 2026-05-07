import type { DogSummary } from './Dog';

export type SwipeDirection = 'LIKE' | 'PASS';
export type MatchStatus = 'PENDING' | 'MATCHED' | 'UNMATCHED';

export interface Swipe {
  id: string;
  swiperId: string;  // Dog id
  swipeeId: string;  // Dog id
  direction: SwipeDirection;
  createdAt: string;
}

export interface Match {
  id: string;
  dogA: DogSummary;
  dogB: DogSummary;
  status: MatchStatus;
  createdAt: string;
  lastMessageAt: string | null;
  unreadCount: number;
}
