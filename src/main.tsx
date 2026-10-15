import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Resilient handling for Vite development server transport / WebSocket connection notices in sandboxed preview iframe
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || String(event.reason || '');
    if (
      reason.includes('createWebSocketModuleRunnerTransport') ||
      reason.includes('WebSocket') ||
      reason.includes('failed to connect') ||
      reason.includes('vite')
    ) {
      // Gracefully prevent uncaught rejection from bubbling up in dev server
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (
      msg.includes('createWebSocketModuleRunnerTransport') ||
      msg.includes('WebSocket') ||
      msg.includes('vite/client')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
