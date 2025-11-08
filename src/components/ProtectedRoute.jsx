// src/components/ProtectedRoute.jsx
import { Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'

export default function ProtectedRoute({ children }) {
  const { user, loading, handleAuthCallback } = useAuth()
  const [searchParams] = useSearchParams()
  const [processingAuth, setProcessingAuth] = useState(false)

  // Check if there are auth tokens in the URL
  useEffect(() => {
    const authParam = searchParams.get('auth')
    
    if (authParam && !user && !processingAuth) {
      setProcessingAuth(true)
      
      try {
        const authData = JSON.parse(decodeURIComponent(authParam))
        console.log('🔐 ProtectedRoute: Processing auth from URL...')
        
        handleAuthCallback(authData)
          .then(() => {
            console.log('✅ ProtectedRoute: Auth callback successful')
            // Clean up URL
            window.history.replaceState({}, '', '/dashboard')
            setProcessingAuth(false)
          })
          .catch(err => {
            console.error('❌ ProtectedRoute: Auth callback failed:', err)
            setProcessingAuth(false)
          })
      } catch (err) {
        console.error('❌ ProtectedRoute: Failed to parse auth data:', err)
        setProcessingAuth(false)
      }
    }
  }, [searchParams, user, handleAuthCallback, processingAuth])

  // Show loading while checking auth or processing URL auth
  if (loading || processingAuth) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#666' }}>
          {processingAuth ? 'Logging you in...' : 'Loading...'}
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Only redirect to login if there's no user AND no auth tokens
  if (!user && !searchParams.get('auth')) {
    return <Navigate to="/login" replace />
  }

  return children
}