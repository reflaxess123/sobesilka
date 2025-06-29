import clsx from 'clsx';
import { Mic, MicOff } from 'lucide-react';
import React from 'react';

interface RecordingButtonProps {
  isRecording: boolean;
  isInitializing: boolean;
  hasPermission: boolean;
  hasSelectedDevice: boolean;
  onToggle: () => void;
}

export const RecordingButton: React.FC<RecordingButtonProps> = ({
  isRecording,
  isInitializing,
  hasPermission,
  hasSelectedDevice,
  onToggle,
}) => {
  const isDisabled = !hasPermission || !hasSelectedDevice || isInitializing;

  return (
    <button
      onClick={onToggle}
      disabled={isDisabled}
      className={clsx(
        'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200',
        'focus:outline-none focus:ring-4 focus:ring-opacity-50',
        {
          'bg-red-500 hover:bg-red-600 focus:ring-red-300 text-white':
            isRecording,
          'bg-blue-500 hover:bg-blue-600 focus:ring-blue-300 text-white':
            !isRecording && hasPermission && hasSelectedDevice,
          'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed':
            isDisabled,
          'animate-pulse': isInitializing,
        },
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
  );
};