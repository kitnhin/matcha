from flask import Flask, request, session
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')
CORS(app, supports_credentials=True, origins=[os.getenv('FRONTEND_URL')])

@app.get("/api/test")
def test():
    return {"message": "Hello from flask22"}

@app.get("/")
def home():
    return "Default route reached"

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
    ##############################
    # Check for register status heree
    ###############################

    #tmp vars
    registerSuccess = True
    user_id = 123
    username = "UrMom"
    
    if registerSuccess:
        session["user_id"] = user_id
        session["username"] = username
        return {"registerStatus" : "success"}

    return {"registerStatus" : "fail", "errorMessage" : "Username already exists"}

@app.get("/auth/check")
def auth_check():
    if session.get("user_id"):
        return {"isLoggedIn" : True}
    return {"isLoggedIn" : False}

@app.post("/auth/logout")
def process_logout():
    session.clear()
    return {"logoutStatus" : "success"}

app.run(debug=True, port=5050)