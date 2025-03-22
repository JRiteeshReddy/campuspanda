
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("Application starting with Supabase integration...");

// Initialize the root component
createRoot(document.getElementById("root")!).render(<App />);
