import { Volume2 } from 'lucide-react';
import React from 'react';

interface AudioDeviceSelectorProps {
  devices: MediaDeviceInfo[];
  selectedDevice: string;
  onDeviceChange: (deviceId: string) => void;
  disabled?: boolean;
}

export const AudioDeviceSelector: React.FC<AudioDeviceSelectorProps> = ({
  devices,
  selectedDevice,
  onDeviceChange,
  disabled = false,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      <select
        value={selectedDevice}
        onChange={(e) => onDeviceChange(e.target.value)}
        className="px-3 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={disabled}
      >
        <option value="" disabled>
          Select microphone
        </option>
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Microphone ${device.deviceId.slice(0, 8)}...`}
          </option>
        ))}
      </select>
    </div>
  );
};