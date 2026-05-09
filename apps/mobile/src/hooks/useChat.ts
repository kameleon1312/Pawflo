import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Socket } from 'socket.io-client';
import { api } from '@/lib/apiClient';
import { getSocket } from '@/lib/socket';
import type { Message } from '@pawflo/types';

function chatKey(matchId: string) {
  return ['chat', matchId] as const;
}

export function useMessages(matchId: string) {
  const qc = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  const query = useQuery({
    queryKey: chatKey(matchId),
    queryFn: () => api.chat.messages(matchId).then((r) => r.messages),
    staleTime: Infinity, // socket keeps data fresh — no background refetch
  });

  useEffect(() => {
    let active = true;

    async function connect() {
      const socket = await getSocket();
      if (!active) return;

      socketRef.current = socket;
      socket.emit('join_match', matchId);

      socket.on('new_message', (message: Message) => {
        qc.setQueryData<Message[]>(chatKey(matchId), (prev = []) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      });
    }

    void connect();

    return () => {
      active = false;
      socketRef.current?.emit('leave_match', matchId);
      socketRef.current?.off('new_message');
    };
  }, [matchId, qc]);

  return query;
}

export function useSendMessage(matchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => api.chat.send(matchId, text),
    onSuccess: ({ message }) => {
      // Add own message immediately — socket delivers same msg but dedup handles it
      qc.setQueryData<Message[]>(chatKey(matchId), (prev = []) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    },
  });
}
