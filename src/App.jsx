import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navigation from './components/layout/Navigation'
import AuthPage from './components/auth/AuthPage'
import FeedPage from './components/feed/FeedPage'
import ExplorePage from './components/explore/ExplorePage'
import MessagesPage from './components/messages/MessagesPage'
import ProfilePage from './components/profile/ProfilePage'
import AdminPanel from './components/admin/AdminPanel'
import VerificationPage from './components/verification/VerificationPage'
import TopicsPage from './components/topics/TopicsPage'
import LoadingSpinner from './components/ui/LoadingSpinner'
import './App.css'

// Componente para rutas protegidas
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />
  }
  
  return children
}

// Componente para rutas públicas (solo para usuarios no autenticados)
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  if (user) {
    return <Navigate to="/" replace />
  }
  
  return children
}

// Layout principal de la aplicación
function AppLayout({ children }) {
  const { user } = useAuth()
  
  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navigation />}
      <main className={user ? "pt-16" : ""}>
        {children}
      </main>
    </div>
  )
}

function AppContent() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* Rutas públicas */}
          <Route 
            path="/auth" 
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            } 
          />
          
          {/* Rutas protegidas */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <FeedPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/explore" 
            element={
              <ProtectedRoute>
                <ExplorePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/messages" 
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile/:username?" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/topics" 
            element={
              <ProtectedRoute>
                <TopicsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/verification" 
            element={
              <ProtectedRoute>
                <VerificationPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          
          {/* Ruta por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

