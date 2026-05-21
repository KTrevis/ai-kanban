import z from 'zod';

const SEND_MESSAGE_TO_CARD = z.object({
  type: z.literal('create-session-from-card'),
  cardId: z.string(),
});

export type SendMessageToCardData = z.infer<typeof SEND_MESSAGE_TO_CARD>;

const SEND_MESSAGE_TO_SESSION = z.object({
  type: z.literal('send-message-to-session'),
  sessionId: z.string(),
  projectId: z.string(),
  message: z.string(),
});

export type SendMessageToSessionData = z.infer<typeof SEND_MESSAGE_TO_SESSION>;

export const SESSION_MESSAGE_SCHEMA = z.discriminatedUnion('type', [
  SEND_MESSAGE_TO_CARD,
  SEND_MESSAGE_TO_SESSION,
]);

export type SessionMessageData = z.infer<typeof SESSION_MESSAGE_SCHEMA>;
