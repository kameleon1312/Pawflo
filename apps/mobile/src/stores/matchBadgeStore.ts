import { create } from 'zustand';

interface MatchBadgeState {
  lastSeenAt: number;
  markSeen: () => void;
}

export const useMatchBadgeStore = create<MatchBadgeState>((set) => ({
  lastSeenAt: 0,
  markSeen: () => set({ lastSeenAt: Date.now() }),
}));
