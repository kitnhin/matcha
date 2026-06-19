from extensions import conn, cur
import json
import math
from classes.profile import Profile

def calc_distance(lat1, long1, lat2, long2):
    return math.sqrt((lat1 - lat2)**2 + (long1 - long2)**2)


def get_research_data(ws, user_id, obj):
    print(obj)
    #get user info
    cur.execute("SELECT tag from tags WHERE user_id = %s", (user_id,))
    user_tags = set(row[0] for row in cur.fetchall())

    #get other profiles
    cur.execute("SELECT id, username, age, profile_pic, location, fame FROM users "
                "WHERE id != %s", (user_id,))
    profiles = cur.fetchall()
    profile_list = []

    #get all tags
    id_list = [p[0] for p in profiles]
    if not id_list:
        ws.send(json.dumps({"type": "browseData", "profiles": [], "errorMessage": "db empty i think"}))
        return
    cur.execute("SELECT user_id, tag FROM tags WHERE user_id IN %s", (tuple(id_list),))
    tag_rows = cur.fetchall()
    p_tags_mp = {}
    for p_id, tags in tag_rows:
        if p_id not in p_tags_mp:
            p_tags_mp[p_id] = set()
        p_tags_mp[p_id].add(tags)

    #get all blocks
    cur.execute("SELECT blocked_id FROM blocks WHERE blocker_id = %s", (user_id,))
    blocked_ids = set(row[0] for row in cur.fetchall())

    #build profile list
    profile_list = []
    for p_id, p_username, p_age, p_pfp, p_location, p_fame in profiles:

        if p_id in blocked_ids:
            continue
        
        p_tags = p_tags_mp.get(p_id, set())
        common_tags_num = len(user_tags.intersection(p_tags))
        profile_list.append(Profile(p_id, p_username, p_age, p_location, common_tags_num, p_pfp, p_fame, 0, 0, p_tags))

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
                    (p.distance <= obj.get("max_distance")) and
                    (obj.get("location") is None or p.location == obj.get("location").get("place_name")) and
                    (obj.get("tags", []) == [] or set(obj.get("tags", [])).issubset(p.tags))]
    

    send_profiles = [p.to_dict() for p in profile_list[offset:offset + limit]]
    ws.send(json.dumps({"type": "researchData", "profiles": send_profiles}))