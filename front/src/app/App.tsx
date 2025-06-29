import { Mic, Settings } from 'lucide-react';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AudioRecorderComponent } from '../features/audio-recording/AudioRecorder';
import { ChatResponses } from '../features/chat/ChatResponses';
import { SettingsModal } from '../features/settings/SettingsModal';
import { QueryProvider, ThemeProvider } from './providers';
import { ErrorBoundary } from '../shared/components';

const App = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryProvider>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-3">
                  <Mic className="w-8 h-8 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Speech-GPT Web
                  </h1>
                </div>

                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col">
                <div className="flex items-center space-x-2 mb-6">
                  <Mic className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Voice Input
                  </h2>
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <AudioRecorderComponent className="w-full" />
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                    How it works:
                  </h3>
                  <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                    <li>
                      • Select your microphone and click the record button
                    </li>
                    <li>
                      • Audio is captured in 5-second chunks every 7 seconds
                    </li>
                    <li>
                      • Speech is transcribed using GPT-4o-mini-transcribe
                    </li>
                    <li>• GPT responses appear in the chat panel</li>
                  </ul>
                </div>
              </div>

              {/* Right Panel - Chat Responses */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
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
              className: 'dark:bg-gray-800 dark:text-gray-100',
              style: {
                background: 'var(--toast-bg, #ffffff)',
                color: 'var(--toast-text, #1f2937)',
                border: '1px solid var(--toast-border, #e5e7eb)',
              },
              success: {
                className: 'dark:bg-green-800',
                style: {
                  background: 'var(--toast-success-bg, #059669)',
                  color: '#ffffff',
                },
              },
              error: {
                className: 'dark:bg-red-800',
                style: {
                  background: 'var(--toast-error-bg, #DC2626)',
                  color: '#ffffff',
                },
              },
            }}
          />
        </div>
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
