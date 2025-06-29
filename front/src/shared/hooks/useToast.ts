import toast from 'react-hot-toast';

export const useToast = () => {
  const showSuccess = (message: string, options?: { duration?: number; icon?: string }) => {
    toast.success(message, {
      duration: options?.duration || 3000,
      icon: options?.icon,
    });
  };

  const showError = (message: string, options?: { duration?: number }) => {
    toast.error(message, {
      duration: options?.duration || 4000,
    });
  };

  const showTranscription = (text: string) => {
    const truncatedText = text.length > 100 ? text.substring(0, 100) + '...' : text;
    showSuccess(`Transcribed: "${truncatedText}"`);
  };

  const showGptResponse = () => {
    showSuccess('New response from GPT', { icon: '🤖', duration: 2000 });
  };

  const showConnectionSuccess = () => {
    showSuccess('Connected to chat service');
  };

  const showConnectionError = () => {
    showError('Failed to connect to chat service');
  };

  const showRecordingStart = () => {
    showSuccess('Recording started');
  };

  const showRecordingStop = () => {
    showSuccess('Recording stopped');
  };

  const showChatCleared = () => {
    showSuccess('Chat history cleared');
  };

  return {
    showSuccess,
    showError,
    showTranscription,
    showGptResponse,
    showConnectionSuccess,
    showConnectionError,
    showRecordingStart,
    showRecordingStop,
    showChatCleared,
  };
};