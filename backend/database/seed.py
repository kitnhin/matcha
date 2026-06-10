from faker import Faker
import random
import bcrypt
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv("../.env")
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cur = conn.cursor()

fake = Faker()

AVAILABLE_TAGS = ["vegan", "geek", "piercing", "gaming", "anime", "sports"]
GENDERS = ["male", "female", "others"]
PREFERENCES = ["male", "female", "others"]

last_id = 0

for i in range(10):
    username = fake.unique.user_name()
    email = fake.unique.email()
    first_name = fake.first_name()
    last_name = fake.last_name()
    password = bcrypt.hashpw("123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    gender = random.choice(GENDERS)
    sexual_preference = random.choice(PREFERENCES)
    age = random.randint(18, 45)
    fame = random.randint(0, 20)
    latitude = 51.5 + random.uniform(-0.1, 0.1)
    longitude = -0.1 + random.uniform(-0.1, 0.1)
    location = fake.city()

    cur.execute(
        "INSERT INTO users (username, email, first_name, last_name, password, "
        "gender, sexual_preference, age, fame, latitude, longitude, "
        "location, is_verified, is_complete) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, true, true) RETURNING id",
        (username, email, first_name, last_name, password, gender,
         sexual_preference, age, fame, latitude, longitude, location)
    )

    last_id = cur.fetchone()[0]

    for _ in range(random.randint(1, 3)):
        user_id = random.randint(1, last_id)
        tag_index = random.randint(0, len(AVAILABLE_TAGS)-1)
        cur.execute("INSERT INTO tags (user_id, tag) VALUES (%s, %s)", (user_id, AVAILABLE_TAGS[tag_index]))
    
conn.commit()
print("DONE SEEDING!!")

