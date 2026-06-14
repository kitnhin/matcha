import os

class Profile:
    def __init__(self, user_id, username, age, location, common_tags, pfp, fame, score, distance):
        self.user_id = user_id
        self.username = username
        self.age = age
        self.location = location
        self.common_tags = common_tags
        self.pfp = pfp
        self.fame = fame
        self.score = score
        self.distance = distance
    
    def to_dict(self):
        return {
            "userId": self.user_id,
            "username": self.username,
            "age": self.age,
            "location": self.location,
            "commonTags": self.common_tags,
            "profilePic": self.pfp,
            "fame": self.fame,
        }