import type { AudioConfig, AudioChunk } from '../types/audio';

export interface AudioRecorderConfig extends AudioConfig {}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private config: AudioRecorderConfig;
  private isRecording = false;
  private chunkTimer: NodeJS.Timeout | null = null;
  private sendTimer: NodeJS.Timeout | null = null;
  private onChunkReady: ((chunk: AudioChunk) => void) | null = null;

  constructor(config: AudioRecorderConfig) {
    this.config = {
      ...config,
      sampleRate: config.sampleRate ?? 16000,
      channels: config.channels ?? 1,
      chunkDuration: config.chunkDuration ?? 5,
      sendInterval: config.sendInterval ?? 7,
    };
  }

  async initialize(): Promise<void> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          sampleRate: this.config.sampleRate,
          channelCount: this.config.channels,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          ...(this.config.deviceId && { deviceId: this.config.deviceId }),
        },
      };

      this.audioStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Create MediaRecorder with appropriate options
      const options: MediaRecorderOptions = {
        mimeType: this.getSupportedMimeType(),
      };

      this.mediaRecorder = new MediaRecorder(this.audioStream, options);
      this.setupMediaRecorderEvents();
    } catch (error) {
      console.error('Failed to initialize audio recorder:', error);
      throw new Error('Failed to access microphone. Please check permissions.');
    }
  }

  private getSupportedMimeType(): string {
    // Priority order for audio formats
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/wav',
      'audio/mp4',
    ];

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType;
      }
    }

    return ''; // Let the browser choose
  }

  private setupMediaRecorderEvents(): void {
    if (!this.mediaRecorder) return;

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      this.processChunks();
    };

    this.mediaRecorder.onerror = (event) => {
      console.error('MediaRecorder error:', event);
    };
  }

  private processChunks(): void {
    if (this.chunks.length === 0) return;

    const blob = new Blob(this.chunks, { type: 'audio/wav' });
    const audioChunk: AudioChunk = {
      blob,
      timestamp: Date.now(),
      duration: this.config.chunkDuration,
    };

    this.chunks = [];

    if (this.onChunkReady) {
      this.onChunkReady(audioChunk);
    }
  }

  async start(onChunkReady: (chunk: AudioChunk) => void): Promise<void> {
    if (this.isRecording) {
      console.warn('Already recording');
      return;
    }

    if (!this.mediaRecorder) {
      await this.initialize();
    }

    if (!this.mediaRecorder) {
      throw new Error('MediaRecorder not initialized');
    }

    this.onChunkReady = onChunkReady;
    this.isRecording = true;

    // Start continuous recording with chunk intervals
    this.startRecordingLoop();
  }

  private startRecordingLoop(): void {
    if (!this.mediaRecorder || !this.isRecording) return;

    // Start recording
    this.mediaRecorder.start();

    // Stop recording after chunk duration
    this.chunkTimer = setTimeout(() => {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop();
      }
    }, this.config.chunkDuration * 1000);

    // Schedule next recording cycle
    this.sendTimer = setTimeout(() => {
      if (this.isRecording) {
        this.startRecordingLoop();
      }
    }, this.config.sendInterval * 1000);
  }

  stop(): void {
    this.isRecording = false;

    if (this.chunkTimer) {
      clearTimeout(this.chunkTimer);
      this.chunkTimer = null;
    }

    if (this.sendTimer) {
      clearTimeout(this.sendTimer);
      this.sendTimer = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
  }

  cleanup(): void {
    this.stop();

    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop());
      this.audioStream = null;
    }

    this.mediaRecorder = null;
    this.onChunkReady = null;
  }

  getRecordingState(): string {
    return this.mediaRecorder?.state || 'inactive';
  }

  isActive(): boolean {
    return this.isRecording;
  }

  // Convert audio blob to WAV format if needed
  async convertToWav(blob: Blob): Promise<Blob> {
    // For now, we'll assume the browser provides appropriate format
    // In a production app, you might want to use a library like lamejs
    // or implement actual WAV conversion here
    return blob;
  }
}

// Utility function to get available audio devices
export async function getAudioDevices(): Promise<MediaDeviceInfo[]> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device) => device.kind === 'audioinput');
  } catch (error) {
    console.error('Failed to get audio devices:', error);
    return [];
  }
}

// Utility function to request microphone permissions
export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    return false;
  }
}
