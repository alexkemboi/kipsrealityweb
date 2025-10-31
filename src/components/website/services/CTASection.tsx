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
      className="relative overflow-hidden"
      style={{ background: cta.gradient || 'linear-gradient(to right, #6EE7B7, #3B82F6)' }}
    >
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-24 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight text-white">
          {titleLines.map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </h2>

        <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-10 px-4 text-white/70">
          {cta.subtitle ?? ''}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
          <a
            href={cta.buttonUrl ?? '#'}
            className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
            style={{
              background: '#3B82F6',
              color: '#fff',
              boxShadow: `0 10px 40px #3B82F640`,
            }}
          >
            <span>{cta.buttonText}</span> {/* <-- now it will show "start your free trial" */}
            <ChevronRight size={20} />
          </a>
        </div>
      </div>
    </div>
  )
}
