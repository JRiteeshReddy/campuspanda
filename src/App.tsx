
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import QuickNav from "./components/layout/QuickNav";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AttendanceTracker from "./pages/AttendanceTracker";
import AssignmentTracker from "./pages/AssignmentTracker";
import NotesOrganizer from "./pages/NotesOrganizer";
import EventPanda from "./pages/EventPanda";
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat";

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
    <Route path="/chat" element={<Chat />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <TooltipProvider>
                <AppRoutes />
                <QuickNav />
                <Toaster />
                <Sonner position="top-right" closeButton />
              </TooltipProvider>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
