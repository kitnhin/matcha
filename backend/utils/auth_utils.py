from email_validator import validate_email, EmailNotValidError
from extensions import conn, cur, mail
    

def check_register_input(data):
    #validate email format
    try:
        validate_email(data["email"])
    except EmailNotValidError as e:
        return {"registerStatus" : "fail", "errorMessage" : "Invalid email"}
    
    #validate length
    if len(data["username"]) < 3:
        return {"registerStatus" : "fail", "errorMessage" : "Username must be at least 3 characters"}
    
    if len(data["first_name"]) < 1:
        return {"registerStatus" : "fail", "errorMessage" : "First name cannot be empty"}
    
    if len(data["last_name"]) < 1:
        return {"registerStatus" : "fail", "errorMessage" : "Last name cannot be empty"}
    
    #validate password
    common_pw_file = "./others/common_passwords.txt"
    if len(data["password"]) < 2:
        return {"registerStatus" : "fail", "errorMessage" : "Password too short"}
    with open(common_pw_file) as f:
        common_passwords = set(f.read().splitlines())
        if data["password"] in common_passwords:
            return {"registerStatus" : "fail", "errorMessage" : "Password too common"}

    #check for duplicate email
    cur.execute("SELECT * FROM users WHERE email = %s", (data["email"],))
    same_username_user = cur.fetchone()
    if same_username_user:
        return {"registerStatus" : "fail", "errorMessage" : "Email already exists"}

    #check for duplicate name
    cur.execute("SELECT * FROM users WHERE username = %s", (data["username"],))
    same_username_user = cur.fetchone()
    if same_username_user:
        return {"registerStatus" : "fail", "errorMessage" : "Username already exists"}
    
    return {"registerStatus" : "success"}


def check_setup_input(request):
    data = request.form
    files = request.files

    if len(data.get("gender", "")) < 1:
        return {"setupStatus" : "fail", "errorMessage" : "Select a gender"}
    
    if len(data.get("sexual_preference", "")) < 1:
        return {"setupStatus" : "fail", "errorMessage" : "Select a sexual preference"}

    age = data.get("age")
    if len(age) < 1 or age.isdigit() == False or int(age) < 0 or int(age) > 200:
        return {"setupStatus" : "fail", "errorMessage" : "Invalid age"}

    if len(data.get("location", "")) < 1 or len(data.get("latitude", "")) < 1 or len(data.get("longitude", "")) < 1:
        return {"setupStatus" : "fail", "errorMessage" : "Location cannot be empty"}
    
    return {"setupStatus" : "success"}


def check_login_input(data):
    if len(data["username"]) < 3:
        return {"loginStatus" : "fail", "errorMessage" : "Invalid username or password"}
    
    if len(data["password"]) < 2:
        return {"loginStatus" : "fail", "errorMessage" : "Invalid username or password"}
    
    return {"loginStatus" : "success"}
    