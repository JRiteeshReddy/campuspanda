
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Define float animation for loading screen
const style = document.createElement('style');
style.textContent = `
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
`;
document.head.appendChild(style);

console.log("Application starting with Supabase integration...");
console.log("Document title functionality initialized");

// Initialize the root component
createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
