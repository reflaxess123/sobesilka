export interface WebSocketMessage {
  type: 'chat_response' | 'error' | 'connection' | 'ping' | 'pong';
  response?: string;
  transcribed_text?: string;
  message?: string;
  timestamp?: number;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}