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
    cur.execute("SELECT id, username, age, profile_pic, location, latitude, longitude, fame FROM users "
                "WHERE id != %s AND is_complete = true AND (gender = %s or gender = 'others') "
                "AND (sexual_preference = %s or sexual_preference = 'others')", (user_id, user_pref, user_gender))
    profiles = cur.fetchall()
    profile_list = []

    #get all tags
    id_list = [p[0] for p in profiles]
    if not id_list:
        ws.send(json.dumps({"type": "browseData", "profiles": []}))
        return
    cur.execute("SELECT user_id, tag FROM tags WHERE user_id IN %s", (tuple(id_list),))
    tag_rows = cur.fetchall()
    p_tags_mp = {}
    for p_id, tags in tag_rows:
        if p_id not in p_tags_mp:
            p_tags_mp[p_id] = set()
        p_tags_mp[p_id].add(tags)

    #build profile list
    profile_list = []
    for p_id, p_username, p_age, p_pfp, p_location, p_lat, p_long, p_fame in profiles:
        p_tags = p_tags_mp.get(p_id, set())
        common_tags_num = len(user_tags.intersection(p_tags))
        distance = calc_distance(user_lat, user_long, p_lat, p_long)
        score = 0.2*p_fame + common_tags_num - abs(user_age - p_age)*0.5 - distance*0.2 #algo designed for "smart matches"
        profile_list.append(Profile(p_id, p_username, p_age, p_location, common_tags_num, p_pfp, p_fame, score, distance))

    #process profiles based on specifications
    sort = obj.get("sort", "Default")
    order = obj.get("order", "desc")
    offset = obj.get("offset", 0)
    limit = obj.get("limit", 10)

    #rip python dh switch case
    if sort == "Default":
        profile_list.sort(key=lambda p: p.score, reverse=(True if order == "desc" else False))
    if sort == "Age":
        profile_list.sort(key=lambda p: p.age, reverse=(True if order == "desc" else False))
    if sort == "Fame":
        profile_list.sort(key=lambda p: p.fame, reverse=(True if order == "desc" else False))
    if sort == "Common Tags":
        profile_list.sort(key=lambda p: p.common_tags, reverse=(True if order == "desc" else False))
    if sort ==  "Location":
        profile_list.sort(key=lambda p: p.distance, reverse=(True if order == "desc" else False))

    #filter
    profile_list = [p for p in profile_list if 
                    (obj.get("min_age") <= p.age <= obj.get("max_age", 0)) and
                    (obj.get("min_fame") <= p.fame <= obj.get("max_fame")) and
                    (p.common_tags >= obj.get("min_common_tags")) and
                    (p.distance <= obj.get("max_distance"))]
    

    send_profiles = [p.to_dict() for p in profile_list[offset:offset + limit]]
    ws.send(json.dumps({"type": "browseData", "profiles": send_profiles}))