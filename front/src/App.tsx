import './App.css';
import { QueryProvider } from './app/providers';

const App = () => {
  return (
    <QueryProvider>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Sobesilka Frontend
          </h1>
          <p className="text-gray-600">
            Rsbuild + React + TypeScript + TailwindCSS + TanStack Query + Orval
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              API клиент будет сгенерирован автоматически через Orval
            </p>
          </div>
        </div>
      </div>
    </QueryProvider>
  );
};

export default App;
