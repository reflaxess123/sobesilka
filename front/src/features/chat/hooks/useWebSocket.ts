import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  createWebSocketService,
  getWebSocketService,
  type WebSocketMessage,
} from '../../../shared/lib/websocket';

interface ChatMessage {
  id: string;
  type: 'transcription' | 'response' | 'error';
  content: string;
  timestamp: number;
  transcribedText?: string;
}

interface UseWebSocketProps {
  url: string;
}

export const useWebSocket = ({ url }: UseWebSocketProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('disconnected');

  const handleChatResponse = (message: WebSocketMessage) => {
    if (
      message.type === 'chat_response' &&
      message.response &&
      message.transcribed_text
    ) {
      const transcriptionMessage: ChatMessage = {
        id: `transcription-${Date.now()}`,
        type: 'transcription',
        content: message.transcribed_text,
        timestamp: Date.now(),
      };

      const responseMessage: ChatMessage = {
        id: `response-${Date.now()}`,
        type: 'response',
        content: message.response,
        timestamp: Date.now() + 1,
        transcribedText: message.transcribed_text,
      };

      setMessages((prev) => [...prev, transcriptionMessage, responseMessage]);

      toast.success('New response from GPT', {
        icon: '🤖',
        duration: 2000,
      });
    }
  };

  const handleError = (message: WebSocketMessage) => {
    if (message.type === 'error' && message.message) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'error',
        content: message.message,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      toast.error('Error: ' + message.message);
    }
  };

  useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        setConnectionStatus('connecting');

        const wsService = createWebSocketService({ url });

        wsService.on('chat_response', handleChatResponse);
        wsService.on('error', handleError);

        await wsService.connect();
        setConnectionStatus('connected');

        toast.success('Connected to chat service');
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        setConnectionStatus('disconnected');
        toast.error('Failed to connect to chat service');
      }
    };

    initializeWebSocket();

    return () => {
      const wsService = getWebSocketService();
      if (wsService) {
        wsService.disconnect();
      }
    };
  }, [url]);

  const clearMessages = () => {
    setMessages([]);
    toast.success('Chat history cleared');
  };

  return {
    messages,
    connectionStatus,
    clearMessages,
  };
};