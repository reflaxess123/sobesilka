import clsx from 'clsx';
import React from 'react';
import {
  AudioDeviceSelector,
  RecordingButton,
  RecordingStatus,
  TranscriptionDisplay,
  PermissionWarning,
} from './components';
import { useAudioRecorder } from './hooks/useAudioRecorder';

interface AudioRecorderProps {
  onTranscription?: (text: string) => void;
  className?: string;
}

export const AudioRecorderComponent: React.FC<AudioRecorderProps> = ({
  onTranscription,
  className,
}) => {
  const {
    isRecording,
    hasPermission,
    audioDevices,
    selectedDevice,
    isInitializing,
    recordingState,
    lastTranscription,
    handleDeviceChange,
    toggleRecording,
  } = useAudioRecorder({ onTranscription });

  return (
    <div className={clsx('flex flex-col items-center space-y-4', className)}>
      <AudioDeviceSelector
        devices={audioDevices}
        selectedDevice={selectedDevice}
        onDeviceChange={handleDeviceChange}
        disabled={isRecording}
      />

      <RecordingButton
        isRecording={isRecording}
        isInitializing={isInitializing}
        hasPermission={hasPermission}
        hasSelectedDevice={!!selectedDevice}
        onToggle={toggleRecording}
      />

      <RecordingStatus
        isRecording={isRecording}
        isInitializing={isInitializing}
        recordingState={recordingState}
      />

      <TranscriptionDisplay transcription={lastTranscription} />

      <PermissionWarning hasPermission={hasPermission} />
    </div>
  );
};
