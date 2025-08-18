import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TicketProvider } from './contexts/TicketContext';
import { EventProvider } from './contexts/EventContext';
import Header from './components/Header';
import TicketForm from './components/TicketForm';
import TicketDisplay from './components/TicketDisplay';
import AdminLogin from './components/AdminLogin';
import Scanner from './components/Scanner';
import EventSettings from './components/EventSettings';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <EventProvider>
        <TicketProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
              <Header />
              <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                <Routes>
                  <Route path="/" element={<TicketForm />} />
                  <Route path="/ticket/:id" element={<TicketDisplay />} />
                  <Route path="/admin" element={<AdminLogin />} />
                  <Route 
                    path="/scanner" 
                    element={
                      <ProtectedRoute>
                        <Scanner />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/settings" 
                    element={
                      <ProtectedRoute>
                        <EventSettings />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </Router>
        </TicketProvider>
      </EventProvider>
    </AuthProvider>
  );
}

export default App;