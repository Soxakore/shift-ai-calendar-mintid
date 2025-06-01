
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { initializeStorage } from './lib/storage'
import './index.css'

console.log('🎬 main.tsx starting...');

// Initialize storage with sample data
console.log('💾 Initializing storage...');
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

console.log('🚀 Creating React root...');
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  console.log('✅ Root element found, rendering App...');
  createRoot(rootElement).render(<App />);
}
