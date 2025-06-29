import clsx from 'clsx';
import { Bot, MessageCircle, Trash2, User } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  createWebSocketService,
  getWebSocketService,
  type WebSocketMessage,
} from '../../shared/lib/websocket';

interface ChatMessage {
  id: string;
  type: 'transcription' | 'response' | 'error';
  content: string;
  timestamp: number;
  transcribedText?: string; // For response messages, store the original transcription
}

interface ChatResponsesProps {
  className?: string;
}

export const ChatResponses: React.FC<ChatResponsesProps> = ({ className }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('disconnected');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize WebSocket connection
  useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        setConnectionStatus('connecting');

        const wsService = createWebSocketService({
          url: 'ws://localhost:8000/ws',
        });

        // Set up event listeners
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

    // Cleanup on unmount
    return () => {
      const wsService = getWebSocketService();
      if (wsService) {
        wsService.disconnect();
      }
    };
  }, []);

  const handleChatResponse = (message: WebSocketMessage) => {
    if (
      message.type === 'chat_response' &&
      message.response &&
      message.transcribed_text
    ) {
      // Add transcription message first
      const transcriptionMessage: ChatMessage = {
        id: `transcription-${Date.now()}`,
        type: 'transcription',
        content: message.transcribed_text,
        timestamp: Date.now(),
      };

      // Add GPT response message
      const responseMessage: ChatMessage = {
        id: `response-${Date.now()}`,
        type: 'response',
        content: message.response,
        timestamp: Date.now() + 1, // Ensure it comes after transcription
        transcribedText: message.transcribed_text,
      };

      setMessages((prev) => [...prev, transcriptionMessage, responseMessage]);

      // Show toast notification for the response
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

  const clearMessages = () => {
    setMessages([]);
    toast.success('Chat history cleared');
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className={clsx('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Chat History
          </h2>
          <div
            className={clsx('w-2 h-2 rounded-full', {
              'bg-green-500': connectionStatus === 'connected',
              'bg-yellow-500': connectionStatus === 'connecting',
              'bg-red-500': connectionStatus === 'disconnected',
            })}
          />
        </div>

        <button
          onClick={clearMessages}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          title="Clear chat history"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>No messages yet</p>
              <p className="text-sm">
                Start recording to see transcriptions and responses
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={clsx('flex space-x-3', {
                  'justify-end': message.type === 'transcription',
                  'justify-start': message.type === 'response',
                  'justify-center': message.type === 'error',
                })}
              >
                {/* User/Transcription Messages */}
                {message.type === 'transcription' && (
                  <>
                    <div className="flex flex-col items-end max-w-xs lg:max-w-md">
                      <div className="bg-blue-600 dark:bg-blue-500 text-white rounded-lg px-4 py-2">
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(message.timestamp)}
                        </span>
                        <User className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                      </div>
                    </div>
                  </>
                )}

                {/* GPT Response Messages */}
                {message.type === 'response' && (
                  <>
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="flex flex-col max-w-xs lg:max-w-md">
                      <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 shadow-sm">
                        <p className="text-sm text-gray-800 dark:text-gray-200">
                          {message.content}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </>
                )}

                {/* Error Messages */}
                {message.type === 'error' && (
                  <div className="max-w-xs lg:max-w-md">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-300 rounded-lg px-4 py-2">
                      <p className="text-sm">⚠️ {message.content}</p>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Connection Status */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-center">
          <span
            className={clsx('text-xs font-medium', {
              'text-green-600': connectionStatus === 'connected',
              'text-yellow-600': connectionStatus === 'connecting',
              'text-red-600': connectionStatus === 'disconnected',
            })}
          >
            {connectionStatus === 'connected' && '🟢 Connected'}
            {connectionStatus === 'connecting' && '🟡 Connecting...'}
            {connectionStatus === 'disconnected' && '🔴 Disconnected'}
          </span>
        </div>
      </div>
    </div>
  );
};
