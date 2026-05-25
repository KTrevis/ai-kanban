import z from 'zod';

export const SEND_MESSAGE_TO_CARD_SCHEMA = z.object({
  cardId: z.string(),
});

export type SendMessageToCardData = z.infer<typeof SEND_MESSAGE_TO_CARD_SCHEMA>;

export const SEND_MESSAGE_TO_SESSION_SCHEMA = z.object({
  sessionId: z.string(),
  projectId: z.string(),
  message: z.string(),
});

export type SendMessageToSessionData = z.infer<
  typeof SEND_MESSAGE_TO_SESSION_SCHEMA
>;
