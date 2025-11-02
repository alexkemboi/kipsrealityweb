

'use client'

import { Suspense } from 'react'
import { useEffect, useState, FormEvent, ChangeEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button, TextField, Card, Typography, CircularProgress } from '@mui/material'
import { toast } from 'react-toastify'

interface FormData {
  email: string
  token: string
  password: string
  firstName: string
  lastName: string
  phone: string
}

function AcceptInviteForm() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [inviteValid, setInviteValid] = useState(true)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    token: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  })

  useEffect(() => {
    const email = searchParams.get('email')
    const token = searchParams.get('token')

    if (!email || !token) {
      setInviteValid(false)
    } else {
      setFormData(prev => ({ ...prev, email, token }))
    }
  }, [searchParams])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000'
      const res = await fetch(`${baseUrl}/api/auth/invites/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Invite acceptance failed')

      toast.success('Invite accepted! Please log in.')
      setTimeout(() => (window.location.href = '/login'), 1500)
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (!inviteValid) {
    return (
      <Typography variant="h6" color="error" sx={{ textAlign: 'center', mt: 8 }}>
        Invalid or missing invite link.
      </Typography>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card sx={{ p: 4, maxWidth: 420, width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          Accept Invite
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Complete your account setup to access your tenant dashboard.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField label="Email" name="email" value={formData.email} fullWidth margin="normal" InputProps={{ readOnly: true }} />
          <TextField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} fullWidth margin="normal" required />
          <TextField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Phone" name="phone" value={formData.phone} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} fullWidth margin="normal" required />
          <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth sx={{ mt: 2 }}>
            {loading ? <CircularProgress size={24} /> : 'Create Account'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    }>
      <AcceptInviteForm />
    </Suspense>
  )
}