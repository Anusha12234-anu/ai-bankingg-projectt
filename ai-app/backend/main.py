from fastapi import FastAPI, HTTPException, Body, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import datetime
import sqlite3
import os
import json
import numpy as np

# Voice analysis libraries (Optional: only if installed)
try:
    import librosa
    VOICE_ENABLED = True
except ImportError:
    VOICE_ENABLED = False

app = FastAPI(title="AI-Guided Banking API")

# Add CORS middleware to allow connections from mobile devices
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), "ai_banking.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        balance REAL DEFAULT 5000.00,
        voice_signature TEXT
    )
    ''')
    # Check if a default user exists
    cursor.execute("SELECT id FROM users WHERE id = 1")
    if not cursor.fetchone():
        cursor.execute("INSERT INTO users (id, name, email, balance) VALUES (1, 'gudipati meghana', 'meghana@example.com', 5000.00)")
    
    # Transactions table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        recipient_name TEXT NOT NULL,
        recipient_emoji TEXT,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    ''')
    
    # Family Contacts table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS family_contacts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT,
        details TEXT,
        color TEXT
    )
    ''')
    
    # Add default family if empty
    cursor.execute("SELECT COUNT(*) FROM family_contacts")
    if cursor.fetchone()[0] == 0:
        default_family = [
            ('1', 'Mother', '👩', 'mother@upi', '#F472B6'),
            ('2', 'Father', '👨', 'father@upi', '#3B82F6'),
            ('3', 'Brother', '👦', '9876543210', '#10B981'),
            ('4', 'Sister', '👧', '9876543211', '#F59E0B'),
            ('5', 'Wife', '❤️', 'wife@upi', '#EF4444'),
        ]
        cursor.executemany("INSERT INTO family_contacts VALUES (?, ?, ?, ?, ?)", default_family)

    # Add default transactions if empty
    cursor.execute("SELECT COUNT(*) FROM transactions")
    if cursor.fetchone()[0] == 0:
        now = datetime.datetime.now()
        yesterday = now - datetime.timedelta(days=1)
        two_days_ago = now - datetime.timedelta(days=2)
        
        default_txns = [
            (1, 'Mother', '👩', 500.0, yesterday.isoformat(), 'Success'),
            (1, 'Electricity Bill', '💡', 1200.0, two_days_ago.isoformat(), 'Success'),
            (1, 'Father', '👨', 1000.0, now.isoformat(), 'Success'),
        ]
        cursor.executemany("INSERT INTO transactions (user_id, recipient_name, recipient_emoji, amount, date, status) VALUES (?, ?, ?, ?, ?, ?)", default_txns)

    conn.commit()
    conn.close()

# Initialize on startup
init_db()

def extract_mfcc(file_path):
    """Extracts MFCC features from an audio file."""
    if not VOICE_ENABLED:
        return None
    try:
        y, sr = librosa.load(file_path, sr=None)
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        # Take the mean of MFCCs across time to get a single vector signature
        mfcc_mean = np.mean(mfccs, axis=1)
        return mfcc_mean.tolist()
    except Exception as e:
        print(f"Error extracting MFCC: {e}")
        return None

@app.post("/register-voice")
async def register_voice(file: UploadFile = File(...)):
    if not VOICE_ENABLED:
        return {"status": "error", "message": "Voice processing libraries not installed on server."}
    
    temp_path = "temp_reg_voice.m4a"
    with open(temp_path, "wb") as f:
        f.write(await file.read())
    
    signature = extract_mfcc(temp_path)
    os.remove(temp_path)
    
    if signature:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET voice_signature = ? WHERE id = 1", (json.dumps(signature),))
        conn.commit()
        conn.close()
        return {"status": "success", "message": "Voice signature registered"}
    else:
        return {"status": "error", "message": "Failed to extract voice signature"}

@app.post("/verify-voice")
async def verify_voice(file: UploadFile = File(...)):
    if not VOICE_ENABLED:
        # Fallback for testing if libraries aren't installed
        return {"status": "success", "verified": True, "message": "Simulation mode (libraries missing)"}
    
    temp_path = "temp_verify_voice.m4a"
    with open(temp_path, "wb") as f:
        f.write(await file.read())
    
    current_signature = extract_mfcc(temp_path)
    os.remove(temp_path)
    
    if not current_signature:
        return {"status": "error", "message": "Failed to extract voice signature"}
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT voice_signature FROM users WHERE id = 1")
    row = cursor.fetchone()
    conn.close()
    
    if not row or not row[0]:
        return {"status": "error", "message": "No voice signature registered for this user"}
    
    stored_signature = json.loads(row[0])
    
    # Compare using Cosine Similarity
    v1 = np.array(stored_signature)
    v2 = np.array(current_signature)
    similarity = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
    
    # Threshold for matching (usually > 0.95 for MFCC mean vectors)
    is_match = similarity > 0.92
    
    return {
        "status": "success",
        "verified": bool(is_match),
        "similarity": float(similarity),
        "message": "Voice verified" if is_match else "Voice pattern mismatch"
    }


class TransactionCreate(BaseModel):
    recipient_name: str
    recipient_emoji: str
    amount: float
    status: str
    # recipient_phone: Optional[str] = None # No longer needed for backend SMS

class ContactCreate(BaseModel):
    id: str
    name: str
    icon: str
    details: str
    color: str

@app.get("/")
def read_root():
    return {"message": "Welcome to AI-Guided Banking API"}

@app.get("/user/1")
def get_user():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, balance FROM users WHERE id = 1")
    user = cursor.fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user[0], "name": user[1], "balance": user[2]}

# --- SMS CONFIGURATION ---
# To send real SMS, sign up for Twilio and fill these in.
TWILIO_SID = 'YOUR_TWILIO_ACCOUNT_SID'
TWILIO_TOKEN = 'YOUR_TWILIO_AUTH_TOKEN'
TWILIO_PHONE = 'YOUR_TWILIO_PHONE_NUMBER'

def send_sms_via_service(phone: str, message: str):
    """
    Sends a truly direct SMS via Twilio backend service.
    """
    print(f"--- [SMS SERVICE INITIATED] ---")
    print(f"To: {phone}")
    
    # Check if credentials are set
    if 'YOUR_' in TWILIO_SID or not TWILIO_SID:
        print("!!! [MOCK MODE] SMS not sent. Please set Twilio credentials in main.py !!!")
        print(f"Message would have been: {message}")
        return

    try:
        from twilio.rest import Client
        client = Client(TWILIO_SID, TWILIO_TOKEN)
        message = client.messages.create(
            body=message,
            from_=TWILIO_PHONE,
            to=phone
        )
        print(f"SUCCESS: SMS sent! SID: {message.sid}")
    except ImportError:
        print("ERROR: 'twilio' package not installed. Run 'pip install twilio'")
    except Exception as e:
        print(f"ERROR: Failed to send SMS via Twilio: {e}")
    print(f"-------------------------------")

@app.post("/transactions")
def create_transaction(txn: TransactionCreate):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Update user balance if success
    if txn.status == "Success":
        cursor.execute("UPDATE users SET balance = balance - ? WHERE id = 1", (txn.amount,))
        
        # 2. Automatically trigger SMS if phone number is provided
        # This logic is now handled on the frontend for direct SMS
        # if txn.recipient_phone:
        #     sms_body = f"₹{txn.amount} has been credited to your account."
        #     send_sms_via_service(txn.recipient_phone, sms_body)
    
    # 3. Record transaction
    date_str = datetime.datetime.now().isoformat()
    cursor.execute(
        "INSERT INTO transactions (user_id, recipient_name, recipient_emoji, amount, date, status) VALUES (1, ?, ?, ?, ?, ?)",
        (txn.recipient_name, txn.recipient_emoji, txn.amount, date_str, txn.status)
    )
    
    conn.commit()
    
    # Get the inserted transaction
    cursor.execute("SELECT id, recipient_name, recipient_emoji, amount, date, status FROM transactions WHERE id = ?", (cursor.lastrowid,))
    row = cursor.fetchone()
    conn.close()
    
    return {
        "id": row[0],
        "recipient_name": row[1],
        "recipient_emoji": row[2],
        "amount": row[3],
        "date": row[4],
        "status": row[5]
    }

@app.get("/transactions")
def get_transactions():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, recipient_name, recipient_emoji, amount, date, status FROM transactions ORDER BY date DESC")
    txns = cursor.fetchall()
    conn.close()
    
    return [
        {
            "id": t[0],
            "recipient_name": t[1],
            "recipient_emoji": t[2],
            "amount": t[3],
            "date": t[4],
            "status": t[5]
        } for t in txns
    ]

@app.get("/family-contacts")
def get_family_contacts():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, icon, details, color FROM family_contacts")
    contacts = cursor.fetchall()
    conn.close()
    return [
        {"id": c[0], "name": c[1], "icon": c[2], "details": c[3], "color": c[4]} for c in contacts
    ]

@app.post("/family-contacts")
def add_family_contact(contact: ContactCreate):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT OR REPLACE INTO family_contacts (id, name, icon, details, color) VALUES (?, ?, ?, ?, ?)",
        (contact.id, contact.name, contact.icon, contact.details, contact.color)
    )
    conn.commit()
    conn.close()
    return {"message": "Contact saved"}
