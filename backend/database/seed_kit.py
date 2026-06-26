from faker import Faker
import random
import bcrypt
import psycopg2
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
import base64

load_dotenv("../.env")
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cur = conn.cursor()

# kit
with open("./photo/elaina.jpg", "rb") as f:
    pfp = base64.b64encode(f.read()).decode()

username = "kit"
email = "ethanlimck@gmail.com"
first_name = "first"
last_name = "last"
password = bcrypt.hashpw("123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
gender = "male"
sexual_preference = "female"
age = 22
fame = 0
latitude = 3.08601
longitude = 101.58754
location = "Shah Alam, Selangor, Malaysia"
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

tags = ["gaming", "anime"]
for tag in tags:
    cur.execute("INSERT INTO tags (user_id, tag) VALUES (%s, %s)", (last_id, tag))


#kit2
with open("./photo/carlotta.jpg", "rb") as f:
    pfp = base64.b64encode(f.read()).decode()

username = "kit2"
email = "ethanlimck2@gmail.com"
first_name = "fi"
last_name = "la"
password = bcrypt.hashpw("123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
gender = "female"
sexual_preference = "male"
age = 22
fame = 0
latitude = 3.08601
longitude = 101.58754
location = "Shah Alam, Selangor, Malaysia"
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

tags = ["gaming", "anime"]
for tag in tags:
    cur.execute("INSERT INTO tags (user_id, tag) VALUES (%s, %s)", (last_id, tag))

conn.commit()


print("DONE SEEDING!!")