import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { participantsApi, callsApi } from '../lib/api'
import './Dashboard.css'

export default function Dashboard() {
  const [searchParams] = useSearchParams()
  const [profile, setProfile] = useState(null)
  const [calls, setCalls] = useState([])
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editForm, setEditForm] = useState({})
  const [error, setError] = useState('')
  const hasLoadedData = useRef(false)
  
  const { user, signOut, handleAuthCallback } = useAuth()
  const navigate = useNavigate()

  // Handle auto-login from URL tokens
  useEffect(() => {
    const authParam = searchParams.get('auth')
    
    if (authParam) {
      try {
        const authData = JSON.parse(decodeURIComponent(authParam))
        handleAuthCallback(authData)
          .then(() => {
            // Remove auth from URL
            window.history.replaceState({}, '', '/dashboard')
            setError('')
          })
          .catch(err => {
            console.error('Auto-login failed:', err)
            if (!user) {
              setError('Failed to authenticate. Please sign in manually.')
            }
          })
      } catch (err) {
        console.error('Failed to parse auth data:', err)
        if (!user) {
          setError('Failed to parse authentication data.')
        }
      }
    }
  }, [searchParams, handleAuthCallback, user])  

  // Load participant data
  useEffect(() => {
    if (!user || hasLoadedData.current) return

    const loadData = async () => {
      try {
        setLoading(true)
        const participantData = await participantsApi.getProfile()
        setProfile(participantData)
        setEditForm({
          participant_name: participantData.participant_name,
          email: participantData.email,
          recovery_notes: participantData.recovery_notes,
          preferred_call_time: participantData.preferred_call_time,
        })

        // Load call history
        const callHistory = await callsApi.getHistory(participantData.id)
        setCalls(callHistory)
        
        hasLoadedData.current = true
      } catch (err) {
        console.error('Failed to load data:', err)
        setError('Failed to load your profile')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.id])

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const updated = await participantsApi.update(profile.id, editForm)
      setProfile(updated)
      setEditing(false)
      setError('')
    } catch (err) {
      console.error('Failed to update:', err)
      setError('Failed to save changes')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !profile) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading your dashboard...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="error-message">Please sign in to access your dashboard</div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Refrain Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Sign Out</button>
      </header>

      {error && <div className="error-message">{error}</div>}

      {/* Beta Notice */}
      <div className="beta-notice">
        <strong>🧪 Beta Testing Phase</strong>
        <p>
          Refrain.ing is currently in testing. We're excited to have you try the service! 
          Your feedback is invaluable - please share your thoughts at{' '}
          <a href="mailto:support@refrain.ing">support@refrain.ing</a>
        </p>
      </div>

      <div className="dashboard-content">
        {/* Profile Section */}
        <section className="card profile-section">
          <div className="card-header">
            <h2>Your Profile</h2>
            {!editing && (
              <button onClick={() => setEditing(true)} className="edit-btn">
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <div className="edit-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editForm.participant_name}
                  onChange={(e) => setEditForm({ ...editForm, participant_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={profile.phone_number}
                  disabled
                  className="disabled-input"
                />
                <small>Phone number cannot be changed</small>
              </div>

              <div className="form-group">
                <label>Recovery Notes</label>
                <textarea
                  value={editForm.recovery_notes}
                  onChange={(e) => setEditForm({ ...editForm, recovery_notes: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Preferred Call Time</label>
                <select
                  value={editForm.preferred_call_time}
                  onChange={(e) => setEditForm({ ...editForm, preferred_call_time: e.target.value })}
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
              </div>

              <div className="button-group">
                <button onClick={handleSave} className="save-btn" disabled={loading}>
                  Save Changes
                </button>
                <button onClick={() => setEditing(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-view">
              <div className="profile-item">
                <strong>Name:</strong> {profile?.participant_name}
              </div>
              <div className="profile-item">
                <strong>Email:</strong> {profile?.email}
              </div>
              <div className="profile-item">
                <strong>Phone:</strong> {profile?.phone_number}
              </div>
              <div className="profile-item">
                <strong>Preferred Call Time:</strong> {profile?.preferred_call_time}
              </div>
              <div className="profile-item">
                <strong>Recovery Notes:</strong>
                <p>{profile?.recovery_notes || 'No notes added'}</p>
              </div>
            </div>
          )}
        </section>

        {/* Call Sia Section */}
        <section className="card call-section">
          <h2>📞 Talk to Sia</h2>
          <p className="call-intro">
            Ready to test the service? Call Sia anytime to check in or get support during your recovery journey.
          </p>
          
          <div className="call-number-box">
            <div className="phone-number">
              <span className="number-label">Call Sia:</span>
              <a href="tel:+46790081878" className="number-link">
                +46 79-008 18 78
              </a>
            </div>
            <p className="call-note">
              Available 24/7 • Swedish number • Standard call rates apply
            </p>
          </div>

          <div className="call-tips">
            <h3>Tips for your call:</h3>
            <ul>
              <li>Sia will greet you by name and ask how you're doing</li>
              <li>Be honest - there's no judgment</li>
              <li>You can call for daily check-ins or whenever you need support</li>
              <li>Each call helps Sia understand your journey better</li>
            </ul>
          </div>
        </section>

        {/* Call History Section */}
        <section className="card history-section">
          <h2>Call History</h2>
          {calls.length === 0 ? (
            <p className="empty-state">No calls yet. Give Sia a call to get started!</p>
          ) : (
            <div className="call-list">
              {calls.map((call) => (
                <div key={call.id} className="call-item">
                  <div className="call-info">
                    <strong>{new Date(call.started_at).toLocaleDateString()}</strong>
                    <span className={`status ${call.status}`}>{call.status}</span>
                  </div>
                  <div className="call-details">
                    Duration: {call.duration_seconds ? `${call.duration_seconds}s` : 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}