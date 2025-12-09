
import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoadingScreen from "@/components/ui/LoadingScreen";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AttendanceTracker from "./pages/AttendanceTracker";
import AssignmentTracker from "./pages/AssignmentTracker";
import NotesOrganizer from "./pages/NotesOrganizer";
import EventPanda from "./pages/EventPanda";
import AI from "./pages/AI";
import NotFound from "./pages/NotFound";

// Create a client for React Query
const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/attendance" element={<AttendanceTracker />} />
    <Route path="/assignments" element={<AssignmentTracker />} />
    <Route path="/notes" element={<NotesOrganizer />} />
    <Route path="/events" element={<EventPanda />} />
    <Route path="/ai" element={<NotFound />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <TooltipProvider>
                {/* Loading screen */}
                <LoadingScreen isLoading={isLoading} />
                
                {/* Main app content with fade-in when loading completes */}
                <div className={`${isLoading ? 'opacity-0' : 'animate-fade-in'} transition-opacity duration-500`}>
                  <AppRoutes />
                  <Toaster />
                  <Sonner position="top-right" closeButton />
                </div>
              </TooltipProvider>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
