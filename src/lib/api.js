// lib/api.js

import axios from 'axios'
import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || 'https://app.refrain.ing'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to all requests
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  
  return config
})

// API methods
export const participantsApi = {
  getProfile: async () => {
    const response = await api.get('/api/participants/')
    return response.data[0] // Return first participant (user's profile)
  },
  
  update: async (participantId, data) => {
    const response = await api.put(`/api/participants/${participantId}`, data)
    return response.data
  },
}

export const callsApi = {
  initiate: async (participantId) => {
    const response = await api.post('/api/calls/initiate', { participant_id: participantId })
    return response.data
  },
  
  getHistory: async (participantId) => {
    const response = await api.get(`/api/calls/participant/${participantId}`)
    return response.data
  },
  
  getTranscripts: async (callId) => {
    const response = await api.get(`/api/calls/${callId}/transcripts`)
    return response.data
  },
}

export default api
