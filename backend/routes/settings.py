from extensions import conn, cur
import json
from flask import request, session, Blueprint
from utils.auth_utils import check_settings_input
import base64

settings_bp = Blueprint("settings", __name__)

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

@settings_bp.post("/settings/save")
def save_settings():
    user_id = session.get("user_id")

    #validate input
    check_save_settings_res = check_settings_input(request)
    if check_save_settings_res["saveSettingsStatus"] == "fail":
        return check_save_settings_res
    
    # delete original tags and pics
    cur.execute("DELETE FROM tags WHERE user_id = %s", (user_id,))
    cur.execute("DELETE FROM pics WHERE user_id = %s", (user_id,))
    conn.commit()

    # store user data
    cur.execute("UPDATE users set username = %s, first_name = %s, last_name = %s, "
                "gender = %s, sexual_preference = %s, age = %s, biography = %s,"
                "location = %s, latitude = %s, longitude = %s where id = %s", 
                (request.form.get("username"), request.form.get("first_name"), request.form.get("last_name"),
                 request.form.get("gender"), request.form.get("sexual_preference"), request.form.get("age"), request.form.get("bio"),
                 request.form.get("location"), request.form.get("latitude"), request.form.get("longitude"), 
                 user_id,))
    
    profile_pic = request.files.get("profile_pic")
    if profile_pic:
        pfp_base64 = base64.b64encode(profile_pic.read()).decode("utf-8")
        cur.execute("UPDATE users set profile_pic = %s where id = %s", (pfp_base64, user_id))
    else:
        cur.execute("UPDATE users set profile_pic = NULL where id = %s", (user_id,))

    #store tags
    AVAILABLE_TAGS = ["vegan", "geek", "piercing", "gaming", "anime", "sports"]
    for tag in request.form.getlist("tags"):
        if tag in AVAILABLE_TAGS:
            cur.execute("INSERT INTO tags (user_id, tag) VALUES (%s, %s)", (user_id, tag))

    #store pics
    for pic in request.files.getlist("extra_pics"):
        pic_base64 = base64.b64encode(pic.read()).decode("utf-8")
        cur.execute("INSERT INTO pics (user_id, pic) VALUES (%s, %s)", (user_id, pic_base64))

    conn.commit()

    return {"saveSettingsStatus" : "success", "errorMessage" : ""}