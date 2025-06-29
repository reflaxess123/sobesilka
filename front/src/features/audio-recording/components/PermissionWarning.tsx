import React from 'react';

interface PermissionWarningProps {
  hasPermission: boolean;
}

export const PermissionWarning: React.FC<PermissionWarningProps> = ({
  hasPermission,
}) => {
  if (hasPermission) return null;

  return (
    <div className="max-w-md p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
      <div className="text-sm text-yellow-800 dark:text-yellow-300">
        Microphone permission is required. Please allow access and refresh the
        page.
      </div>
    </div>
  );
};