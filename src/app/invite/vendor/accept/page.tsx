'use client'

import { Suspense, useEffect, useState, FormEvent, ChangeEvent } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
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

function VendorAcceptInviteForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
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

    console.log("Vendor Accept Invite URL params:", { email, token }) // Debug

    if (!email || !token) {
      console.error("Missing required params:", { email: !!email, token: !!token })
      setInviteValid(false)
      return
    }

    setFormData(prev => ({
      ...prev,
      email,
      token
    }))
  }, [searchParams])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log("Creating vendor account with:", formData) // Debug

      const res = await fetch(`/api/auth/invites/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast.success('Vendor account created successfully! Redirecting to login...')
      setTimeout(() => router.push('/login'), 1500)
    } catch (error: any) {
      console.error("Vendor account creation error:", error)
      toast.error(error.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (!inviteValid) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card sx={{ p: 4, maxWidth: 420, width: '100%', textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Invalid Invite Link
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The invite link is invalid or missing required information. Please check your email for the correct link.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card sx={{ p: 4, maxWidth: 420, width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          Create Your Vendor Account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Complete your vendor account setup below.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
            disabled
          />

          <TextField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            helperText="Choose a strong password for your account"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Create Account"}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default function VendorAcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    }>
      <VendorAcceptInviteForm />
    </Suspense>
  )
}
