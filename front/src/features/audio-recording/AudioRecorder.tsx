import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Settings, Volume2 } from 'lucide-react';
import { AudioRecorder, AudioChunk, getAudioDevices, requestMicrophonePermission } from '../../shared/lib/audio';
import { transcribeAudio } from '../../shared/api/speech-gpt';
import { audioDevicesService, settingsService } from '../../shared/db';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface AudioRecorderProps {
  onTranscription?: (text: string) => void;
  className?: string;
}

export const AudioRecorderComponent: React.FC<AudioRecorderProps> = ({
  onTranscription,
  className,
}) => {
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
        // Request permissions first
        const permission = await requestMicrophonePermission();
        setHasPermission(permission);

        if (permission) {
          // Get available audio devices
          const devices = await getAudioDevices();
          setAudioDevices(devices);

          // Load saved device or use default
          const savedDevice = await settingsService.get<string>('selectedAudioDevice');
          if (savedDevice && devices.find(d => d.deviceId === savedDevice)) {
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
    
    // If currently recording, restart with new device
    if (isRecording) {
      await stopRecording();
      // Small delay before starting with new device
      setTimeout(() => startRecording(), 100);
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
      // Clean up existing recorder
      if (audioRecorderRef.current) {
        audioRecorderRef.current.cleanup();
      }

      // Create new audio recorder
      audioRecorderRef.current = new AudioRecorder({
        sampleRate: 16000,
        channels: 1,
        chunkDuration: 5, // 5 seconds
        sendInterval: 7,  // every 7 seconds
        deviceId: selectedDevice,
      });

      await audioRecorderRef.current.initialize();

      // Start recording with chunk handler
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

  // Handle audio chunk processing
  const handleAudioChunk = async (chunk: AudioChunk) => {
    try {
      // Convert blob to file
      const file = new File([chunk.blob], `audio-${chunk.timestamp}.wav`, {
        type: 'audio/wav',
      });

      // Send to transcription API
      const response = await transcribeAudio(file);

      if (response.success && response.text.trim()) {
        setLastTranscription(response.text);
        onTranscription?.(response.text);
        
        // Show toast with transcribed text (truncated)
        const truncatedText = response.text.length > 100 
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRecorderRef.current) {
        audioRecorderRef.current.cleanup();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className={clsx('flex flex-col items-center space-y-4', className)}>
      {/* Device Selection */}
      <div className="flex items-center space-x-2">
        <Volume2 className="w-4 h-4 text-gray-600" />
        <select
          value={selectedDevice}
          onChange={(e) => handleDeviceChange(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isRecording}
        >
          <option value="" disabled>
            Select microphone
          </option>
          {audioDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Microphone ${device.deviceId.slice(0, 8)}...`}
            </option>
          ))}
        </select>
      </div>

      {/* Recording Button */}
      <button
        onClick={toggleRecording}
        disabled={!hasPermission || !selectedDevice || isInitializing}
        className={clsx(
          'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200',
          'focus:outline-none focus:ring-4 focus:ring-opacity-50',
          {
            'bg-red-500 hover:bg-red-600 focus:ring-red-300 text-white': isRecording,
            'bg-blue-500 hover:bg-blue-600 focus:ring-blue-300 text-white': !isRecording && hasPermission && selectedDevice,
            'bg-gray-300 text-gray-500 cursor-not-allowed': !hasPermission || !selectedDevice,
            'animate-pulse': isInitializing,
          }
        )}
        title={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isInitializing ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isRecording ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </button>

      {/* Status */}
      <div className="text-center">
        <div className={clsx('text-sm font-medium', {
          'text-red-600': isRecording,
          'text-gray-600': !isRecording,
        })}>
          {isInitializing ? 'Initializing...' : isRecording ? 'Recording...' : 'Ready to record'}
        </div>
        
        {recordingState !== 'inactive' && (
          <div className="text-xs text-gray-500">
            State: {recordingState}
          </div>
        )}
      </div>

      {/* Last Transcription */}
      {lastTranscription && (
        <div className="max-w-md p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-xs text-blue-600 font-medium mb-1">Last transcription:</div>
          <div className="text-sm text-blue-800">{lastTranscription}</div>
        </div>
      )}

      {/* Permissions Warning */}
      {!hasPermission && (
        <div className="max-w-md p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-800">
            Microphone permission is required. Please allow access and refresh the page.
          </div>
        </div>
      )}
    </div>
  );
};
