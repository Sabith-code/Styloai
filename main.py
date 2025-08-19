
from firebase_admin import auth
from typing import Optional, List
import uuid
from google.cloud.firestore_v1 import SERVER_TIMESTAMP
import json
import requests
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
import os
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, firestore

# ---------------- Env + Firebase Init ---------------- #
load_dotenv()


# --- Robust Firebase credentials: support file path or JSON string --- #
firebase_creds = os.getenv("FIREBASE_CREDENTIALS")
if not firebase_admin._apps:
    if firebase_creds and firebase_creds.strip().startswith("{"):
        cred = credentials.Certificate(json.loads(firebase_creds))
    else:
        cred = credentials.Certificate(firebase_creds)
    firebase_admin.initialize_app(cred)

db = firestore.client()

# ---------------- FastAPI ---------------- #
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
        "https://styloai-b4r2.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Auth ---------------- #
ALLOW_MOCK_TOKENS = os.getenv("ALLOW_MOCK_TOKENS", "false").lower() == "true"

def get_current_user(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    try:
        if ALLOW_MOCK_TOKENS and token.startswith("mock-token-"):
            return {"uid": token.replace("mock-token-", "")}
        decoded = auth.verify_id_token(token)
        return decoded
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid auth token: {e}")

# ---------------- Models ---------------- #
class WardrobeItem(BaseModel):
    category: str
    color: str
    imageUrl: Optional[str] = None

class AddWardrobeItem(BaseModel):
    userId: str
    type: str
    color: str
    nature: str
    imageUrl: str
    material: str
    brand: str
    size: str

class RecommendRequest(BaseModel):
    userId: str

class AIRequest(BaseModel):
    userId: str
    text: str

class QuestionnaireRequest(BaseModel):
    userId: str
    gender: str
    age: str
    skinColor: str
    faceType: str
    bodyType: str
    hairStyle: str
    favoriteBrand: str
    nationality: str
    favoriteColors: list[str]
    favoriteAccessories: str
    favoriteStyle: str
    occupation: str

# ---------------- Cloudinary ---------------- #
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)


# ---------------- OpenRouter (DeepSeek R1 / GPT-4o) ---------------- #
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-3.5-turbo")  # safe default
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

def openrouter_chat(messages: list) -> str:
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": OPENROUTER_MODEL,
        "messages": messages
    }
    try:
        resp = requests.post(OPENROUTER_URL, headers=headers, data=json.dumps(data), timeout=30)
        if not resp.ok:
            print("[ERROR openrouter_chat] status:", resp.status_code)
            print("[ERROR openrouter_chat] response:", resp.text)
            resp.raise_for_status()
        result = resp.json()
        return result["choices"][0]["message"]["content"]
    except Exception as e:
        print("[ERROR openrouter_chat]", e)
        return f"Sorry, the AI service is currently unavailable. ({e})"

# ---------------- Questionnaire Endpoints ---------------- #
@app.post("/api/questionnaire")
def save_questionnaire(req: QuestionnaireRequest):
    try:
        doc_ref = db.collection("users").document(req.userId).collection("profile").document("questionnaire")
        if doc_ref.get().exists:
            raise HTTPException(status_code=409, detail="Questionnaire already submitted for this user.")
        doc_ref.set(req.dict())
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving questionnaire: {str(e)}")

@app.get("/api/questionnaire/{userId}")
def get_questionnaire(userId: str, user=Depends(get_current_user)):
    if user["uid"] != userId:
        raise HTTPException(status_code=403, detail="Unauthorized")
    doc = db.collection("users").document(userId).collection("profile").document("questionnaire").get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Not found")
    return doc.to_dict()

# ---------------- Wardrobe Endpoints ---------------- #
@app.post("/api/wardrobe")
def add_wardrobe_item(item: AddWardrobeItem):
    try:
        ref = db.collection("wardrobes").document(item.userId).collection("items").document()
        ref.set(item.dict())
        return {"id": ref.id, **item.dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding wardrobe item: {str(e)}")

@app.get("/api/wardrobe/{userId}")
def get_wardrobe(userId: str):
    try:
        items_ref = db.collection("wardrobes").document(userId).collection("items").stream()
        wardrobe = [{**item.to_dict(), "id": item.id} for item in items_ref]
        return {"items": wardrobe}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching wardrobe: {str(e)}")
@app.delete("/api/wardrobe/{userId}/{itemId}")
def delete_wardrobe_item(userId: str, itemId: str):
    try:
        ref = db.collection("wardrobes").document(userId).collection("items").document(itemId)
        ref.delete()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting wardrobe item: {str(e)}")

@app.get("/api/wardrobe/{item_id}")
def get_wardrobe_item(item_id: str, user=Depends(get_current_user)):
    uid = user["uid"]
    doc = db.collection("users").document(uid).collection("wardrobe").document(item_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Item not found")
    return doc.to_dict() | {"id": doc.id}

# ---------------- Outfit Recommendation ---------------- #
@app.post("/api/recommend")
def recommend_outfit(req: RecommendRequest):
    def clean_firestore(obj):
        if isinstance(obj, dict):
            return {k: clean_firestore(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [clean_firestore(v) for v in obj]
        elif hasattr(obj, 'isoformat'):
            return obj.isoformat()
        else:
            return obj
    try:
        # Fetch user's wardrobe
        items_ref = db.collection("wardrobes").document(req.userId).collection("items").stream()
        wardrobe_items = [clean_firestore(item.to_dict()) for item in items_ref]
        prompt = f"""
You are Stylo, a professional AI Fashion Stylist.\nThe client’s wardrobe: {json.dumps(wardrobe_items)}.\nSuggest a complete outfit using available items. If something is missing, recommend it.\n"""
        ai_reply = openrouter_chat(prompt)
        return {"recommendation": ai_reply.strip()}
    except Exception as e:
        import traceback
        print("[ERROR /api/recommend]", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"AI recommendation failed: {e}")

# ---------------- Conversational AI ---------------- #
@app.post("/api/voice")
def ai_voice(req: AIRequest):
    try:
        # Conversation memory: fetch history from Firestore
        history_ref = db.collection("users").document(req.userId).collection("chatHistory")
        # Get last 10 messages (if any)
        history_docs = list(history_ref.order_by("createdAt", direction=firestore.Query.DESCENDING).limit(10).stream())[::-1]
        messages = []
        for doc in history_docs:
            d = doc.to_dict()
            if d.get("role") and d.get("content"):
                messages.append({"role": d["role"], "content": d["content"]})
        # Fetch user's wardrobe
        items_ref = db.collection("wardrobes").document(req.userId).collection("items").stream()
        def clean_firestore(obj):
            if isinstance(obj, dict):
                return {k: clean_firestore(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [clean_firestore(v) for v in obj]
            elif hasattr(obj, 'isoformat'):
                return obj.isoformat()
            else:
                return obj
        wardrobe_items = []
        for item in items_ref:
            d = clean_firestore(item.to_dict())
            # Remove imageUrl and createdAt fields if present
            d.pop("imageUrl", None)
            d.pop("createdAt", None)
            wardrobe_items.append(d)
        # Fetch user's questionnaire
        questionnaire_ref = db.collection("users").document(req.userId).collection("profile").document("questionnaire")
        questionnaire_doc = questionnaire_ref.get()
        questionnaire = questionnaire_doc.to_dict() if questionnaire_doc.exists else None
        # Add system prompt with wardrobe and questionnaire summary
        system_prompt = {
            "role": "system",
            "content": f"You are Stylo, a professional AI Fashion Stylist. The user's wardrobe: {json.dumps(wardrobe_items)}. The user's style preferences and profile: {json.dumps(questionnaire)}. Always consider these when giving advice or outfit suggestions."
        }
        messages = [system_prompt] + messages
        # Add the new user message
        messages.append({"role": "user", "content": req.text})
        # Call OpenRouter with full history
        ai_reply = openrouter_chat(messages)
        # Save user and assistant messages to Firestore
        import datetime
        now = datetime.datetime.utcnow()
        history_ref.add({"role": "user", "content": req.text, "createdAt": now})
        history_ref.add({"role": "assistant", "content": ai_reply, "createdAt": now})
        return {"response": ai_reply.strip()}
    except Exception as e:
        import traceback
        print("[ERROR /api/voice]", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"AI generation failed: {e}")
