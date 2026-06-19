import json
from extensions import conn, cur

class ws_conn :
    conns = {}

    @staticmethod
    def add(user_id, ws):
        ws.send(json.dumps({"type": "test", "data": "hello from server, welcome websocket ~~"}))
        cur.execute("UPDATE users SET is_online = TRUE WHERE id = %s", (user_id,))
        conn.commit()
        ws_conn.conns[user_id] = ws
    
    @staticmethod
    def remove(user_id):
        print("WEBSOCKET CLOSED:", user_id)
        cur.execute("UPDATE users SET is_online = FALSE, last_seen = NOW() WHERE id = %s", (user_id,))
        ws_conn.conns.pop(user_id, None)

    @staticmethod
    def get(user_id):
        return ws_conn.conns[user_id] if user_id in ws_conn.conns else None