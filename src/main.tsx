import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { initializeStorage } from './lib/storage'
import './index.css'

// Initialize storage with sample data
initializeStorage();

// Register service worker for offline functionality
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
