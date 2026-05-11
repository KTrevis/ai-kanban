import z from 'zod/v3';

export const WS_SERVER_PAYLOAD_SCHEMA = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('cards.updated'),
    projectId: z.string(),
  }),
  z.object({
    type: z.literal('opencode.message.updated'),
    sessionId: z.string(),
    message: z.unknown(),
  }),
  z.object({
    type: z.literal('opencode.message.part.updated'),
    sessionId: z.string(),
    messageId: z.string(),
    part: z.unknown(),
    content: z.string().optional(),
    delta: z.string().optional(),
  }),
]);

export type WsServerPayload = z.infer<typeof WS_SERVER_PAYLOAD_SCHEMA>;
