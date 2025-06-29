export interface AudioConfig {
  sampleRate: number;
  channels: number;
  chunkDuration: number;
  sendInterval: number;
  deviceId: string;
}

export interface AudioChunk {
  blob: Blob;
  timestamp: number;
  duration: number;
}

export interface TranscriptionResponse {
  success: boolean;
  text: string;
  error?: string;
}