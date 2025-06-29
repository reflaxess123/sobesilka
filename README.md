# Speech-GPT Web

A production-ready speech-to-GPT web application that captures audio from the user's microphone, transcribes it using GPT-4o-mini-transcribe, and sends the transcribed text to GPT-4o-mini for intelligent responses via WebSocket.

## Features

- **Real-time Audio Capture**: Browser captures audio from user-selected microphone
- **Intelligent Chunking**: Sends 5-second audio chunks every 7 seconds (WAV 16kHz mono)
- **Speech Transcription**: Uses ProxyAPI's GPT-4o-mini-transcribe for accurate transcription
- **AI Chat Responses**: Transcribed text is sent to GPT-4o-mini with configurable system prompts
- **Real-time Communication**: WebSocket integration for instant response delivery
- **Toast Notifications**: Real-time toast notifications for transcriptions and responses
- **Local Storage**: Settings stored in IndexedDB using Dexie
- **Device Management**: Configurable microphone selection and audio settings
- **Modern UI**: Clean, responsive interface built with React 19.1 + TailwindCSS

## Tech Stack

### Backend
- **Python 3.12** with FastAPI
- **WebSocket** support for real-time communication
- **ProxyAPI** integration for GPT models
- **HTTP client** (httpx) for external API calls

### Frontend
- **React 19.1** with TypeScript
- **Rsbuild** for modern build tooling
- **Feature-Sliced Design** (FSD) architecture
- **TailwindCSS** for styling
- **Dexie** for IndexedDB storage
- **TanStack Query** for API state management
- **React Hot Toast** for notifications
- **Lucide React** for icons

## Development

### Prerequisites
1. Python 3.12+ with Poetry
2. Node.js 18+ with npm
3. ProxyAPI key for GPT models

### Setup
1. Clone the repository
2. Set up backend environment:
   ```bash
   cd back
   poetry install
   cp .env.example .env
   # Edit .env with your ProxyAPI credentials
   ```
3. Set up frontend dependencies:
   ```bash
   cd front
   npm install
   ```

### Running the Application

```cmd
start-dev          # launches backend & front (from cmd)
```
```powershell
.\start-dev        # from PowerShell (or .\start-dev.ps1)
```

This will start:
- FastAPI backend on http://localhost:8000
- React frontend on http://localhost:3000

### API Client Generation

```cmd
generate-api       # from cmd
```
```powershell
.\generate-api     # from PowerShell (or .\generate-api.ps1)
```

## Configuration

### Backend (.env)
```bash
PROXY_API_KEY=your_proxy_api_key_here
PROXY_API_BASE_URL=https://api.proxyapi.ru
SYSTEM_PROMPT=You are a helpful AI assistant. Respond concisely and helpfully to voice messages.
```

### Frontend Settings (via UI)
- System prompt for GPT responses
- Audio chunk duration (1-30 seconds)
- Send interval timing (1-60 seconds)
- UI preferences (toast notifications, auto-start)

## Architecture

### Audio Processing Flow
1. Browser requests microphone access
2. Audio is captured in configurable chunks (default: 5s)
3. Chunks are sent to backend every interval (default: 7s)
4. Backend proxies audio to ProxyAPI for transcription
5. Transcribed text is automatically sent to GPT chat endpoint
6. GPT response is broadcast via WebSocket
7. Frontend displays response as toast notification and in chat history

### Data Storage
- **IndexedDB**: User settings, audio device preferences
- **Memory**: Chat history (session-based)
- **WebSocket**: Real-time communication state

## Development Focus

This application is designed for **local development only**. No deployment configuration is included. The focus is on:

- Robust audio capture and processing
- Reliable WebSocket communication
- Responsive, intuitive user interface
- Configurable settings and preferences
- Error handling and user feedback
- Modern development practices and tooling
