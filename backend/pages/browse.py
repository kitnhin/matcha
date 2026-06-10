from extensions import conn, cur
import json
import math
from classes.profile import Profile

def calc_distance(lat1, long1, lat2, long2):
    return math.sqrt((lat1 - lat2)**2 + (long1 - long2)**2)


def get_browse_data(ws, user_id, obj):
    #get user info
    cur.execute("SELECT gender, sexual_preference, age, latitude, longitude FROM users WHERE id = %s", (user_id,))
    user = cur.fetchone()
    user_gender, user_pref, user_age, user_lat, user_long = user

    cur.execute("SELECT tag from tags WHERE user_id = %s", (user_id,))
    user_tags = set(row[0] for row in cur.fetchall())

    #get potential matches
    cur.execute("SELECT id FROM users "
                "WHERE id != %s AND is_complete = true AND (gender = %s or gender = 'others') "
                "AND (sexual_preference = %s or sexual_preference = 'others')", (user_id, user_pref, user_gender))
    profile_ids = cur.fetchall()
    profile_list = []

    for p_id in profile_ids:
        cur.execute("SELECT username, age, profile_pic, location, latitude, longitude, fame FROM users WHERE id = %s", (p_id,))
        p_username, p_age, p_pfp, p_location, p_lat, p_long, p_fame = cur.fetchone()

        cur.execute("SELECT tag FROM tags WHERE user_id = %s", (p_id))
        p_tags = set(row[0] for row in cur.fetchall())
        common_tags_num = len(user_tags.intersection(p_tags))

        score = 0.2*p_fame + common_tags_num - abs(user_age - p_age)*0.5 - calc_distance(user_lat, user_long, p_lat, p_long)*0.2
        profile_list.append(Profile(p_id, p_username, p_age, p_location, common_tags_num, p_pfp, p_fame, score))

    profile_list.sort(key=lambda p: p.score, reverse=True)
    top_profiles = [p.to_dict() for p in profile_list[:10]] #take the top profiles
    ws.send(json.dumps({"type": "browseData", "profiles": top_profiles}))