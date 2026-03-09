import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const showFatalScreen = (message: string) => {
  const rootEl = document.getElementById('root');
  if (!rootEl) return;

  rootEl.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui, sans-serif;background:#f3f4f6;color:#111827;">
      <div style="max-width:680px;background:white;border:1px solid #e5e7eb;border-radius:12px;padding:24px;box-shadow:0 10px 30px rgba(0,0,0,.08)">
        <h1 style="margin:0 0 8px 0;font-size:20px;">App failed to load</h1>
        <p style="margin:0 0 8px 0;line-height:1.5;">A runtime error prevented the app from rendering.</p>
        <pre style="white-space:pre-wrap;background:#f9fafb;padding:12px;border-radius:8px;border:1px solid #e5e7eb;overflow:auto;">${message}</pre>
        <p style="margin-top:12px;font-size:14px;color:#6b7280;">Try a hard refresh (Ctrl/Cmd + Shift + R). If this persists, this error output helps pinpoint the issue.</p>
      </div>
    </div>
  `;
};

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error || event.message);
  showFatalScreen(String(event.error?.message || event.message || 'Unknown error'));
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason);
  showFatalScreen(String(event.reason?.message || event.reason || 'Unhandled promise rejection'));
});

try {
  const root = document.getElementById('root');
  if (!root) throw new Error('Root element not found');
  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Bootstrap error:', error);
  showFatalScreen(String((error as Error)?.message || error));
}
