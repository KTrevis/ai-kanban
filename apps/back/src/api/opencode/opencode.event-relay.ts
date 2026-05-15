import { websockets } from '../ws/ws.controller';
import { opencodeClient } from './opencode.controller';

let eventRelayStarted = false;

export function startOpencodeEventRelay() {
  if (eventRelayStarted) {
    return;
  }

  eventRelayStarted = true;
  void relayOpencodeEvents();
}

async function relayOpencodeEvents() {
  const { stream } = await opencodeClient.global.event({
    onSseError: (error) => console.error('opencode SSE error', error),
  });

  for await (const event of stream) {
    const payload = event.payload;

    if (payload.type === 'message.updated') {
      websockets.sendMessage({
        type: 'opencode.message.updated',
        sessionId: payload.properties.info.sessionID,
        message: payload.properties.info,
      });
    }

    if (payload.type === 'message.part.updated') {
      const { part, delta } = payload.properties;

      websockets.sendMessage({
        type: 'opencode.message.part.updated',
        sessionId: part.sessionID,
        messageId: part.messageID,
        part,
        content: getPartContent(part),
        delta,
      });
    }

    if (payload.type === 'session.idle') {
      websockets.sendMessage({
        type: 'opencode.session.idle',
        sessionId: payload.properties.sessionID,
      });
    }
  }
}

function getPartContent(part: { type: string; text?: string }) {
  if (part.type === 'text' || part.type === 'reasoning') {
    return part.text;
  }
}
