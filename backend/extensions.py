import os
import psycopg2
from flask_mail import Mail

conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cur = conn.cursor()
mail = Mail()
