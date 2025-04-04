
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("Application starting with Supabase integration...");
console.log("Document title functionality initialized");

// Initialize the root component
createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
