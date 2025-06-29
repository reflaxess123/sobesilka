import React, { useState, useEffect } from 'react';
import { X, Settings, Save } from 'lucide-react';
import { settingsService } from '../../shared/db';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AppSettings {
  systemPrompt: string;
  chunkDuration: number;
  sendInterval: number;
  showTranscriptionToasts: boolean;
  autoStartRecording: boolean;
}

const defaultSettings: AppSettings = {
  systemPrompt: 'You are a helpful AI assistant. Respond concisely and helpfully to voice messages.',
  chunkDuration: 5,
  sendInterval: 7,
  showTranscriptionToasts: true,
  autoStartRecording: false,
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings on open
  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const loadedSettings: AppSettings = {
        systemPrompt: await settingsService.get('systemPrompt', defaultSettings.systemPrompt),
        chunkDuration: await settingsService.get('chunkDuration', defaultSettings.chunkDuration),
        sendInterval: await settingsService.get('sendInterval', defaultSettings.sendInterval),
        showTranscriptionToasts: await settingsService.get('showTranscriptionToasts', defaultSettings.showTranscriptionToasts),
        autoStartRecording: await settingsService.get('autoStartRecording', defaultSettings.autoStartRecording),
      };
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        settingsService.set('systemPrompt', settings.systemPrompt),
        settingsService.set('chunkDuration', settings.chunkDuration),
        settingsService.set('sendInterval', settings.sendInterval),
        settingsService.set('showTranscriptionToasts', settings.showTranscriptionToasts),
        settingsService.set('autoStartRecording', settings.autoStartRecording),
      ]);
      
      toast.success('Settings saved successfully');
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    toast.success('Settings reset to defaults');
  };

  const handleInputChange = (key: keyof AppSettings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* System Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  System Prompt
                </label>
                <textarea
                  value={settings.systemPrompt}
                  onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Enter the system prompt for GPT..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  This prompt will be sent to GPT to define its behavior and response style.
                </p>
              </div>

              {/* Audio Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Audio Settings</h3>
                
                {/* Chunk Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recording Chunk Duration (seconds)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.chunkDuration}
                    onChange={(e) => handleInputChange('chunkDuration', parseInt(e.target.value) || 5)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Duration of each audio chunk that gets recorded.
                  </p>
                </div>

                {/* Send Interval */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Send Interval (seconds)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.sendInterval}
                    onChange={(e) => handleInputChange('sendInterval', parseInt(e.target.value) || 7)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How often audio chunks are sent for transcription.
                  </p>
                </div>
              </div>

              {/* UI Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">UI Settings</h3>
                
                {/* Show Transcription Toasts */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Show Transcription Toasts
                    </label>
                    <p className="text-xs text-gray-500">
                      Display toast notifications for transcribed text
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showTranscriptionToasts}
                    onChange={(e) => handleInputChange('showTranscriptionToasts', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>

                {/* Auto Start Recording */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Auto Start Recording
                    </label>
                    <p className="text-xs text-gray-500">
                      Automatically start recording when the app loads
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoStartRecording}
                    onChange={(e) => handleInputChange('autoStartRecording', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isSaving}
          >
            Reset to Defaults
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={saveSettings}
              disabled={isSaving}
              className={clsx(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center space-x-2',
                'bg-blue-600 hover:bg-blue-700 text-white',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
