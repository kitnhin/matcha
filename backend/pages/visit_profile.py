from extensions import conn, cur
import json
from classes.ws_conn import ws_conn
from pages.home import get_user_home_data


def get_profile_data(ws, user_id, obj):

    profile_id = obj.get("profile_id")

    if profile_id == -1:
        profile_id = user_id

    cur.execute(
        "SELECT id, username, first_name, last_name, gender, sexual_preference, biography, fame, location, profile_pic, age FROM users WHERE id = %s",
        (profile_id,),
    )

    profile_data = cur.fetchone()

    if not profile_data:
        ws.send(
            json.dumps(
                {
                    "type": "getProfile",
                    "status": "fail",
                    "errorMessage": "Profile not found",
                }
            )
        )
        return

    # get extra pics
    cur.execute("SELECT pic FROM pics WHERE user_id = %s", (profile_id,))
    extra_pics = [row[0] for row in cur.fetchall()]

    # get tags
    cur.execute("SELECT tag FROM tags WHERE user_id = %s", (profile_id,))
    tags = [row[0] for row in cur.fetchall()]

    # get online status
    cur.execute("SELECT is_online FROM users WHERE id = %s", (profile_id,))
    is_online = cur.fetchone()[0]
    if is_online:
        online_status = "online"
    else:
        cur.execute("SELECT last_seen FROM users WHERE id = %s", (profile_id,))
        online_status = cur.fetchone()[0].strftime("%d %b, %H:%M")

    # get reported status
    cur.execute("SELECT * FROM reports WHERE reporter_id = %s AND reported_id = %s", (user_id, profile_id))
    is_reported = cur.fetchone() is not None

    # see if profile is liked and connected
    cur.execute(
        "SELECT * FROM likes WHERE liker_id = %s AND liked_id = %s",
        (user_id, profile_id),
    )
    is_liked = cur.fetchone() is not None
    if is_liked:
        cur.execute(
            "SELECT * FROM likes WHERE liker_id = %s AND liked_id = %s",
            (profile_id, user_id),
        )
        is_connected = cur.fetchone() is not None
    else:
        is_connected = False

    # update views db
    if profile_id != user_id:  # dont add view if its the user himself
        cur.execute(
            "INSERT INTO views (viewer_id, viewed_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
            (user_id, profile_id),
        )

    # if its the user himself, can send viewed and likes
    if profile_id == user_id:
        cur.execute("SELECT liker_id FROM likes WHERE liked_id = %s", (user_id,))
        liked_by = [row[0] for row in cur.fetchall()]
        cur.execute("SELECT viewer_id FROM views WHERE viewed_id = %s", (user_id,))
        viewed_by = [row[0] for row in cur.fetchall()]

        if liked_by:
            cur.execute("SELECT username FROM users WHERE id IN %s", (tuple(liked_by),))
            liked_by = [row[0] for row in cur.fetchall()]
        if viewed_by:
            cur.execute(
                "SELECT username FROM users WHERE id IN %s", (tuple(viewed_by),)
            )
            viewed_by = [row[0] for row in cur.fetchall()]
    else:
        other_ws = ws_conn.get(profile_id)
        if other_ws:
            cur.execute("SELECT username FROM users WHERE id = %s", (user_id,))
            username = cur.fetchone()[0]
            other_ws.send(
                json.dumps(
                    {
                        "type": "notif",
                        "senderUsername": username,
                        "message": f"{username} viewed your profile",
                    }
                )
            )

    ws.send(
        json.dumps(
            {
                "type": "getProfile",
                "status": "success",
                "profileId": profile_data[0],
                "username": profile_data[1],
                "firstName": profile_data[2],
                "lastName": profile_data[3],
                "gender": profile_data[4],
                "sexualPreference": profile_data[5],
                "biography": profile_data[6],
                "fame": profile_data[7],
                "location": profile_data[8],
                "profilePic": profile_data[9],
                "age": profile_data[10],
                "extraPics": extra_pics,
                "tags": tags,
                "onlineStatus": online_status,
                "isUser": (profile_id == user_id),
                "isLiked": is_liked,
                "isConnected": is_connected,
                "isReported": is_reported,
                "likedBy": liked_by if profile_id == user_id else None,
                "viewedBy": viewed_by if profile_id == user_id else None,
            }
        )
    )


def handle_like_profile(ws, user_id, obj):

    profile_id = obj.get("profile_id")

    # check if its the user himself
    if (profile_id == -1 or profile_id == user_id):  # profile_id -1 means the user himself
        ws.send(
            json.dumps(
                {
                    "type": "likeProfileStatus",
                    "status": "fail",
                    "errorMessage": "You cant like urself :D",
                    "likeStatus": not obj.get("like_status"),
                }
            )
        )
        return

    # check if user has pfp
    cur.execute("SELECT username, profile_pic FROM users WHERE id = %s", (user_id,))
    row = cur.fetchone()
    username = row[0]
    pfp = row[1]
    if not pfp:
        ws.send(
            json.dumps(
                {
                    "type": "likeProfileStatus",
                    "status": "fail",
                    "errorMessage": "Pfp required to like others",
                    "likeStatus": not obj.get("like_status"),
                }
            )
        )
        return

    # check if the other user has liked the user
    cur.execute(
            "SELECT * FROM likes WHERE liker_id = %s AND liked_id = %s",
            (profile_id, user_id),
        )
    other_liked = cur.fetchone()
    
    # do stuff based on like_status
    is_connected = False
    if obj.get("like_status") == True:
        cur.execute(
            "INSERT INTO likes (liker_id, liked_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
            (user_id, profile_id),
        )
        if other_liked:
            is_connected = True
        notif_msg = f"{username} liked your profile"
    else:
        cur.execute(
            "DELETE FROM likes WHERE liker_id =  %s AND liked_id = %s",
            (user_id, profile_id),
        )
        notif_msg = f"{username} unliked your profile"

    other_ws = ws_conn.get(profile_id)
    if other_ws:
        if other_liked:  # if the other already liked user, send json to show new chat for other user, and show connected in profile
            get_user_home_data(other_ws, profile_id, {"type": "getUserHomeData"})
        other_ws.send(json.dumps({"type": "notif", "senderUsername": username, "message": notif_msg}))
        other_ws.send(json.dumps({"type": "updateIsConnected", "isConnected": is_connected}))

    conn.commit()
    ws.send(
        json.dumps(
            {
                "type": "likeProfileStatus",
                "status": "success",
                "errorMessage": "",
                "likeStatus": obj.get("like_status"),
                "isConnected": is_connected,
            }
        )
    )
    ws.send(json.dumps({"type": "updateIsConnected", "isConnected": is_connected}))


def handle_report_profile(ws, user_id, obj):
    profile_id = obj.get("profile_id")
    
    if profile_id == -1 or profile_id == user_id:
        ws.send(
            json.dumps(
                {
                    "type": "reportProfileStatus",
                    "status": "fail",
                    "errorMessage": "You cant report urself :D",
                    "reportStatus": False,
                }
            )
        )
        return
    
    cur.execute("INSERT INTO reports (reporter_id, reported_id) VALUES (%s, %s) ON CONFLICT DO NOTHING", (user_id, profile_id))
    conn.commit()
    ws.send(json.dumps({"type": "reportProfileStatus", "status": "success", "errorMessage": "", "reportStatus": True}))