import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';

function chatKey(matchId: string) {
  return ['chat', matchId] as const;
}

export function useMessages(matchId: string) {
  return useQuery({
    queryKey: chatKey(matchId),
    queryFn: () => api.chat.messages(matchId).then((r) => r.messages),
    // Poll every 3 seconds for new messages (real-time upgrade: Socket.io)
    refetchInterval: 3000,
    staleTime: 0,
  });
}

export function useSendMessage(matchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => api.chat.send(matchId, text),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chatKey(matchId) });
    },
  });
}
