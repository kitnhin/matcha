from extensions import conn, cur
import json
import base64
from utils.auth_utils import check_email, check_name, check_other_fields


def check_settings_input(obj, user_id):
    
    check_email_res = check_email(obj.get("email", ""), user_id)
    if check_email_res["status"] == "fail":
        return {"saveSettingsStatus" : "fail", "errorMessage" : check_email_res["errorMessage"]}
    
    check_name_res = check_name(obj.get("username", ""), obj.get("first_name", ""), obj.get("last_name", ""), user_id)
    if check_name_res["status"] == "fail":
        return {"saveSettingsStatus" : "fail", "errorMessage" : check_name_res["errorMessage"]}

    check_other_fields_res = check_other_fields(obj.get("gender"), obj.get("sexual_preference"), obj.get("age"), 
                                                obj.get("location"), obj.get("latitude"), obj.get("longitude"))

    if check_other_fields_res["status"] == "fail":
        return {"saveSettingsStatus" : "fail", "errorMessage" : check_other_fields_res["errorMessage"]}
    
    return {"saveSettingsStatus": "success", "errorMessage": ""}


def get_user_settings_data(ws, user_id, obj):

    cur.execute(
    "SELECT email, username, first_name, last_name, gender, sexual_preference, "
    "age, biography, profile_pic, location, latitude, longitude "
    "FROM users WHERE id = %s", (user_id,))
    user_data = cur.fetchone()

    cur.execute("SELECT tag FROM tags WHERE user_id = %s", (user_id,))
    tags = [row[0] for row in cur.fetchall()]

    cur.execute("SELECT pic FROM pics WHERE user_id = %s", (user_id,))
    extra_pics = [row[0] for row in cur.fetchall()]

    ws.send(json.dumps({
        "type": "userSettingsData",
        "email": user_data[0],
        "username": user_data[1],
        "first_name": user_data[2],
        "last_name": user_data[3],
        "gender": user_data[4],
        "sexual_preference": user_data[5],
        "age": user_data[6],
        "bio": user_data[7],
        "profile_pic": user_data[8],
        "location": user_data[9],
        "latitude": user_data[10],
        "longitude": user_data[11],
        "tags": tags,
        "extra_pics": extra_pics
    }))

def save_settings(ws, user_id, obj):

    #validate input
    check_save_settings_res = check_settings_input(obj, user_id)
    if check_save_settings_res["saveSettingsStatus"] == "fail":
        return ws.send(json.dumps({"type": "saveSettingsStatus", "status": "fail", "errorMessage": check_save_settings_res["errorMessage"]}))

    # delete original tags and pics
    cur.execute("DELETE FROM tags WHERE user_id = %s", (user_id,))
    cur.execute("DELETE FROM pics WHERE user_id = %s", (user_id,))
    conn.commit()

    # store user data
    cur.execute("UPDATE users set username = %s, first_name = %s, last_name = %s, "
                "gender = %s, sexual_preference = %s, age = %s, biography = %s,"
                "location = %s, latitude = %s, longitude = %s, profile_pic = %s WHERE id = %s", 
                (obj.get("username"), obj.get("first_name"), obj.get("last_name"),
                 obj.get("gender"), obj.get("sexual_preference"), obj.get("age"), obj.get("bio"),
                 obj.get("location"), obj.get("latitude"), obj.get("longitude"), obj.get("profile_pic"),
                 user_id,))

    #store tags
    AVAILABLE_TAGS = ["vegan", "geek", "piercing", "gaming", "anime", "sports"]
    for tag in obj.get("tags"):
        if tag in AVAILABLE_TAGS:
            cur.execute("INSERT INTO tags (user_id, tag) VALUES (%s, %s)", (user_id, tag))

    #store pics
    for pic in obj.get("extra_pics"):
        cur.execute("INSERT INTO pics (user_id, pic) VALUES (%s, %s)", (user_id, pic))

    conn.commit()

    ws.send(json.dumps({"type": "saveSettingsStatus", "status" : "success", "errorMessage" : ""}))