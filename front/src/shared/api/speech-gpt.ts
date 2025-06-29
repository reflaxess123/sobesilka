import { customInstance } from './mutator/custom-instance';

export interface TranscriptionResponse {
  text: string;
  success: boolean;
  error?: string;
}

export interface ChatRequest {
  message: string;
  system_prompt?: string;
}

export interface ChatResponse {
  response: string;
  success: boolean;
  error?: string;
}

export interface HealthResponse {
  status: string;
  proxy_api_configured: boolean;
}

// Transcription API
export const transcribeAudio = async (
  audioFile: File,
): Promise<TranscriptionResponse> => {
  const formData = new FormData();
  formData.append('file', audioFile);

  const response = await customInstance.post<TranscriptionResponse>(
    '/api/transcribe',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response;
};

// Chat API
export const sendChatMessage = async (
  request: ChatRequest,
): Promise<ChatResponse> => {
  const response = await customInstance.post<ChatResponse>(
    '/api/chat',
    request,
  );
  return response;
};

// Health check
export const getHealthStatus = async (): Promise<HealthResponse> => {
  const response = await customInstance.get<HealthResponse>('/health');
  return response;
};

// Root endpoint
export const getRootMessage = async () => {
  const response = await customInstance.get('/');
  return response;
};
