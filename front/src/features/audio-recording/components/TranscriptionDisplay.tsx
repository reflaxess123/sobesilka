import React from 'react';

interface TranscriptionDisplayProps {
  transcription: string;
}

export const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
  transcription,
}) => {
  if (!transcription) return null;

  return (
    <div className="max-w-md p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
        Last transcription:
      </div>
      <div className="text-sm text-blue-800 dark:text-blue-300">
        {transcription}
      </div>
    </div>
  );
};