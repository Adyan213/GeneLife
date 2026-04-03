from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import bcrypt
import jwt
import datetime
import json
import os

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

SECRET_KEY = "genelife-secret-key-change-in-production"
DB_PATH = "genelife.db"

# Database Setup

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            risk_levels TEXT NOT NULL,
            recommendations TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    """)
    conn.commit()
    conn.close()

# Auth Helpers

def make_token(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def verify_token(request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload["user_id"]
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# Routes — Serve Frontend

@app.route("/")
def index():
    return send_from_directory("templates", "index.html")

@app.route("/static/<path:filename>")
def static_files(filename):
    return send_from_directory("static", filename)

# Routes — Auth

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required."}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    try:
        conn = get_db()
        cursor = conn.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            (name, email, hashed)
        )
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
    except sqlite3.IntegrityError:
        return jsonify({"error": "An account with this email already exists."}), 409

    token = make_token(user_id)
    return jsonify({"token": token, "name": name}), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()

    if not user or not bcrypt.checkpw(password.encode(), user["password"].encode()):
        return jsonify({"error": "Invalid email or password."}), 401

    token = make_token(user["id"])
    return jsonify({"token": token, "name": user["name"]}), 200


@app.route("/api/me", methods=["GET"])
def me():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db()
    user = conn.execute("SELECT id, name, email, created_at FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify(dict(user)), 200

# Routes — Results

@app.route("/api/results", methods=["POST"])
def save_results():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    risk_levels = data.get("riskLevels")
    recommendations = data.get("recommendations")

    if not risk_levels or not recommendations:
        return jsonify({"error": "Missing results data."}), 400

    conn = get_db()
    conn.execute(
        "INSERT INTO results (user_id, risk_levels, recommendations) VALUES (?, ?, ?)",
        (user_id, json.dumps(risk_levels), json.dumps(recommendations))
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Results saved."}), 201


@app.route("/api/results", methods=["GET"])
def get_results():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db()
    rows = conn.execute(
        "SELECT id, risk_levels, recommendations, created_at FROM results WHERE user_id = ? ORDER BY created_at DESC",
        (user_id,)
    ).fetchall()
    conn.close()

    results = []
    for row in rows:
        results.append({
            "id": row["id"],
            "riskLevels": json.loads(row["risk_levels"]),
            "recommendations": json.loads(row["recommendations"]),
            "createdAt": row["created_at"]
        })

    return jsonify(results), 200


# Run

if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
