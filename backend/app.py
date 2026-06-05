from flask import Flask, request, session
from flask_cors import CORS
from dotenv import load_dotenv
import os
import psycopg2
import bcrypt
from flask_mail import Mail, Message
import secrets
from email_validator import validate_email, EmailNotValidError

load_dotenv()
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cur = conn.cursor()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')
CORS(app, supports_credentials=True, origins=[os.getenv('FRONTEND_URL')])

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

mail = Mail(app)


@app.post("/auth/login")
def process_login():
    data = request.get_json()

    cur.execute("SELECT id, password FROM users where username = %s", (data["username"],))
    user = cur.fetchone()

    if not user:
        return {"loginStatus" : "fail", "errorMessage" : "Invalid username or password"}
    
    password_match = bcrypt.checkpw(data["password"].encode('utf-8'), user[1].encode('utf-8'))
    
    if not password_match:
        return {"loginStatus" : "fail", "errorMessage" : "Invalid username or password"}

    session["user_id"] = user[0]
    session["username"] = data["username"]
    return {"loginStatus" : "success"}

@app.post("/auth/register")
def process_register():
    data = request.get_json()

    #validate email format
    try:
        validate_email(data["email"])
    except EmailNotValidError as e:
        return {"registerStatus" : "fail", "errorMessage" : "Invalid email"}
    
    #check for duplicate email
    cur.execute("SELECT * FROM users where email = %s", (data["email"],))
    same_username_user = cur.fetchone()
    if same_username_user:
        return {"registerStatus" : "fail", "errorMessage" : "Email already exists"}


    #check for duplicate name
    cur.execute("SELECT * FROM users where username = %s", (data["username"],))
    same_username_user = cur.fetchone()
    if same_username_user:
        return {"registerStatus" : "fail", "errorMessage" : "Username already exists"}

    #store in db
    hashed_pw = bcrypt.hashpw(data["password"].encode('utf-8'), bcrypt.gensalt()) #hash pw first
    cur.execute("INSERT INTO users (email, username, first_name, last_name, password) VALUES (%s, %s, %s, %s, %s)",
                (data["email"], data["username"], data["first_name"], data["last_name"], hashed_pw.decode('utf-8'))) #store hashed pw in db, decode to convert bytes to string
    conn.commit() #save changes to db
    #extra info: use encode('utf-8') to convert string to bytes datatype
    

    # send the email
    token = secrets.token_urlsafe(32)
    cur.execute("UPDATE users set verification_token = %s where username = %s", (token, data["username"]))
    conn.commit()
    url = f"{os.getenv('FRONTEND_URL')}/auth/verify?token={token}"
    msg = Message("Verify your Matcha account", recipients=[data["email"]])
    msg.body = f"Click to verify your account:\n\n{url}"
    mail.send(msg)

    return {"registerStatus" : "success"}

@app.get("/auth/check")
def auth_check():
    if session.get("user_id"):
        return {"isLoggedIn" : True}
    return {"isLoggedIn" : False}

@app.post("/auth/logout")
def process_logout():
    session.clear()
    return {"logoutStatus" : "success"}

@app.get("/auth/verify")
def verify_user():
    token = request.args.get("token")
    cur.execute("SELECT * FROM users where verification_token = %s", (token,))
    user = cur.fetchone()
    if user:
        cur.execute("UPDATE users set is_verified = true, verification_token = NULL where verification_token = %s", (token,))
        conn.commit()
        return {"verificationStatus" : "success"}
    return {"verificationStatus" : "fail"}

app.run(debug=True, port=5050)





# @app.get("/api/test")
# def test():
#     return {"message": "Hello from flask22"}

# @app.get("/")
# def home():
#     return "Default route reached"