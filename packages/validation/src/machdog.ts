import { z } from 'zod';

export const SwipeSchema = z.object({
  swipeeId:  z.string().min(1),
  direction: z.enum(['LIKE', 'PASS']),
});

export const SendMessageSchema = z.object({
  text: z.string().min(1).max(2000).trim(),
});
