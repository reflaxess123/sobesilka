import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { transcribeAudio } from '../../../shared/api/speech-gpt';
import { AUDIO_CONFIG } from '../../../shared/constants/audio';
import { settingsService } from '../../../shared/db';
import {
  AudioRecorder,
  getAudioDevices,
  requestMicrophonePermission,
  type AudioChunk,
} from '../../../shared/lib/audio';

interface UseAudioRecorderProps {
  onTranscription?: (text: string) => void;
}

export const useAudioRecorder = ({ onTranscription }: UseAudioRecorderProps = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [recordingState, setRecordingState] = useState<string>('inactive');
  const [lastTranscription, setLastTranscription] = useState<string>('');

  const audioRecorderRef = useRef<AudioRecorder | null>(null);

  // Initialize audio devices and permissions
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        const permission = await requestMicrophonePermission();
        setHasPermission(permission);

        if (permission) {
          const devices = await getAudioDevices();
          setAudioDevices(devices);

          const savedDevice = await settingsService.get<string>('selectedAudioDevice');
          if (savedDevice && devices.find((d) => d.deviceId === savedDevice)) {
            setSelectedDevice(savedDevice);
          } else if (devices.length > 0) {
            setSelectedDevice(devices[0].deviceId);
          }
        }
      } catch (error) {
        console.error('Failed to initialize audio:', error);
        toast.error('Failed to initialize audio. Please check your microphone permissions.');
      }
    };

    initializeAudio();
  }, []);

  // Handle device selection change
  const handleDeviceChange = async (deviceId: string) => {
    setSelectedDevice(deviceId);
    await settingsService.set('selectedAudioDevice', deviceId);

    if (isRecording) {
      await stopRecording();
      setTimeout(() => startRecording(), 100);
    }
  };

  // Handle audio chunk processing
  const handleAudioChunk = async (chunk: AudioChunk) => {
    try {
      const file = new File([chunk.blob], `audio-${chunk.timestamp}.wav`, {
        type: 'audio/wav',
      });

      const response = await transcribeAudio(file);

      if (response.success && response.text.trim()) {
        setLastTranscription(response.text);
        onTranscription?.(response.text);

        const truncatedText =
          response.text.length > 100
            ? response.text.substring(0, 100) + '...'
            : response.text;

        toast.success(`Transcribed: "${truncatedText}"`, {
          duration: 3000,
        });
      } else if (response.error) {
        console.error('Transcription error:', response.error);
        toast.error('Transcription failed');
      }
    } catch (error) {
      console.error('Failed to process audio chunk:', error);
      toast.error('Failed to process audio');
    }
  };

  // Start recording
  const startRecording = async () => {
    if (!hasPermission) {
      toast.error('Microphone permission required');
      return;
    }

    if (!selectedDevice) {
      toast.error('Please select a microphone');
      return;
    }

    setIsInitializing(true);

    try {
      if (audioRecorderRef.current) {
        audioRecorderRef.current.cleanup();
      }

      audioRecorderRef.current = new AudioRecorder({
        sampleRate: AUDIO_CONFIG.SAMPLE_RATE,
        channels: AUDIO_CONFIG.CHANNELS,
        chunkDuration: AUDIO_CONFIG.CHUNK_DURATION,
        sendInterval: AUDIO_CONFIG.SEND_INTERVAL,
        deviceId: selectedDevice,
      });

      await audioRecorderRef.current.initialize();
      await audioRecorderRef.current.start(handleAudioChunk);

      setIsRecording(true);
      setRecordingState(audioRecorderRef.current.getRecordingState());
      toast.success('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Failed to start recording. Please check your microphone.');
    } finally {
      setIsInitializing(false);
    }
  };

  // Stop recording
  const stopRecording = async () => {
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingState('inactive');
      toast.success('Recording stopped');
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRecorderRef.current) {
        audioRecorderRef.current.cleanup();
      }
    };
  }, []);

  return {
    isRecording,
    hasPermission,
    audioDevices,
    selectedDevice,
    isInitializing,
    recordingState,
    lastTranscription,
    handleDeviceChange,
    toggleRecording,
    startRecording,
    stopRecording,
  };
};