from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import asyncio
import json
import os
from typing import Optional
from dotenv import load_dotenv
import uvicorn

# Load environment variables
load_dotenv()

app = FastAPI(title="Speech-GPT Web Backend", version="0.1.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
PROXY_API_KEY = os.getenv("PROXY_API_KEY", "")
PROXY_API_BASE_URL = os.getenv("PROXY_API_BASE_URL", "https://api.proxyapi.ru")
SYSTEM_PROMPT = os.getenv("SYSTEM_PROMPT", "You are a helpful AI assistant. Respond concisely and helpfully.")

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Remove dead connections
                self.active_connections.remove(connection)

manager = ConnectionManager()

# Pydantic models
class TranscriptionRequest(BaseModel):
    audio_data: str  # Base64 encoded audio data
    format: str = "wav"
    sample_rate: int = 16000
    channels: int = 1

class ChatRequest(BaseModel):
    message: str
    system_prompt: Optional[str] = None

class TranscriptionResponse(BaseModel):
    text: str
    success: bool
    error: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    success: bool
    error: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Speech-GPT Web Backend", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "proxy_api_configured": bool(PROXY_API_KEY)}

@app.post("/api/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(file: UploadFile = File(...)):
    """Transcribe audio file using ProxyAPI gpt-4o-mini-transcribe model"""
    
    if not PROXY_API_KEY:
        raise HTTPException(status_code=500, detail="ProxyAPI key not configured")
    
    try:
        # Read audio file
        audio_data = await file.read()
        
        # Prepare request to ProxyAPI
        async with httpx.AsyncClient() as client:
            files = {
                "file": (file.filename, audio_data, file.content_type)
            }
            data = {
                "model": "gpt-4o-mini-transcribe"
            }
            headers = {
                "Authorization": f"Bearer {PROXY_API_KEY}"
            }
            
            response = await client.post(
                f"{PROXY_API_BASE_URL}/v1/audio/transcriptions",
                files=files,
                data=data,
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                transcribed_text = result.get("text", "")
                
                # Send transcribed text to chat endpoint and broadcast response
                if transcribed_text.strip():
                    asyncio.create_task(process_transcription_and_chat(transcribed_text))
                
                return TranscriptionResponse(
                    text=transcribed_text,
                    success=True
                )
            else:
                return TranscriptionResponse(
                    text="",
                    success=False,
                    error=f"ProxyAPI error: {response.status_code} - {response.text}"
                )
                
    except Exception as e:
        return TranscriptionResponse(
            text="",
            success=False,
            error=f"Transcription error: {str(e)}"
        )

async def process_transcription_and_chat(transcribed_text: str):
    """Process transcribed text through chat model and broadcast response"""
    try:
        async with httpx.AsyncClient() as client:
            headers = {
                "Authorization": f"Bearer {PROXY_API_KEY}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": transcribed_text}
                ],
                "stream": False
            }
            
            response = await client.post(
                f"{PROXY_API_BASE_URL}/v1/chat/completions",
                json=payload,
                headers=headers,
                timeout=60.0
            )
            
            if response.status_code == 200:
                result = response.json()
                chat_response = result["choices"][0]["message"]["content"]
                
                # Broadcast response via WebSocket
                message = {
                    "type": "chat_response",
                    "transcribed_text": transcribed_text,
                    "response": chat_response
                }
                await manager.broadcast(json.dumps(message))
            else:
                # Broadcast error
                error_message = {
                    "type": "error",
                    "message": f"Chat API error: {response.status_code}"
                }
                await manager.broadcast(json.dumps(error_message))
                
    except Exception as e:
        # Broadcast error
        error_message = {
            "type": "error",
            "message": f"Chat processing error: {str(e)}"
        }
        await manager.broadcast(json.dumps(error_message))

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Send message to GPT-4o-mini and get response"""
    
    if not PROXY_API_KEY:
        raise HTTPException(status_code=500, detail="ProxyAPI key not configured")
    
    try:
        async with httpx.AsyncClient() as client:
            headers = {
                "Authorization": f"Bearer {PROXY_API_KEY}",
                "Content-Type": "application/json"
            }
            
            system_prompt = request.system_prompt or SYSTEM_PROMPT
            
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": request.message}
                ],
                "stream": False
            }
            
            response = await client.post(
                f"{PROXY_API_BASE_URL}/v1/chat/completions",
                json=payload,
                headers=headers,
                timeout=60.0
            )
            
            if response.status_code == 200:
                result = response.json()
                chat_response = result["choices"][0]["message"]["content"]
                
                return ChatResponse(
                    response=chat_response,
                    success=True
                )
            else:
                return ChatResponse(
                    response="",
                    success=False,
                    error=f"ProxyAPI error: {response.status_code} - {response.text}"
                )
                
    except Exception as e:
        return ChatResponse(
            response="",
            success=False,
            error=f"Chat error: {str(e)}"
        )

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time communication"""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle any incoming messages
            data = await websocket.receive_text()
            # Echo back for testing purposes
            await manager.send_personal_message(f"Echo: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
