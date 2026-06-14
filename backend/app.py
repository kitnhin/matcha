from dotenv import load_dotenv
load_dotenv() #need move this to the top if not no env variables needed by the import from os.getenv will be loaded

from flask import Flask, request
from flask_cors import CORS
import os
import secrets
from extensions import mail
from routes.auth import auth_bp
from routes.ws import ws_bp, sock

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')
CORS(app, supports_credentials=True, origins=[os.getenv('FRONTEND_URL')])

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')
app.config['MAX_FORM_MEMORY_SIZE'] = 10 * 1024 * 1024  # 10MB per field

mail.init_app(app)
sock.init_app(app)

#routes
app.register_blueprint(auth_bp) #/auth/
app.register_blueprint(ws_bp) #/ws

if __name__ == "__main__":
    app.run(debug=True, port=5050)