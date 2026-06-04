from flask import Flask, request, session
from flask_cors import CORS
from dotenv import load_dotenv
import os
import psycopg2

load_dotenv()
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cur = conn.cursor()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')
CORS(app, supports_credentials=True, origins=[os.getenv('FRONTEND_URL')])


@app.post("/auth/login")
def process_login():
    data = request.get_json()
    ##############################
    # Check for login status heree
    ###############################
    
    #tmp stuffs
    loginSuccess = True #tmp set true
    user_id = 123
    username = "UrMom"

    if loginSuccess:
        session["user_id"] = user_id
        session["username"] = username
        return {"loginStatus" : "success"}

@app.post("/auth/register")
def process_register():
    data = request.get_json()
    register_success = True
    error_message = ""

    #check for duplicate name
    cur.execute("SELECT * FROM users where username = %s", (data["username"],))
    same_username_user = cur.fetchone()
    if same_username_user:
        register_success = False
        error_message = "Username already exists"

    if not register_success:
        return {"registerStatus" : "fail", "errorMessage" : error_message}

    #insert into db (RMBBBB IMPLEMENT HASH PW LATERRRRRR!!!!!)
    cur.execute("INSERT INTO users (email, username, first_name, last_name, password) VALUES (%s, %s, %s, %s, %s)",
                (data["email"], data["username"], data["first_name"], data["last_name"], data["password"]))
    conn.commit() #save changes to db
    
    #get the id
    cur.execute("SELECT id FROM users where username = %s", (data["username"],))
    user_id = cur.fetchone()[0]

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

@app.get("/auth/verify/<token>")
def verify_user(token):
    cur.execute("SELECT * FROM users where verification_token = %s", (token,))
    user = cur.fetchone()
    if user:
        cur.execute("UPDATE users set is_verified = true, verification_token = NULL where verification token = %s", (token))
        cur.commit()
        return {"verificationStatus" : "success"}
    return {"verificationStatus" : "fail"}

app.run(debug=True, port=5050)





# @app.get("/api/test")
# def test():
#     return {"message": "Hello from flask22"}

# @app.get("/")
# def home():
#     return "Default route reached"