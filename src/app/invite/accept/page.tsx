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
  leaseId?: string
}

function AcceptInviteForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [inviteValid, setInviteValid] = useState(true)
  const [leaseSigned, setLeaseSigned] = useState(false)
  const [checkingLease, setCheckingLease] = useState(true)

  const [formData, setFormData] = useState<FormData>({
    email: '',
    token: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    leaseId: ''
  })

  useEffect(() => {
    const email = searchParams.get('email')
    const token = searchParams.get('token')
    const leaseId = searchParams.get('leaseId')

    console.log("Accept page URL params:", { email, token, leaseId }) // Debug

    if (!email || !token || !leaseId) {
      console.error("Missing required params:", { email: !!email, token: !!token, leaseId: !!leaseId })
      setInviteValid(false)
      setCheckingLease(false)
      return
    }

    setFormData(prev => ({
      ...prev,
      email,
      token,
      leaseId
    }))

    // Check if tenant signed lease
    async function checkLease() {
      try {
        // IMPORTANT: Include token in request
        const res = await fetch(`/api/lease/${leaseId}?token=${token}`)
        const data = await res.json()

        console.log("Lease check response:", data) // Debug

        if (!res.ok) {
          console.error("Lease fetch error:", data.error)
          setInviteValid(false)
          setCheckingLease(false)
          return
        }

        if (data.tenantSignedAt) {
          console.log("Lease is signed, showing form")
          setLeaseSigned(true)
          setCheckingLease(false)
        } else {
          console.log("Lease not signed, redirecting to sign page")
          // Redirect to lease sign page with token
          router.push(`/invite/lease/${leaseId}/sign?token=${token}`)
        }
      } catch (err) {
        console.error("Lease fetch failed:", err)
        setInviteValid(false)
        setCheckingLease(false)
      }
    }

    checkLease()
  }, [searchParams, router])

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Handle account creation AFTER signing lease
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!leaseSigned) {
      toast.info('Please sign your lease before creating an account.')
      router.push(`/invite/lease/${formData.leaseId}/sign?token=${formData.token}`)
      return
    }

    setLoading(true)

    try {
      console.log("Creating account with:", formData) // Debug

      const res = await fetch(`/api/auth/invites/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      toast.success('Account created successfully! Redirecting to login...')
      setTimeout(() => router.push('/login'), 1500)
    } catch (error: any) {
      console.error("Account creation error:", error)
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

  // If still checking lease status
  if (checkingLease) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Checking lease status...
          </Typography>
        </div>
      </div>
    )
  }

  // If lease not signed yet (shouldn't reach here due to redirect)
  if (!leaseSigned) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card sx={{ p: 4, maxWidth: 420, width: '100%', textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Lease Not Signed
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You need to sign your lease before creating an account.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => router.push(`/invite/lease/${formData.leaseId}/sign?token=${formData.token}`)}
          >
            Sign Lease Now
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card sx={{ p: 4, maxWidth: 420, width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          Create Your Account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Your lease has been signed. Complete your account setup below.
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