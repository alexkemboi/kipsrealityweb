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

    if (!email || !token || !leaseId) {
      setInviteValid(false)
      setCheckingLease(false)
      return
    }

    setFormData(prev => ({ ...prev, email, token, leaseId }))

    async function checkLease() {
      try {
        const res = await fetch(`/api/lease/${leaseId}?token=${token}`)
        const data = await res.json()

        if (!res.ok) {
          setInviteValid(false)
          setCheckingLease(false)
          return
        }

        if (data.tenantSignedAt) {
          setLeaseSigned(true)
          setCheckingLease(false)
        } else {
          // FIX: include email in redirect
          router.push(
            `/invite/tenant/lease/${leaseId}/sign?token=${token}&email=${email}`
          )
        }
      } catch (error) {
        setInviteValid(false)
        setCheckingLease(false)
      }
    }

    checkLease()
  }, [searchParams, router])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!leaseSigned) {
      toast.info("Please sign your lease before creating an account")
      router.push(
        `/invite/tenant/lease/${formData.leaseId}/sign?token=${formData.token}&email=${formData.email}`
      )
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

      toast.success('Account created successfully!')
      router.push('/login')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!inviteValid) {
    return <div className="flex justify-center items-center min-h-screen">Invalid Invite</div>
  }

  if (checkingLease) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card sx={{ p: 4, maxWidth: 420, width: '100%' }}>
        <Typography variant="h5">Create Your Account</Typography>

        <form onSubmit={handleSubmit}>
          <TextField label="Email" value={formData.email} disabled fullWidth margin="normal" />
          <TextField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Phone" name="phone" value={formData.phone} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Password" name="password" type="password" required value={formData.password} onChange={handleChange} fullWidth margin="normal" />

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
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
