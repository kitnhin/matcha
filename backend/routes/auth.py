from flask import Blueprint, request, session
import bcrypt
from flask_mail import Message
import secrets
from extensions import conn, cur, mail
import os
import base64
from utils.auth_utils import check_register_input, check_setup_input, check_login_input, check_password
from email_validator import validate_email, EmailNotValidError

auth_bp = Blueprint('auth', __name__)

@auth_bp.post("/auth/login")
def process_login():
    data = request.get_json()

    #checks
    check_login_res = check_login_input(data)
    if check_login_res["loginStatus"] == "fail":
        return {"loginStatus" : "fail", "errorMessage" : "Invalid username or password"}

    cur.execute("SELECT id, password FROM users WHERE username = %s", (data["username"],))
    user = cur.fetchone()

    if not user:
        return {"loginStatus" : "fail", "errorMessage" : "Invalid username or password"}
    
    password_match = bcrypt.checkpw(data["password"].encode('utf-8'), user[1].encode('utf-8'))
    
    if not password_match:
        return {"loginStatus" : "fail", "errorMessage" : "Invalid username or password"}
    
    #get user data
    cur.execute("SELECT is_complete FROM users WHERE username = %s", (data["username"],))
    is_complete = cur.fetchone()[0]

    session["user_id"] = user[0]
    session["username"] = data["username"]
    return {"loginStatus" : "success", "isComplete" : is_complete}


@auth_bp.post("/auth/register")
def process_register():
    data = request.get_json()

    #validate input
    check_register_res = check_register_input(data)
    if check_register_res["registerStatus"] == "fail":
        return check_register_res

    #store in db
    hashed_pw = bcrypt.hashpw(data["password"].encode('utf-8'), bcrypt.gensalt()) #hash pw first
    cur.execute("INSERT INTO users (email, username, first_name, last_name, password) VALUES (%s, %s, %s, %s, %s)",
                (data["email"], data["username"], data["first_name"], data["last_name"], hashed_pw.decode('utf-8'))) #store hashed pw in db, decode to convert bytes to string
    conn.commit() #save changes to db
    #extra info: use encode('utf-8') to convert string to bytes datatype
    

    # send the email
    token = secrets.token_urlsafe(42)
    cur.execute("UPDATE users set verification_token = %s WHERE username = %s", (token, data["username"]))
    conn.commit()
    url = f"{os.getenv('FRONTEND_URL')}/verify-email?token={token}"
    msg = Message(subject="Verify your Matcha account",
                  recipients=[data["email"]],
                  body = f"Click to verify your account:\n\n{url}")
    mail.send(msg)

    return {"registerStatus" : "success"}

@auth_bp.get("/auth/check")
def auth_check():
    user_id = session.get("user_id")
    if user_id:
        cur.execute("SELECT is_complete FROM users WHERE id = %s", (user_id,))
        is_complete = cur.fetchone()[0]
        return {"isLoggedIn" : True, "isComplete" : is_complete}
    return {"isLoggedIn" : False}

@auth_bp.post("/auth/logout")
def process_logout():
    session.clear()
    return {"logoutStatus" : "success"}

@auth_bp.get("/auth/verify")
def verify_user():
    token = request.args.get("token")
    cur.execute("SELECT * FROM users WHERE verification_token = %s", (token,))
    user = cur.fetchone()
    if user:
        cur.execute("UPDATE users set is_verified = true, verification_token = NULL WHERE verification_token = %s", (token,))
        conn.commit()
        return {"verificationStatus" : "success"}
    return {"verificationStatus" : "fail"}

@auth_bp.post("/auth/setup")
def process_setup():
    print("form data: ", request.form)
    print("form files: ", request.files)
    user_id = session.get("user_id")

    #validate input
    check_setup_input_res = check_setup_input(request)
    if check_setup_input_res["setupStatus"] == "fail":
        return check_setup_input_res

    # store user data
    cur.execute("UPDATE users set gender = %s, sexual_preference = %s, age = %s, biography = %s,"
                "location = %s, latitude = %s, longitude = %s WHERE id = %s", 
                (request.form.get("gender"), request.form.get("sexual_preference"), request.form.get("age"), request.form.get("bio"),
                 request.form.get("location"), request.form.get("latitude"), request.form.get("longitude"), 
                 user_id))
    
    profile_pic = request.files.get("profile_pic")
    if profile_pic:
        pfp_base64 = base64.b64encode(profile_pic.read()).decode("utf-8")
        cur.execute("UPDATE users set profile_pic = %s WHERE id = %s", (pfp_base64, user_id))

    # #store tags
    AVAILABLE_TAGS = ["vegan", "geek", "piercing", "gaming", "anime", "sports"]
    for tag in request.form.getlist("tags"):
        if tag in AVAILABLE_TAGS:
            cur.execute("INSERT INTO tags (user_id, tag) VALUES (%s, %s)", (user_id, tag))

    #store pics
    for pic in request.files.getlist("extra_pics"):
        pic_base64 = base64.b64encode(pic.read()).decode("utf-8")
        cur.execute("INSERT INTO pics (user_id, pic) VALUES (%s, %s)", (user_id, pic_base64))

    cur.execute("UPDATE users set is_complete = true WHERE id = %s", (user_id,)) #mark user as complete after setup finishes
    conn.commit()

    return {"setupStatus" : "success", "errorMessage" : ""}


@auth_bp.post("/auth/forgot-password")
def forgot_password():
    data = request.get_json()

    #email validation
    try:
        validate_email(data["email"])
    except EmailNotValidError as e:
        return {"forgotPasswordStatus" : "fail", "errorMessage" : "Invalid email"}

    #store in db
    cur.execute("SELECT * FROM users WHERE email = %s", (data["email"],))
    user = cur.fetchone()
    if not user:
        return {"forgotPasswordStatus" : "fail", "errorMessage" : "Email not found"}
    
    #handle edge case if user isnt verified
    cur.execute("SELECT is_verified FROM users WHERE email = %s", (data["email"],))
    user = cur.fetchone()
    if not user or not user[0]:
        return {"forgotPasswordStatus" : "fail", "errorMessage" : "No account with this email is found"}

    # send the email
    token = secrets.token_urlsafe(42)
    cur.execute("UPDATE users set verification_token = %s WHERE email = %s", (token, data["email"]))
    conn.commit()
    url = f"{os.getenv('FRONTEND_URL')}/reset-password?token={token}"
    msg = Message(subject="Reset your matcha password",
                  recipients=[data["email"]],
                  body = f"Click to reset your password:\n\n{url}")
    mail.send(msg)

    return {"forgotPasswordStatus" : "success"}


@auth_bp.get("/auth/verify-forgot-password")
def verify_forgot_password():
    token = request.args.get("token")
    cur.execute("SELECT * FROM users WHERE verification_token = %s", (token,))
    user = cur.fetchone()
    if user:
        return {"verifyStatus" : "success"}
    return {"verifyStatus" : "fail", "errorMessage" : "Invalid or expired token"}

@auth_bp.post("/auth/save-forgot-password")
def save_forgot_password():
    token = request.args.get("token")
    data = request.get_json()
    password = data.get("password")

    #verify token
    cur.execute("SELECT * FROM users WHERE verification_token = %s", (token,))
    user = cur.fetchone()
    if not user:
        return {"saveStatus" : "fail", "errorMessage" : "Invalid or expired token"}

    #verify password
    check_password_res = check_password(password)
    if check_password_res["status"] == "fail":
            return {"saveStatus" : "fail", "errorMessage" : check_password_res["errorMessage"]}
    
    #update password in db
    hashed_pw = bcrypt.hashpw(data["password"].encode('utf-8'), bcrypt.gensalt()) #hash pw first
    cur.execute("UPDATE users set password = %s, verification_token = NULL WHERE verification_token = %s", 
                (hashed_pw.decode('utf-8'), token))
    conn.commit()
    
    return {"saveStatus" : "success"}