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

  console.log("URL params:", { email, token, leaseId }) // Debug

  // Require at least email and token. leaseId is optional (used for tenant invites).
  if (!email || !token) {
    setInviteValid(false)
    return
  }

  setFormData(prev => ({
    ...prev,
    email,
    token,
    leaseId: leaseId || ''
  }))

  // If leaseId is present, we need to ensure tenant signed the lease first.
  // If leaseId is absent (e.g., vendor invite), skip lease check and show form.
  if (!leaseId) {
    setLeaseSigned(true)
    return
  }

  // ✅ Check if tenant signed lease
  async function checkLease() {
    try {
      const res = await fetch(`/api/lease/${leaseId}`)
      const data = await res.json()

      if (!res.ok) {
        console.error("Lease fetch error:", data.error)
        setInviteValid(false)
        return
      }

      if (data.tenantSignedAt) {
        setLeaseSigned(true)
      } else {
        // ✅ Redirect to lease sign page (absolute path)
        router.push(`/invite/lease/${leaseId}/sign?redirect=invite`)
      }
    } catch (err) {
      console.error("Lease fetch failed:", err)
      setInviteValid(false)
    }
  }

  checkLease()
}, [searchParams, router])



  // ✅ Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // ✅ Handle account creation AFTER signing lease
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!leaseSigned) {
      toast.info('Please sign your lease before creating an account.')
      router.push(`/lease/${formData.leaseId}/sign`)
      return
    }

    setLoading(true)

    try {
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

  // ✅ If lease not signed, do not show form
  if (!leaseSigned) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card sx={{ p: 4, maxWidth: 420, width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          Create Your Account
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField label="Email" name="email" value={formData.email} fullWidth margin="normal" InputProps={{ readOnly: true }} />

          <TextField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required fullWidth margin="normal" />
          <TextField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Phone" name="phone" value={formData.phone} onChange={handleChange} fullWidth margin="normal" />

          <TextField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required fullWidth margin="normal" />

          <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mt: 2 }}>
            {loading ? <CircularProgress size={24} /> : "Create Account"}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><CircularProgress /></div>}>
      <AcceptInviteForm />
    </Suspense>
  )
}
