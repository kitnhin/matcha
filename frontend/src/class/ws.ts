class WS {
  static ws: WebSocket | null = null;
  static callback_fts: Map<string, (data: any) => void> = new Map();

  static openChat: string | null = null;
  //stores if the user is currently opened a chat (goofy ahh place to store this but rly cant think of anywhere else rip)

  static setup() {
    if (WS.ws) {
      return;
    }

    WS.ws = new WebSocket(import.meta.env.VITE_WS_URL + "/ws");

    WS.ws.onmessage = (event: MessageEvent) => {
      console.log(event.data);
      const message = JSON.parse(event.data);
      const callback_ft = WS.callback_fts.get(message.type);
      if (callback_ft) {
        callback_ft(message);
      }
    };
  }

  static send(data: object) {
    if (!WS.ws) {
      WS.setup();
    }

    if (WS.ws && WS.ws.readyState === WebSocket.OPEN) {
      WS.ws.send(JSON.stringify(data));
    } else {
      WS.ws!.addEventListener(
        "open",
        () => {
          WS.ws!.send(JSON.stringify(data));
        },
        { once: true }
      );
    }
  }

  static add_callback(type: string, callback_ft: (data: any) => void) {
    if (!WS.ws) {
      WS.setup();
    }

    WS.callback_fts.set(type, callback_ft);
  }

  static remove_callback(type: string) {
    WS.callback_fts.delete(type);
  }

  static close() {
    if (WS.ws) {
      WS.ws.close();
      WS.ws = null;
    }
  }
}

export default WS;
