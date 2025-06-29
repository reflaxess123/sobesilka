import React, { useState } from 'react';
import './App.css';
import { QueryProvider } from './providers';
import { AudioRecorderComponent } from '../features/audio-recording/AudioRecorder';
import { ChatResponses } from '../features/chat/ChatResponses';
import { SettingsModal } from '../features/settings/SettingsModal';
import { Settings, Mic } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

const App = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <QueryProvider>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <Mic className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Speech-GPT Web
                </h1>
              </div>
              
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Open settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)]">
            {/* Left Panel - Audio Recording */}
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
              <div className="flex items-center space-x-2 mb-6">
                <Mic className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">Voice Input</h2>
              </div>
              
              <div className="flex-1 flex items-center justify-center">
                <AudioRecorderComponent className="w-full" />
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-2">How it works:</h3>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Select your microphone and click the record button</li>
                  <li>• Audio is captured in 5-second chunks every 7 seconds</li>
                  <li>• Speech is transcribed using GPT-4o-mini-transcribe</li>
                  <li>• GPT responses appear in the chat panel</li>
                </ul>
              </div>
            </div>

            {/* Right Panel - Chat Responses */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <ChatResponses className="h-full" />
            </div>
          </div>
        </main>

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#059669',
              },
            },
            error: {
              style: {
                background: '#DC2626',
              },
            },
          }}
        />
      </div>
    </QueryProvider>
  );
};

export default App;
