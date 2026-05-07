export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ';

export interface Message {
  id: string;
  matchId: string;
  senderId: string;  // User id
  text: string;
  status: MessageStatus;
  createdAt: string;
}

export interface ChatRoom {
  matchId: string;
  messages: Message[];
  hasMore: boolean;
  cursor: string | null;
}
