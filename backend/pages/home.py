from extensions import conn, cur
import json

def get_user_display_data(ws, user_id, obj):
    cur.execute("SELECT username, fame, profile_pic FROM users where id = %s", (user_id,))
    user_data = cur.fetchone()
    ws.send(json.dumps({"type": "user_display_data", "username": user_data[0], "fame": user_data[1], "profile_pic": user_data[2]}))


def home_handler(ws, user_id, obj):
    if obj["type"] == "get_user_display_data":
        get_user_display_data(ws, user_id, obj)
