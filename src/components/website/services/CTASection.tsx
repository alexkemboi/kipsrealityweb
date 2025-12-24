'use client'

import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'

interface CTA {
  id: number
  page: string
  title: string
  subtitle: string
  buttonText: string
  buttonUrl: string
  gradient?: string
}

export const CTASection = () => {
  const [cta, setCta] = useState<CTA | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCTA = async () => {
      try {
        const res = await fetch('/api/cta/1') // use correct ID
        if (!res.ok) throw new Error('Failed to fetch CTA')
        const data: CTA = await res.json()
        setCta(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCTA()
  }, [])

  if (loading) return <div className="py-16 text-center text-white">Loading...</div>
  if (!cta) return null

  const titleLines = (cta.title ?? '').split('\n')

  return (
    <div
      className="relative overflow-hidden py-12 sm:py-16"
      style={{ backgroundColor: '#f0f7ff' }} // Soft green background
    >
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 leading-tight text-[#1F2933]">
          {titleLines.map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </h2>

        <p className="text-lg sm:text-xl mb-5 text-[#4B5563] max-w-2xl mx-auto">
          {cta.subtitle ?? ''}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={cta.buttonUrl ?? '#'}
            className="inline-flex items-center justify-center px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            style={{
              background: '#003b73',
              color: '#ffffff',
              boxShadow: '0 4px 20px rgba(0, 59, 115, 0.3)'
            }}
          >
            <span>{cta.buttonText}</span>
            <ChevronRight size={20} className="ml-2" />
          </a>
        </div>
      </div>
    </div>
  )
}
