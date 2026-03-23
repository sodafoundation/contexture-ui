from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import uuid
import json
import os
import httpx
from datetime import datetime

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
BACKEND_SERVICE_URL = os.environ.get("BACKEND_SERVICE_URL", "http://localhost:8002")

# Data Models
class ChatMessage(BaseModel):
    role: str  # "user" or "bot"
    content: str
    timestamp: str
    ocs_data: Optional[Dict] = None  # Store OCS input/output data

class ChatSession(BaseModel):
    id: str
    name: str
    created_at: str
    messages: List[ChatMessage]

class ChatRequest(BaseModel):
    query: str
    session_id: str

class SessionCreateRequest(BaseModel):
    name: str

class SessionUpdateRequest(BaseModel):
    name: str

# Storage (JSON File)
DATA_FILE = "chat_history.json"

def load_data() -> Dict[str, ChatSession]:
    if not os.path.exists(DATA_FILE):
        return {}
    try:
        with open(DATA_FILE, "r") as f:
            data = json.load(f)
            # Convert dict back to ChatSession objects
            return {k: ChatSession(**v) for k, v in data.items()}
    except json.JSONDecodeError:
        return {}

def save_data(data: Dict[str, ChatSession]):
    with open(DATA_FILE, "w") as f:
        # Convert ChatSession objects to dicts for JSON serialization
        json.dump({k: v.model_dump() for k, v in data.items()}, f, indent=4)

async def query_backend_service(query: str, context: str = "") -> tuple[str, Dict]:
    """
    Query the contexture backend service with a natural language query.
    Returns the agent's response and OCS data as a tuple.
    """
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{BACKEND_SERVICE_URL}/api/query",
                json={"query": query, "context": context}
            )
            response.raise_for_status()
            
            data = response.json()
            
            # Format the response
            formatted_response = f"{data.get('summary', 'No summary available')}"
            
            ocs_data = {
                "ocs_input": data.get("ocs_input", ""),
                "ocs_output": data.get("ocs_output", ""),
                "workflow": data.get("workflow", []),
                "results": data.get("results", [])
            }
            
            return formatted_response, ocs_data
            
    except httpx.TimeoutException:
        error_msg = "**Error**: Query timed out after 120 seconds. The backend service may be processing a complex query."
        return error_msg, {}
    except httpx.ConnectError:
        error_msg = f"**Error**: Cannot connect to backend service at {BACKEND_SERVICE_URL}\n\nPlease ensure:\n1. Backend service is running: `python contexture-core/pkg/mcp/client_dynamic.py`\n2. The service is accessible at {BACKEND_SERVICE_URL}"
        return error_msg, {}
    except httpx.HTTPStatusError as e:
        error_msg = f"**Error**: Backend service returned error {e.response.status_code}\n\nDetails: {e.response.text}"
        return error_msg, {}
    except json.JSONDecodeError as e:
        error_msg = f"**Error**: Invalid JSON response from backend service\n\nDetails: {str(e)}"
        return error_msg, {}
    except Exception as e:
        error_msg = f"**Error**: Unexpected error communicating with backend service\n\nDetails: {str(e)}"
        return error_msg, {}

# Routes

@app.get("/")
def root():
    return {"message": "Contexture Frontend Backend", "status": "running"}

@app.get("/api/sessions", response_model=List[ChatSession])
def get_sessions():
    data = load_data()
    # Return list of sessions sorted by creation time (newest first)
    sessions = list(data.values())
    sessions.sort(key=lambda x: x.created_at, reverse=True)
    return sessions

@app.post("/api/sessions", response_model=ChatSession)
def create_session(request: SessionCreateRequest):
    data = load_data()
    session_id = str(uuid.uuid4())
    new_session = ChatSession(
        id=session_id,
        name=request.name,
        created_at=datetime.now().isoformat(),
        messages=[]
    )
    data[session_id] = new_session
    save_data(data)
    return new_session

@app.put("/api/sessions/{session_id}", response_model=ChatSession)
def update_session(session_id: str, request: SessionUpdateRequest):
    data = load_data()
    if session_id not in data:
        raise HTTPException(status_code=404, detail="Session not found")
    
    data[session_id].name = request.name
    save_data(data)
    return data[session_id]

@app.delete("/api/sessions/{session_id}")
def delete_session(session_id: str):
    data = load_data()
    if session_id not in data:
        raise HTTPException(status_code=404, detail="Session not found")
    
    del data[session_id]
    save_data(data)
    return {"message": "Session deleted"}

@app.get("/api/history/{session_id}", response_model=List[ChatMessage])
def get_history(session_id: str):
    data = load_data()
    if session_id not in data:
        raise HTTPException(status_code=404, detail="Session not found")
    return data[session_id].messages

@app.post("/api/chat")
async def chat(request: ChatRequest):
    data = load_data()
    if request.session_id not in data:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # 1. Add User Message
    user_msg = ChatMessage(
        role="user",
        content=request.query,
        timestamp=datetime.now().isoformat(),
        ocs_data=None
    )
    data[request.session_id].messages.append(user_msg)
    
    # 2. Query the Backend Service
    response_content, ocs_data = await query_backend_service(request.query)
    
    bot_msg = ChatMessage(
        role="bot",
        content=response_content,
        timestamp=datetime.now().isoformat(),
        ocs_data=ocs_data if ocs_data else None
    )
    data[request.session_id].messages.append(bot_msg)
    
    save_data(data)
    
    return {
        "response": response_content,
        "ocs_data": ocs_data,
        "history": data[request.session_id].messages
    }

@app.get("/api/config")
async def get_config():
    """Return current configuration status"""
    backend_available = False
    backend_error = None
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{BACKEND_SERVICE_URL}/health")
            backend_available = response.status_code == 200
    except httpx.ConnectError:
        backend_error = "Cannot connect to backend service"
    except httpx.TimeoutException:
        backend_error = "Backend service timeout"
    except Exception as e:
        backend_error = str(e)
    
    return {
        "backend_service_url": BACKEND_SERVICE_URL,
        "backend_available": backend_available,
        "backend_error": backend_error
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
