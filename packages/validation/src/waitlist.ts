import { z } from 'zod';

export const WaitlistSchema = z.object({
  email: z.string().email().toLowerCase().trim().max(255),
  city: z.string().max(100).trim().optional(),
  acceptMarketing: z.boolean().default(false),
});

export type WaitlistInput = z.infer<typeof WaitlistSchema>;
