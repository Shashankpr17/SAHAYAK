import sqlite3
import os
import datetime
from typing import Dict, Any

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage", "sahayak.db")

def get_db_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Create users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        google_sub TEXT UNIQUE NOT NULL,
        email TEXT,
        name TEXT,
        picture_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # 2. Create extracted_profiles table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS extracted_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        full_name TEXT,
        date_of_birth TEXT,
        state TEXT,
        address TEXT,
        annual_income TEXT,
        occupation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # 3. Create verified_profiles table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS verified_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        full_name TEXT,
        date_of_birth TEXT,
        state TEXT,
        address TEXT,
        annual_income TEXT,
        occupation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # Migration helper: Check and add new columns if they do not exist
    new_columns = [
        ("gender", "TEXT"),
        ("father_name", "TEXT"),
        ("mother_name", "TEXT"),
        ("blood_group", "TEXT"),
        ("aadhaar_number", "TEXT"),
        ("pan_number", "TEXT"),
        ("driving_licence_number", "TEXT"),
        ("voter_id_number", "TEXT"),
        ("district", "TEXT"),
        ("pin_code", "TEXT")
    ]
    
    for table in ["extracted_profiles", "verified_profiles"]:
        cursor.execute(f"PRAGMA table_info({table})")
        existing_cols = [row[1] for row in cursor.fetchall()]
        for col_name, col_type in new_columns:
            if col_name not in existing_cols:
                cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col_name} {col_type}")
                print(f"[DB migration] Added column {col_name} to table {table}")
                
    conn.commit()
    conn.close()
    print("[DB] SQLite database tables initialized successfully.")


# Verified Profile Helpers
def get_verified_profile(user_id: int) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM verified_profiles WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        cols = row.keys()
        return {
            "full_name": row["full_name"],
            "date_of_birth": row["date_of_birth"],
            "state": row["state"],
            "address": row["address"],
            "annual_income": row["annual_income"],
            "occupation": row["occupation"],
            "gender": row["gender"] if "gender" in cols else "",
            "father_name": row["father_name"] if "father_name" in cols else "",
            "mother_name": row["mother_name"] if "mother_name" in cols else "",
            "blood_group": row["blood_group"] if "blood_group" in cols else "",
            "aadhaar_number": row["aadhaar_number"] if "aadhaar_number" in cols else "",
            "pan_number": row["pan_number"] if "pan_number" in cols else "",
            "driving_licence_number": row["driving_licence_number"] if "driving_licence_number" in cols else "",
            "voter_id_number": row["voter_id_number"] if "voter_id_number" in cols else "",
            "district": row["district"] if "district" in cols else "",
            "pin_code": row["pin_code"] if "pin_code" in cols else ""
        }
    return {
        "full_name": "",
        "date_of_birth": "",
        "state": "",
        "address": "",
        "annual_income": "",
        "occupation": "",
        "gender": "",
        "father_name": "",
        "mother_name": "",
        "blood_group": "",
        "aadhaar_number": "",
        "pan_number": "",
        "driving_licence_number": "",
        "voter_id_number": "",
        "district": "",
        "pin_code": ""
    }


def save_verified_profile(user_id: int, profile: Dict[str, Any]):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM verified_profiles WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    
    now = datetime.datetime.utcnow().isoformat()
    
    if not row:
        cursor.execute(
            """INSERT INTO verified_profiles 
            (user_id, full_name, date_of_birth, state, address, annual_income, occupation,
             gender, father_name, mother_name, blood_group, aadhaar_number, pan_number,
             driving_licence_number, voter_id_number, district, pin_code, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (user_id, profile.get("full_name"), profile.get("date_of_birth"), profile.get("state"), profile.get("address"), profile.get("annual_income"), profile.get("occupation"),
             profile.get("gender"), profile.get("father_name"), profile.get("mother_name"), profile.get("blood_group"), profile.get("aadhaar_number"), profile.get("pan_number"),
             profile.get("driving_licence_number"), profile.get("voter_id_number"), profile.get("district"), profile.get("pin_code"), now, now)
        )
    else:
        cursor.execute(
            """UPDATE verified_profiles SET 
            full_name = ?, date_of_birth = ?, state = ?, address = ?, annual_income = ?, occupation = ?,
            gender = ?, father_name = ?, mother_name = ?, blood_group = ?, aadhaar_number = ?, pan_number = ?,
            driving_licence_number = ?, voter_id_number = ?, district = ?, pin_code = ?, updated_at = ?
            WHERE user_id = ?""",
            (profile.get("full_name"), profile.get("date_of_birth"), profile.get("state"), profile.get("address"), profile.get("annual_income"), profile.get("occupation"),
             profile.get("gender"), profile.get("father_name"), profile.get("mother_name"), profile.get("blood_group"), profile.get("aadhaar_number"), profile.get("pan_number"),
             profile.get("driving_licence_number"), profile.get("voter_id_number"), profile.get("district"), profile.get("pin_code"), now, user_id)
        )
    conn.commit()
    conn.close()


# Extracted Profile Helpers
def get_extracted_profile(user_id: int) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM extracted_profiles WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        cols = row.keys()
        return {
            "full_name": row["full_name"],
            "date_of_birth": row["date_of_birth"],
            "state": row["state"],
            "address": row["address"],
            "annual_income": row["annual_income"],
            "occupation": row["occupation"],
            "gender": row["gender"] if "gender" in cols else "",
            "father_name": row["father_name"] if "father_name" in cols else "",
            "mother_name": row["mother_name"] if "mother_name" in cols else "",
            "blood_group": row["blood_group"] if "blood_group" in cols else "",
            "aadhaar_number": row["aadhaar_number"] if "aadhaar_number" in cols else "",
            "pan_number": row["pan_number"] if "pan_number" in cols else "",
            "driving_licence_number": row["driving_licence_number"] if "driving_licence_number" in cols else "",
            "voter_id_number": row["voter_id_number"] if "voter_id_number" in cols else "",
            "district": row["district"] if "district" in cols else "",
            "pin_code": row["pin_code"] if "pin_code" in cols else ""
        }
    return {
        "full_name": None,
        "date_of_birth": None,
        "state": None,
        "address": None,
        "annual_income": None,
        "occupation": None,
        "gender": None,
        "father_name": None,
        "mother_name": None,
        "blood_group": None,
        "aadhaar_number": None,
        "pan_number": None,
        "driving_licence_number": None,
        "voter_id_number": None,
        "district": None,
        "pin_code": None
    }


def save_extracted_profile(user_id: int, profile: Dict[str, Any]):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM extracted_profiles WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    
    now = datetime.datetime.utcnow().isoformat()
    
    if not row:
        cursor.execute(
            """INSERT INTO extracted_profiles 
            (user_id, full_name, date_of_birth, state, address, annual_income, occupation,
             gender, father_name, mother_name, blood_group, aadhaar_number, pan_number,
             driving_licence_number, voter_id_number, district, pin_code, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (user_id, profile.get("full_name"), profile.get("date_of_birth"), profile.get("state"), profile.get("address"), profile.get("annual_income"), profile.get("occupation"),
             profile.get("gender"), profile.get("father_name"), profile.get("mother_name"), profile.get("blood_group"), profile.get("aadhaar_number"), profile.get("pan_number"),
             profile.get("driving_licence_number"), profile.get("voter_id_number"), profile.get("district"), profile.get("pin_code"), now, now)
        )
    else:
        cursor.execute(
            """UPDATE extracted_profiles SET 
            full_name = ?, date_of_birth = ?, state = ?, address = ?, annual_income = ?, occupation = ?,
            gender = ?, father_name = ?, mother_name = ?, blood_group = ?, aadhaar_number = ?, pan_number = ?,
            driving_licence_number = ?, voter_id_number = ?, district = ?, pin_code = ?, updated_at = ?
            WHERE user_id = ?""",
            (profile.get("full_name"), profile.get("date_of_birth"), profile.get("state"), profile.get("address"), profile.get("annual_income"), profile.get("occupation"),
             profile.get("gender"), profile.get("father_name"), profile.get("mother_name"), profile.get("blood_group"), profile.get("aadhaar_number"), profile.get("pan_number"),
             profile.get("driving_licence_number"), profile.get("voter_id_number"), profile.get("district"), profile.get("pin_code"), now, user_id)
        )
    conn.commit()
    conn.close()
