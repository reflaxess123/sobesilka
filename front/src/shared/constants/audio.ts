export const AUDIO_CONFIG = {
  SAMPLE_RATE: 16000,
  CHANNELS: 1,
  CHUNK_DURATION: 5, // seconds
  SEND_INTERVAL: 7, // seconds
  MIME_TYPE: 'audio/webm;codecs=opus',
} as const;

export const RECORDING_STATES = {
  IDLE: 'idle',
  RECORDING: 'recording',
  PROCESSING: 'processing',
  ERROR: 'error',
} as const;

export type RecordingState = typeof RECORDING_STATES[keyof typeof RECORDING_STATES];