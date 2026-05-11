import Elysia from 'elysia';
import type { ElysiaWS } from 'elysia/ws';
import { WS_SERVER_PAYLOAD_SCHEMA } from './server-ws.schema';
import type { WsServerPayload } from './server-ws.schema';

class WebSockets {
  private websockets = new Map<string, ElysiaWS>();

  addSocket(id: string, ws: ElysiaWS) {
    this.websockets.set(id, ws);
  }

  removeSocket(id: string) {
    this.websockets.delete(id);
  }

  sendMessage(data: WsServerPayload, params?: { target?: string }) {
    if (params?.target !== undefined) {
      // TODO: add the possibility to target a ws through by id
      return;
    }
    this.websockets.forEach((ws) => {
      ws.send(data);
    });
  }
}

export const websockets = new WebSockets();

export const WS_CONTROLLER = new Elysia({ prefix: 'ws' }).ws('', {
  response: WS_SERVER_PAYLOAD_SCHEMA,
  open(ws) {
    websockets.addSocket(ws.id, ws);
  },
  close(ws) {
    websockets.removeSocket(ws.id);
  },
});
