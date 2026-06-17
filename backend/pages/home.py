from extensions import conn, cur
import json


def get_user_home_data(ws, user_id, obj):

    # get the user's data
    cur.execute(
        "SELECT username, fame, profile_pic FROM users where id = %s", (user_id,)
    )
    user_data = cur.fetchone()

    # get available convos

    # get all ids which is mutually liked by the user
    cur.execute("SELECT liked_id FROM likes WHERE liker_id = %s", (user_id,))
    liked_ids = set(row[0] for row in cur.fetchall())
    cur.execute("SELECT liker_id FROM likes WHERE liked_id = %s", (user_id,))
    liker_ids = set(row[0] for row in cur.fetchall())
    mutual_ids = liked_ids.intersection(liker_ids)

    # extract info abt convo and the opposing user
    convos = []
    if mutual_ids:
        cur.execute(
            "SELECT id, username, profile_pic FROM users WHERE id IN %s",
            (tuple(mutual_ids),),
        )
        mutual_users = cur.fetchall()

        for other_id, other_username, pfp in mutual_users:
            cur.execute(
                "SELECT sender_id, content, created_at FROM messages WHERE"
                "(sender_id = %s AND receiver_id = %s) OR"
                "(sender_id = %s AND receiver_id = %s)",
                (other_id, user_id, user_id, other_id),
            )
            messages = cur.fetchall()
            if messages:
                last_message = max(messages, key=lambda x: x[2])
                last_sender = other_username if last_message[0] == other_id else "You"
            else:
                last_message = None
                last_sender = None
            convos.append(
                {
                    "otherUsername": other_username,
                    "otherPfp": pfp,
                    "lastMessage": last_message[1] if last_message else "",
                    "lastSender": last_sender
                }
            )

    ws.send(
        json.dumps(
            {
                "type": "userHomeData",
                "username": user_data[0],
                "fame": user_data[1],
                "profile_pic": user_data[2],
                "convos": convos,
            }
        )
    )
