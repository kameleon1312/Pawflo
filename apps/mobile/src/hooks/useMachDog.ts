import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';

const CANDIDATES_KEY = ['swipes', 'candidates'] as const;
const MATCHES_KEY    = ['matches'] as const;

export function useCandidates() {
  return useQuery({
    queryKey: CANDIDATES_KEY,
    queryFn: () => api.swipes.candidates().then((r) => r.candidates),
    staleTime: 60_000,
  });
}

export function useSwipe() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ swipeeId, direction }: { swipeeId: string; direction: 'LIKE' | 'PASS' }) =>
      api.swipes.create(swipeeId, direction),
    onSuccess: () => {
      // Invalidate so the candidates list refreshes when user comes back
      qc.invalidateQueries({ queryKey: CANDIDATES_KEY });
      qc.invalidateQueries({ queryKey: MATCHES_KEY });
    },
  });
}

export function useMatches() {
  return useQuery({
    queryKey: MATCHES_KEY,
    queryFn: () => api.matches.list().then((r) => r.matches),
  });
}
