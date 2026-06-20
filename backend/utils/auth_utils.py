from email_validator import validate_email, EmailNotValidError
from extensions import conn, cur, mail
import re #regex shit
import base64
    

#configurables
username_length = 3
password_length = 2

def check_register_input(data):
    check_email_res = check_email(data["email"])
    if check_email_res["status"] == "fail":
        return {"registerStatus" : "fail", "errorMessage" : check_email_res["errorMessage"]}
    
    check_name_res = check_name(data["username"], data["first_name"], data["last_name"])
    if check_name_res["status"] == "fail":
        return {"registerStatus" : "fail", "errorMessage" : check_name_res["errorMessage"]}
    
    check_password_res = check_password(data["password"])
    if check_password_res["status"] == "fail":
        return {"registerStatus" : "fail", "errorMessage" : check_password_res["errorMessage"]}
    
    return {"registerStatus" : "success"}


def check_setup_input(request):
    data = request.form
    profile_pic = request.files.get("profile_pic")
    extra_pics = request.files.getlist("extra_pics")

    check_other_fields_res = check_other_fields(
        data.get("gender", ""), data.get("sexual_preference", ""), int(data.get("age", "")), 
        data.get("location", ""), data.get("latitude"), data.get("longitude"))
    
    if check_other_fields_res["status"] == "fail":
        return {"setupStatus" : "fail", "errorMessage" : check_other_fields_res["errorMessage"]}
    
    if profile_pic:
        if not check_pics_size(base64.b64encode(profile_pic.read()).decode("utf-8")):
            return {"setupStatus" : "fail", "errorMessage" : "Profile picture size exceeds 5MB limit"}
        profile_pic.seek(0)
    
    for pic in extra_pics:
        if not check_pics_size(base64.b64encode(pic.read()).decode("utf-8")):
            return {"setupStatus" : "fail", "errorMessage" : "Extra picture exceed 5MB limit"}
        pic.seek(0)
    
    return {"setupStatus" : "success"}


def check_login_input(data):
    if len(data["username"]) < username_length:
        return {"loginStatus" : "fail", "errorMessage" : "Invalid username or password"}
    
    if len(data["password"]) < password_length:
        return {"loginStatus" : "fail", "errorMessage" : "Invalid username or password"}
    
    return {"loginStatus" : "success"}
    

def check_name(username, first_name, last_name, user_id=None):
    #check length
    if len(username) < username_length:
        return {"status" : "fail", "errorMessage" : "Username must be at least 3 characters"}
    
    if len(first_name) < 1:
        return {"status" : "fail", "errorMessage" : "First name cannot be empty"}
    
    if len(last_name) < 1:
        return {"status" : "fail", "errorMessage" : "Last name cannot be empty"}
    
    if not (re.match(r'^[a-zA-Z0-9_]+$', username) and re.match(r'^[a-zA-Z0-9_]+$', first_name) and re.match(r'^[a-zA-Z0-9_]+$', last_name)):
        return {"status" : "fail", "errorMessage" : "Names can only contain letters, numbers, and underscores"}
    
    #check for duplicate name
    if user_id:
        cur.execute("SELECT * FROM users WHERE username = %s AND id != %s", (username, user_id))
    else:
        cur.execute("SELECT * FROM users WHERE username = %s", (username,))
    same_username_user = cur.fetchone()
    if same_username_user:
        return {"status" : "fail", "errorMessage" : "Username already exists"}
    
    return {"status" : "success"}


def check_email(email, user_id=None):
    #validate email format
    try:
        validate_email(email)
    except EmailNotValidError as e:
        return {"status" : "fail", "errorMessage" : "Invalid email"}
    
    #check for duplicate email
    if user_id:
        cur.execute("SELECT * FROM users WHERE email = %s AND id != %s", (email, user_id))
    else:
        cur.execute("SELECT * FROM users WHERE email = %s", (email,))

    same_username_user = cur.fetchone()
    if same_username_user:
        return {"status" : "fail", "errorMessage" : "Email already exists"}
    
    return {"status" : "success"}

def check_password(password):
    common_pw_file = "./others/common_passwords.txt"
    if len(password) < password_length:
        return {"status" : "fail", "errorMessage" : "Password too short"}
    with open(common_pw_file) as f:
        common_passwords = set(f.read().splitlines())
        if password in common_passwords:
            return {"status" : "fail", "errorMessage" : "Password too common"}
    return {"status" : "success"}

def check_other_fields(gender, sexual_preference, age, location, lat, long):
    if len(gender) < 1:
        return {"status" : "fail", "errorMessage" : "Select a gender"}
    
    if len(sexual_preference) < 1:
        return {"status" : "fail", "errorMessage" : "Select a sexual preference"}

    if int(age) < 1 or int(age) > 200:
        return {"status" : "fail", "errorMessage" : "Invalid age"}

    if not location or lat is None or long is None:
        return {"status" : "fail", "errorMessage" : "Invalid location"}
    
    return {"status" : "success"}


def check_pics_size(base64_string):
    max_file_size = 5 * 1024 * 1024 #5MB
    if not base64_string:
        return True
    size_in_bytes = len(base64_string) * 3 / 4 #normally base64 strings r 4/3 times bigger than the original file
    return size_in_bytes <= max_file_size
