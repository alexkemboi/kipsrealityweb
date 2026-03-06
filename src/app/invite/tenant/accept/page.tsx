'use client'

import { Suspense, useEffect, useState, FormEvent, ChangeEvent } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@mui/material'
import Card from '@mui/material/Card'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
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

interface LeaseStatusResponse {
  tenantSignedAt?: string | null
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message
  }

  return 'Something went wrong.'
}

async function getResponseErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data: unknown = await res.json()
    if (data && typeof data === 'object' && 'error' in data) {
      const maybeError = (data as { error?: unknown }).error
      if (typeof maybeError === 'string' && maybeError.trim()) {
        return maybeError
      }
    }
  } catch {
    // Keep fallback when response isn't JSON.
  }

  return res.statusText || fallback
}

function persistInviteToken(token: string) {
  window.sessionStorage.setItem('tenantInviteToken', token)
}

function AcceptInviteForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email')
  const token = searchParams.get('token')
  const leaseId = searchParams.get('leaseId')

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
    if (!email || !token || !leaseId) {
      setInviteValid(false)
      setCheckingLease(false)
      return
    }

    let cancelled = false
    const controller = new AbortController()

    setFormData(prev => ({
      ...prev,
      email,
      token,
      leaseId
    }))

    // Check if tenant signed lease
    async function checkLease() {
      try {
        // Include token in Authorization header to avoid leaking it in URL/query logs.
        const res = await fetch(`/api/lease/${leaseId}`, {
          signal: controller.signal,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!res.ok) {
          const errorMessage = await getResponseErrorMessage(res, 'Lease fetch error')
          console.error('Lease fetch error:', errorMessage)
          if (cancelled) return
          setInviteValid(false)
          setCheckingLease(false)
          return
        }

        let data: LeaseStatusResponse
        try {
          const parsed: unknown = await res.json()
          if (!parsed || typeof parsed !== 'object') {
            throw new Error('Invalid lease response format.')
          }
          data = parsed as LeaseStatusResponse
        } catch (parseErr) {
          console.error('Failed to parse lease response JSON:', parseErr)
          if (cancelled) return
          setInviteValid(false)
          setCheckingLease(false)
          return
        }

        if (cancelled) return

        if (data && data.tenantSignedAt) {
          setLeaseSigned(true)
          setCheckingLease(false)
        } else {
          persistInviteToken(token)
          // Replace keeps history cleaner and avoids an extra back-navigation hop.
          router.replace(`/invite/tenant/lease/${leaseId}/sign`)
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }

        console.error("Lease fetch failed:", err)
        if (cancelled) return
        setInviteValid(false)
        setCheckingLease(false)
      }
    }

    checkLease()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [email, token, leaseId, router])

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Handle account creation AFTER signing lease
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (loading) return

    if (!formData.leaseId || !formData.token || !formData.email) {
      toast.error('Invite details are incomplete. Please reopen your invite link.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/auth/invites/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      let data: unknown = null
      try {
        data = await res.json()
      } catch (parseError) {
        if (!res.ok) {
          throw new Error(`Failed to create account. Server returned status ${res.status}.`)
        }
        throw parseError
      }

      if (!res.ok) {
        const apiMessage =
          data && typeof data === 'object' && 'error' in data
            ? (data as { error?: unknown }).error
            : undefined

        throw new Error(typeof apiMessage === 'string' ? apiMessage : 'Failed to create account.')
      }

      toast.success('Account created successfully!')
      router.replace('/dashboard')
    } catch (error: unknown) {
      console.error("Account creation error:", error)
      const message = getErrorMessage(error)
      toast.error(message)
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
            onClick={() => router.back()}
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
            onClick={() => {
              if (formData.token) {
                persistInviteToken(formData.token)
              }
              router.replace(`/invite/tenant/lease/${formData.leaseId}/sign`)
            }}
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