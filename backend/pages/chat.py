from extensions import conn, cur
from classes.ws_conn import ws_conn
import json


def get_chat_data(ws, user_id, obj):
    other_username = obj.get("other_username")

    #check if user exists
    cur.execute("SELECT id FROM users WHERE username = %s", (other_username,))
    other_id = cur.fetchone()[0]

    if not other_id:
        ws.send(
            json.dumps(
                {
                    "type": "getChatData",
                    "status": "fail",
                    "errorMessage": "User not found",
                }
            )
        )
        return
    
    #checked if they liked each other
    cur.execute("SELECT * FROM likes WHERE liker_id = %s AND liked_id = %s", (user_id, other_id))
    user_liked = cur.fetchone()
    cur.execute("SELECT * FROM likes WHERE liker_id = %s AND liked_id = %s", (other_id, user_id))
    liked_user = cur.fetchone()
    if not user_liked or not liked_user:
        ws.send(
            json.dumps(
                {
                    "type": "getChatData",
                    "status": "fail",
                    "errorMessage": "You are no longer connected with this user",
                }
            )
        )
        return


    # get convo messages
    cur.execute(
        "SELECT sender_id, content, created_at FROM messages WHERE"
        "(sender_id = %s AND receiver_id = %s) OR"
        "(sender_id = %s AND receiver_id = %s) ORDER BY created_at ASC",
        (other_id, user_id, user_id, other_id),
    )
    messages = cur.fetchall()

    msgs_list = []
    for msg in messages:
        sender = other_username if msg[0] == other_id else "You"
        msgs_list.append({"senderUsername": sender, "content": msg[1]})

    # get pfps
    cur.execute("SELECT profile_pic FROM users WHERE id = %s", (user_id,))
    user_pfp = cur.fetchone()[0]
    cur.execute("SELECT profile_pic FROM users WHERE id = %s", (other_id,))
    other_pfp = cur.fetchone()[0]

    ws.send(
        json.dumps(
            {
                "type": "getChatData",
                "status": "success",
                "messages": msgs_list,
                "userPfp": user_pfp,
                "otherPfp": other_pfp,
            }
        )
    )


def handle_new_message(ws, user_id, obj):
    other_username = obj.get("other_username")
    content = obj.get("content")

    cur.execute("SELECT id FROM users WHERE username = %s", (other_username,))
    other_id = cur.fetchone()[0]

    if not other_id:
        ws.send(
            json.dumps(
                {
                    "type": "newMessage",
                    "status": "fail",
                    "errorMessage": "User not found",
                }
            )
        )
        return
    
    #checked if they liked each other
    cur.execute("SELECT * FROM likes WHERE liker_id = %s AND liked_id = %s", (user_id, other_id))
    user_liked = cur.fetchone()
    cur.execute("SELECT * FROM likes WHERE liker_id = %s AND liked_id = %s", (other_id, user_id))
    liked_user = cur.fetchone()
    if not user_liked or not liked_user:
        ws.send(
            json.dumps(
                {
                    "type": "newMessage",
                    "status": "fail",
                    "errorMessage": "You are no longer connected with this user",
                }
            )
        )
        return

    if content is None or content.strip() == "":
        return

    # insert new message into db
    cur.execute(
        "INSERT INTO messages (sender_id, receiver_id, content) VALUES (%s, %s, %s)",
        (user_id, other_id, content),
    )
    conn.commit()

    # get sender username
    cur.execute("SELECT username FROM users WHERE id = %s", (user_id,))
    sender_username = cur.fetchone()[0]

    # send jsons
    ws.send(
        json.dumps(
            {
                "type": "newMessage",
                "status": "success",
                "newMessage": {"senderUsername": "You", "content": content},
            }
        )
    )
    ws.send(
        json.dumps(
            {
                "type": "updateConvoHome",
                "status": "success",
                "otherUsername": other_username,
                "newMessage": {"senderUsername": "You", "content": content},
            }
        )
    )
    other_ws = ws_conn.get(other_id)
    if other_ws:
        other_ws.send(
            json.dumps(
                {
                    "type": "newMessage",
                    "status": "success",
                    "newMessage": {
                        "senderUsername": sender_username,
                        "content": content,
                    },
                }
            )
        )
        other_ws.send(
            json.dumps(
                {
                    "type": "updateConvoHome",
                    "status": "success",
                    "otherUsername": sender_username,
                    "newMessage": {
                        "senderUsername": sender_username,
                        "content": content,
                    },
                }
            )
        )
        other_ws.send(
            json.dumps(
                {
                    "type": "notif",
                    "senderUsername": sender_username,
                    "message": f"New message from {sender_username}",
                }
            )
        )
    else: #store notif
        cur.execute("INSERT into unread_notifs (user_id, content) VALUES (%s, %s)", (other_id, f"New message from {sender_username}"))
        conn.commit()
    
