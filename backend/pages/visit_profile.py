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

        "isUser": (profile_id == user_id)
    }))


    


    # id SERIAL PRIMARY KEY,
    # username TEXT UNIQUE NOT NULL,
    # email TEXT UNIQUE NOT NULL,
    # password TEXT NOT NULL,
    # first_name TEXT,
    # last_name TEXT,
    # gender TEXT,
    # sexual_preference TEXT,
    # biography TEXT,
    # fame INT DEFAULT 0,
    # latitude FLOAT,
    # longitude FLOAT,
    # location TEXT,
    # profile_pic TEXT,
    # age INT,
    # last_seen TIMESTAMP,
    # is_online BOOLEAN DEFAULT FALSE,
    # is_verified BOOLEAN DEFAULT FALSE,
    # is_complete BOOLEAN DEFAULT FALSE,
    # verification_token TEXT

    