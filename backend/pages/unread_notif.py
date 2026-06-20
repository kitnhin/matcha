from extensions import conn, cur
import json

def get_unread_notifs(ws, user_id, obj):
    cur.execute("SELECT content FROM unread_notifs WHERE user_id = %s", (user_id,))
    unread_notifs = [row[0] for row in cur.fetchall()]
    ws.send(json.dumps({"type" : "unreadNotifs", "unreadNotifs": unread_notifs}))


def handle_clear_notifs(ws, user_id, obj):
    cur.execute("DELETE FROM unread_notifs WHERE user_id = %s", (user_id,))
    conn.commit()
    ws.send(json.dumps({"type": "clearNotifsStatus", "status": "success"}))