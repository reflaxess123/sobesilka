export interface ChatMessage {
  id: string;
  type: 'transcription' | 'response' | 'error';
  content: string;
  timestamp: number;
  transcribedText?: string;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';