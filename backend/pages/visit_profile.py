from extensions import conn, cur
import json


def get_profile_data(ws, user_id, obj):

    profile_id = obj.get("profile_id")

    cur.execute("SELECT id, username, first_name, last_name, gender, sexual_preference, biography, fame, location, profile_pic, age FROM users WHERE id = %s", (profile_id,))

    profile_data = cur.fetchone()

    if not profile_data:
        ws.send(json.dumps({"type": "getProfile", "status": "fail", "errorMessage": "Profile not found"}))
        return
    
    #get extra pics
    cur.execute("SELECT pic FROM pics WHERE user_id = %s", (profile_id,))
    extra_pics = [row[0] for row in cur.fetchall()]

    #get tags
    cur.execute("SELECT tag FROM tags WHERE user_id = %s", (profile_id,))
    tags = [row[0] for row in cur.fetchall()]

    #see if profile is liked
    cur.execute("SELECT * FROM likes WHERE liker_id = %s AND liked_id = %s", (user_id, profile_id))
    is_liked = cur.fetchone() is not None

    ws.send(json.dumps({
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

        "isUser": (profile_id == user_id),
        "isLiked": is_liked
    }))


def handle_like_profile(ws, user_id, obj):

    #check if user has pfp
    cur.execute("SELECT profile_pic FROM users WHERE id = %s", (user_id,))
    pfp = cur.fetchone()[0]
    if not pfp:
        ws.send(json.dumps({"type": "likeProfileStatus", "status": "fail", "errorMessage": "Pfp required to like others", "likeStatus": not obj.get("like_status")}))
        return
    
    if obj.get("like_status") == True:
        cur.execute("INSERT INTO likes (liker_id, liked_id) VALUES (%s, %s) ON CONFLICT DO NOTHING", (user_id, obj.get("profile_id")))
    else:
        cur.execute("DELETE FROM likes WHERE liker_id =  %s AND liked_id = %s", (user_id, obj.get("profile_id")))

    conn.commit()
    ws.send(json.dumps({"type": "likeProfileStatus", "status": "success", "errorMessage": "", "likeStatus" : obj.get("like_status")}))
