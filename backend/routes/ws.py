from flask import Blueprint, request, session
from flask_sock import Sock
import json
from pages.home import home_handler

ws_bp = Blueprint("ws", __name__)
sock = Sock()

# handlers

handlers = {
    "home": home_handler
}



#main websocket:
@sock.route("/ws")
def handle_websocket(ws):
    user_id = session.get("user_id")
    print(f"WebSocket connected, user_id: {user_id}")

    ws.send(json.dumps({"type": "test", "data": "hello from server, welcome websocket ~~"})) #on connect

    try:
        while True:
            data = ws.receive()
            obj = json.loads(data)
            page = obj.get("page")
            if page in handlers:
                handlers[page](ws, user_id, obj)
            # print(f"Received from client {user_id}: {obj}")
            # ws.send(json.dumps({"type": "test", "data": obj["message"]}))
            

    except Exception as e:
        print(f"WEBSOCKET DCED: {e}")

