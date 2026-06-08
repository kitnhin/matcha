from flask import Blueprint, request, session
import bcrypt
from flask_mail import Mail, Message
import secrets
from email_validator import validate_email, EmailNotValidError
from extensions import conn, cur, mail
import os
import base64

auth_bp = Blueprint('auth', __name__)

@auth_bp.post("/auth/login")
def process_login():
    data = request.get_json()

    #checks
    cur.execute("SELECT id, password FROM users where username = %s", (data["username"],))
    user = cur.fetchone()

    if not user:
        return {"loginStatus" : "fail", "errorMessage" : "Invalid username or password"}
    
    password_match = bcrypt.checkpw(data["password"].encode('utf-8'), user[1].encode('utf-8'))
    
    if not password_match:
        return {"loginStatus" : "fail", "errorMessage" : "Invalid username or password"}
    

    #get user data
    cur.execute("SELECT is_complete FROM users where username = %s", (data["username"],))
    is_complete = cur.fetchone()[0]

    session["user_id"] = user[0]
    session["username"] = data["username"]
    return {"loginStatus" : "success", "isComplete" : is_complete}

@auth_bp.post("/auth/register")
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
    token = secrets.token_urlsafe(42)
    cur.execute("UPDATE users set verification_token = %s where username = %s", (token, data["username"]))
    conn.commit()
    url = f"{os.getenv('FRONTEND_URL')}/auth/verify?token={token}"
    msg = Message(subject="Verify your Matcha account",
                  recipients=[data["email"]],
                  body = f"Click to verify your account:\n\n{url}")
    mail.send(msg)

    return {"registerStatus" : "success"}

@auth_bp.get("/auth/check")
def auth_check():
    if session.get("user_id"):
        return {"isLoggedIn" : True}
    return {"isLoggedIn" : False}

@auth_bp.post("/auth/logout")
def process_logout():
    session.clear()
    return {"logoutStatus" : "success"}

@auth_bp.get("/auth/verify")
def verify_user():
    token = request.args.get("token")
    cur.execute("SELECT * FROM users where verification_token = %s", (token,))
    user = cur.fetchone()
    if user:
        cur.execute("UPDATE users set is_verified = true, verification_token = NULL where verification_token = %s", (token,))
        conn.commit()
        return {"verificationStatus" : "success"}
    return {"verificationStatus" : "fail"}

@auth_bp.post("/auth/setup")
def process_setup():
    print("form data: ", request.form)
    print("form files: ", request.files)
    username = session.get("username")

    ################################
    ##Check for valid input hereee##
    ################################

    # store user data
    profile_pic = request.files.get("profile_pic")
    pfp_base64 = base64.b64encode(profile_pic.read()).decode("utf-8")
    cur.execute("UPDATE users set gender = %s, sexual_preference = %s, "
                "location = %s, latitude = %s, longitude = %s, "
                "profile_pic = %s where username = %s", (request.form.get("gender"), request.form.get("sexual_preference"),
                                        request.form.get("location"), request.form.get("latitude"), request.form.get("longitude"), 
                                        pfp_base64, username))
    conn.commit()

    # #store tags
    AVAILABLE_TAGS = ["vegan", "geek", "piercing", "gaming", "anime", "sports"]
    cur.execute("SELECT id FROM users where username = %s", (username,))
    user_id = cur.fetchone()[0]
    for tag in request.form.getlist("tags"):
        if tag in AVAILABLE_TAGS:
            cur.execute("INSERT INTO tags (user_id, tag) VALUES (%s, %s)", (user_id, tag))

    #store pics
    for pic in request.files.getlist("extra_pics"):
        pic_base64 = base64.b64encode(pic.read()).decode("utf-8")
        cur.execute("INSERT INTO pics (user_id, pic) VALUES (%s, %s)", (user_id, pic_base64))
    conn.commit()
    
    return {"setupStatus" : "fail", "errorMessage" : "Not implemented yet"}