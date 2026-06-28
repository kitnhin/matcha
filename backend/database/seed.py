from faker import Faker
import random
import bcrypt
import psycopg2
from dotenv import load_dotenv
import os
import base64

load_dotenv("../.env")
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cur = conn.cursor()

fake = Faker()

AVAILABLE_TAGS = ["vegan", "geek", "piercing", "gaming", "anime", "sports"]
GENDERS = ["male", "female", "others"]
PREFERENCES = ["male", "female", "others"]
PFPS = [
    "./photo/carlotta.jpg",
    "./photo/cat.webp",
    "./photo/cat2.png",
    "./photo/elaina.jpg",
    "./photo/furina.webp",
    "./photo/hutao.png",
    "./photo/sparkle.jpg",
]
pfps_base64 = []
last_id = 0
for pfp in PFPS:
    with open(pfp, "rb") as f:
        pfp_base64 = base64.b64encode(f.read()).decode()
        pfps_base64.append(pfp_base64)

for i in range(50):
    username = fake.unique.user_name()
    email = fake.unique.email()
    first_name = fake.first_name()
    last_name = fake.last_name()
    password = bcrypt.hashpw("123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    gender = random.choice(GENDERS)
    sexual_preference = random.choice(PREFERENCES)
    age = random.randint(18, 45)
    fame = random.randint(0, 20)
    pfp = random.choice(pfps_base64)
    latitude = 51.5 + random.uniform(-0.1, 0.1)
    longitude = -0.1 + random.uniform(-0.1, 0.1)
    location = fake.city()
    from datetime import datetime, timedelta
    last_seen = datetime.now() - timedelta(minutes=random.randint(0, 10080))

    cur.execute(
        "INSERT INTO users (username, email, first_name, last_name, password, "
        "gender, sexual_preference, age, fame, latitude, longitude, "
        "location, is_verified, is_complete, last_seen, profile_pic) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, true, true, %s, %s) RETURNING id",
        (username, email, first_name, last_name, password, gender,
        sexual_preference, age, fame, latitude, longitude, location, last_seen, pfp)
    )

    last_id = cur.fetchone()[0]
    chosen_tags = random.sample(AVAILABLE_TAGS, random.randint(0, len(AVAILABLE_TAGS)))
    for tag in chosen_tags:
        cur.execute("INSERT INTO tags (user_id, tag) VALUES (%s, %s)", (last_id, tag))
    
conn.commit()
print("DONE SEEDING!!")

