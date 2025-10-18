'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ServicesPage() {
  // Example dynamic content that could cause hydration errors
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    // This code only runs in the browser
    const now = new Date()
    setCurrentTime(now.toLocaleTimeString())
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Our Services</h1>
      <p>Welcome to the Services page! Current time: {currentTime}</p>

      <nav style={{ marginTop: '1rem' }}>
        <Link href="/">Home</Link> |{' '}
        <Link href="/about">About</Link> |{' '}
        <Link href="/services">Services</Link>
      </nav>
    </div>
  )
}
