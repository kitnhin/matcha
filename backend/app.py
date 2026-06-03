from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.get("/api/test")
def test():
    return {"message": "Hello from flask22"}

@app.get("/")
def home():
    return "Default route reached"

app.run(debug=True, port=5050)