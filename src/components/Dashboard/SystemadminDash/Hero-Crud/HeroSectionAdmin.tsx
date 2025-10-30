'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit } from 'lucide-react'

interface HeroSection {
  id: number
  page: string
  title?: string
  subtitle?: string
  description?: string
  buttonText?: string
  buttonUrl?: string
  imageUrl?: string
  iconUrl?: string
  searchBar?: boolean
  gradient?: string
  layout?: string
}

// Import the form component (this would be your HeroSectionForm)
import HeroSectionForm from './HeroSectionForm'

export default function HeroSectionAdmin() {
  const [heroSections, setHeroSections] = useState<HeroSection[]>([])
  const [selectedHero, setSelectedHero] = useState<HeroSection | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Fetch all hero sections
  const fetchHeroSections = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/hero')
      const data = await res.json()
      setHeroSections(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHeroSections()
  }, [])

  // Delete a hero section
  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this hero section?')) return
    try {
      await fetch(`/api/hero/${id}`, { method: 'DELETE' })
      fetchHeroSections()
      if (selectedHero?.id === id) {
        setSelectedHero(null)
        setShowForm(false)
      }
    } catch (err) {
      console.error(err)
      alert('Failed to delete hero section')
    }
  }

  // Handle save callback
  const handleSave = () => {
    fetchHeroSections()
    setShowForm(false)
    setSelectedHero(null)
  }

  // Handle edit
  const handleEdit = (hero: HeroSection) => {
    setSelectedHero(hero)
    setShowForm(true)
  }

  // Handle create new
  const handleCreateNew = () => {
    setSelectedHero(null)
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hero sections...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hero Section Manager</h1>
          <p className="text-gray-600 mt-2">Create and manage hero sections for your pages</p>
        </div>

        {!showForm ? (
          <>
            {/* Create New Button */}
            <div className="mb-6">
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                <Plus size={20} />
                Create New Hero Section
              </button>
            </div>

            {/* Hero Sections Grid */}
            {heroSections.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Hero Sections Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Get started by creating your first hero section
                  </p>
                  <button
                    onClick={handleCreateNew}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                  >
                    Create Hero Section
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {heroSections.map(hero => (
                  <div
                    key={hero.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition group"
                  >
                    {/* Preview */}
                    <div
                      className="h-48 flex items-center justify-center p-6"
                      style={{ background: hero.gradient || 'linear-gradient(to right, #6EE7B7, #3B82F6)' }}
                    >
                      <div className="text-center text-white">
                        {hero.iconUrl && (
                          <img src={hero.iconUrl} alt="icon" className="w-12 h-12 mx-auto mb-2 object-contain" />
                        )}
                        <h3 className="text-xl font-bold truncate">
                          {hero.title || 'Untitled'}
                        </h3>
                        {hero.subtitle && (
                          <p className="text-sm opacity-90 mt-1 line-clamp-2">
                            {hero.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Info & Actions */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {hero.title || 'Untitled Hero'}
                          </p>
                          <p className="text-sm text-gray-500 capitalize">{hero.page} Page</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(hero)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={(e) => handleDelete(hero.id, e)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={() => {
                  setShowForm(false)
                  setSelectedHero(null)
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                ← Back to List
              </button>
            </div>

            {/* Form */}
            <HeroSectionForm hero={selectedHero} onSave={handleSave} />
          </>
        )}
      </div>
    </div>
  )
}