import clsx from 'clsx';
import React from 'react';

interface RecordingStatusProps {
  isRecording: boolean;
  isInitializing: boolean;
  recordingState: string;
}

export const RecordingStatus: React.FC<RecordingStatusProps> = ({
  isRecording,
  isInitializing,
  recordingState,
}) => {
  const getStatusText = () => {
    if (isInitializing) return 'Initializing...';
    if (isRecording) return 'Recording...';
    return 'Ready to record';
  };

  return (
    <div className="text-center">
      <div
        className={clsx('text-sm font-medium', {
          'text-red-600 dark:text-red-400': isRecording,
          'text-gray-600 dark:text-gray-400': !isRecording,
        })}
      >
        {getStatusText()}
      </div>

      {recordingState !== 'inactive' && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          State: {recordingState}
        </div>
      )}
    </div>
  );
};