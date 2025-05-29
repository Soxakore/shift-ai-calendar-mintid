import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { initializeStorage } from './lib/storage'
import './index.css'

// Initialize storage with sample data
initializeStorage();

createRoot(document.getElementById("root")!).render(<App />);
