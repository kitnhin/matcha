class Profile:
    def __init__(self, id, username, age, location, common_tags, pfp, fame, score):
        self.id = id
        self.username = username
        self.age = age
        self.location = location
        self.common_tags = common_tags
        self.pfp = pfp
        self.fame = fame
        self.score = score
    
    def to_dict(self):
        return {
            "profile_link": f"link/{id}",
            "username": self.username,
            "age": self.age,
            "location": self.location,
            "common_tags": self.common_tags,
            "profile_pic": self.pfp,
            "fame": self.fame,
        }