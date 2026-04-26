import z from 'zod/v3';

export const WS_SERVER_PAYLOAD_SCHEMA = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('message.part.updated'),
    text: z.string(),
    sessionId: z.string(),
  }),
]);

export type WsServerPayload = z.infer<typeof WS_SERVER_PAYLOAD_SCHEMA>;
