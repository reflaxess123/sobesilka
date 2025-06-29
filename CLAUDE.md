# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Speech-GPT Web is a real-time speech-to-text application with AI chat responses. The system captures audio from the user's microphone, transcribes it using GPT-4o-mini-transcribe, and sends the transcribed text to GPT-4o-mini for intelligent responses via WebSocket.

## Architecture

This is a **monorepo** with two main applications:
- **Backend** (`/back`): FastAPI Python application with WebSocket support
- **Frontend** (`/front`): React 19 + TypeScript application using Feature-Sliced Design (FSD)

### Audio Processing Flow
1. Frontend captures audio in 5-second chunks every 7 seconds (configurable)
2. Audio is sent to backend as WAV 16kHz mono
3. Backend proxies audio to ProxyAPI for transcription
4. Transcribed text is automatically sent to GPT chat endpoint
5. GPT response is broadcast via WebSocket to frontend
6. Frontend displays responses in real-time chat interface

### Frontend Architecture (Feature-Sliced Design)
```
src/
├── app/           # Application initialization, providers, global configuration
├── features/      # Business features (audio-recording, chat, settings)
├── entities/      # Business entities and domain logic
├── shared/        # Reusable resources (API, components, hooks, types, constants)
└── widgets/       # Complex UI blocks
```

Key architectural decisions:
- **Audio processing** is handled in `features/audio-recording` with dedicated custom hooks
- **WebSocket communication** is managed through shared utilities and custom hooks
- **Settings persistence** uses IndexedDB via Dexie
- **Error handling** implemented with React Error Boundaries
- **Toast notifications** for user feedback and transcription results

## Development Commands

### Quick Start
```bash
# Start both backend and frontend (from root)
start-dev          # Windows CMD
.\start-dev        # PowerShell

# Generate API client (requires backend running)
generate-api       # Windows CMD  
.\generate-api     # PowerShell
```

### Backend Commands
```bash
cd back
poetry install                    # Install dependencies
poetry run python main.py        # Start FastAPI server (localhost:8000)
poetry run uvicorn main:app --reload  # Alternative start with auto-reload
```

### Frontend Commands
```bash
cd front
npm install                       # Install dependencies
npm run dev                       # Start dev server (localhost:3000)
npm run build                     # Production build
npm run lint                      # ESLint checking
npm run format                    # Prettier formatting
npm run api:generate              # Generate API client from backend OpenAPI
npm run api:generate:full         # Auto-start backend + generate API
```

## Key Configuration

### Backend Environment (.env in /back)
```
PROXY_API_KEY=your_proxy_api_key_here
PROXY_API_BASE_URL=https://api.proxyapi.ru
SYSTEM_PROMPT=You are a helpful AI assistant. Respond concisely and helpfully to voice messages.
```

### Frontend Build Configuration
- **Rsbuild** for modern bundling (replaces Webpack/Vite)
- **TypeScript strict mode** enabled
- **ESLint** with React hooks and TypeScript rules
- **Orval** for automatic API client generation from OpenAPI schema

## Important Implementation Details

### Audio Recording
- Uses `MediaRecorder` API with custom `AudioRecorder` class in `shared/lib/audio.ts`
- Configuration constants in `shared/constants/audio.ts` (sample rate, chunk duration, etc.)
- Device selection and permission handling in `useAudioRecorder` hook
- Audio chunks sent as WAV files to backend transcription endpoint

### WebSocket Communication
- Custom `WebSocketService` in `shared/lib/websocket.ts`
- Connection management with automatic reconnection
- Message types: `chat_response`, `error`, `connection`, `ping`, `pong`
- React hook `useWebSocket` for component integration

### State Management
- **TanStack Query** for server state and API calls
- **React hooks** for local component state
- **IndexedDB (Dexie)** for persistent settings storage
- **Context providers** for theme and query client

### Component Architecture
Recent refactoring split large components into smaller, focused components:
- `AudioRecorderComponent` split into 5 sub-components with dedicated hook
- Custom hooks for audio, WebSocket, and toast functionality
- Error boundaries for graceful error handling
- Shared TypeScript types for consistency

### API Client Generation
- **Orval** generates TypeScript client from FastAPI OpenAPI schema
- Generated files in `src/shared/api/speech-gpt.ts`
- Custom Axios instance with interceptors in `src/shared/api/mutator/custom-instance.ts`
- TanStack Query hooks automatically generated for all endpoints

## Development Focus

This application is designed for **local development only**. Key areas of focus:
- Robust real-time audio capture and processing
- Reliable WebSocket communication with error recovery
- Responsive UI with proper loading states and error handling
- Configurable audio settings and user preferences
- Modern React patterns with proper TypeScript typing