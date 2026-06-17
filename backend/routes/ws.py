from flask import Blueprint, request, session
from flask_sock import Sock
import json
from classes.ws_conn import ws_conn
from pages.home import get_user_home_data
from pages.browse import get_browse_data
from pages.settings import get_user_settings_data
from pages.visit_profile import get_profile_data, handle_like_profile
from pages.settings import save_settings
from pages.research import get_research_data
from pages.chat import get_chat_data, handle_new_message


ws_bp = Blueprint("ws", __name__)
sock = Sock()

# handlers

handlers = {
    "get_user_home_data": get_user_home_data,
    "get_user_settings_data": get_user_settings_data,
    "save_settings": save_settings,
    "get_browse_data": get_browse_data,
    "get_profile_info": get_profile_data,
    "like_profile": handle_like_profile,
    "get_research_data": get_research_data,
    "get_chat_data": get_chat_data,
    "new_message": handle_new_message
}

#main websocket:
@sock.route("/ws")
def handle_websocket(ws):
    user_id = session.get("user_id")
    print(f"WebSocket connected, user_id: {user_id}")

    ws_conn.add(user_id, ws) #on connect

    try:
        while True:
            data = ws.receive()
            obj = json.loads(data)
            type = obj.get("type")
            print(f"Received from client {user_id}: {obj}")

            if type in handlers:
                handlers[type](ws, user_id, obj)
            # print(f"Received from client {user_id}: {obj}")
            # ws.send(json.dumps({"type": "test", "data": obj["message"]}))
            

    except Exception as e:
        ws_conn.remove(user_id)
        print(e)

