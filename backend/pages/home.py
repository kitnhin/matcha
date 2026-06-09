from extensions import conn, cur
import json

def get_user_home_data(ws, user_id, obj):
    cur.execute("SELECT username, fame, profile_pic FROM users where id = %s", (user_id,))
    user_data = cur.fetchone()
    ws.send(json.dumps({"type": "userHomeData", "username": user_data[0], "fame": user_data[1], "profile_pic": user_data[2]}))
