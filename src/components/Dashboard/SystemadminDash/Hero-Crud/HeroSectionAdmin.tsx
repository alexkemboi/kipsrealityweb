'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit, Layers, Eye, ArrowLeft, RefreshCw, Image, Layout } from 'lucide-react'

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

import HeroSectionForm from './HeroSectionForm'

export default function HeroSectionAdmin() {
  const [heroSections, setHeroSections] = useState<HeroSection[]>([])
  const [selectedHero, setSelectedHero] = useState<HeroSection | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showForm, setShowForm] = useState(false)

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

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchHeroSections()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchHeroSections()
  }, [])

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

  const handleSave = () => {
    fetchHeroSections()
    setShowForm(false)
    setSelectedHero(null)
  }

  const handleEdit = (hero: HeroSection) => {
    setSelectedHero(hero)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCreateNew = () => {
    setSelectedHero(null)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Calculate statistics
  const stats = {
    total: heroSections.length,
    withImages: heroSections.filter(h => h.imageUrl || h.iconUrl).length,
    withButtons: heroSections.filter(h => h.buttonText).length,
    pages: [...new Set(heroSections.map(h => h.page))].length,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#0b1f3a] to-[#0a1628]">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#30D5C8]/20 border-t-[#30D5C8] mx-auto"></div>
            <Layers className="w-8 h-8 text-[#30D5C8] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-white mt-6 text-lg font-medium">Loading hero sections...</p>
          <p className="text-gray-400 mt-2 text-sm">Please wait</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0b1f3a] to-[#0a1628] text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#30D5C8]/10 to-transparent rounded-2xl blur-xl"></div>
          <div className="relative bg-[#0b1f3a]/80 backdrop-blur-sm rounded-2xl p-8 border border-[#30D5C8]/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#30D5C8]/10 rounded-xl">
                  <Layers className="w-8 h-8 text-[#30D5C8]" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    Hero Section Manager
                  </h1>
                  <p className="text-gray-400">
                    Create and manage hero sections for your pages
                  </p>
                </div>
              </div>
              
              {!showForm && (
                <div className="flex gap-3">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-[#15386a] hover:bg-[#1a4575] text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-[#30D5C8]/20"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                  <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#30D5C8] to-[#25b9ad] hover:from-[#25b9ad] hover:to-[#1fa89c] text-[#0b1f3a] rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-[#30D5C8]/20 hover:shadow-xl hover:shadow-[#30D5C8]/30 hover:scale-105"
                  >
                    <Plus className="w-5 h-5" />
                    Create New
                  </button>
                </div>
              )}
            </div>

            {/* Statistics Cards */}
            {!showForm && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[#15386a]/50 backdrop-blur-sm rounded-lg p-4 border border-[#30D5C8]/10 hover:border-[#30D5C8]/30 transition-all">
                  <div className="text-2xl font-bold text-[#30D5C8] mb-1">{stats.total}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Total Sections</div>
                </div>
                
                <div className="bg-[#15386a]/50 backdrop-blur-sm rounded-lg p-4 border border-[#30D5C8]/10 hover:border-[#30D5C8]/30 transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <Layout className="w-4 h-4 text-blue-400" />
                    <div className="text-2xl font-bold text-blue-400">{stats.pages}</div>
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Pages</div>
                </div>
                
                <div className="bg-[#15386a]/50 backdrop-blur-sm rounded-lg p-4 border border-[#30D5C8]/10 hover:border-[#30D5C8]/30 transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <Image className="w-4 h-4 text-purple-400" />
                    <div className="text-2xl font-bold text-purple-400">{stats.withImages}</div>
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">With Media</div>
                </div>
                
                <div className="bg-[#15386a]/50 backdrop-blur-sm rounded-lg p-4 border border-[#30D5C8]/10 hover:border-[#30D5C8]/30 transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-green-400" />
                    <div className="text-2xl font-bold text-green-400">{stats.withButtons}</div>
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">With CTAs</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {!showForm ? (
          <>
            {/* Hero Sections Grid */}
            {heroSections.length === 0 ? (
              <div className="bg-[#0b1f3a]/80 backdrop-blur-sm rounded-2xl border border-[#30D5C8]/20 p-12 text-center shadow-xl">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-[#30D5C8]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Layers className="w-10 h-10 text-[#30D5C8]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">No Hero Sections Yet</h3>
                  <p className="text-gray-400 mb-8 text-lg">
                    Get started by creating your first hero section
                  </p>
                  <button
                    onClick={handleCreateNew}
                    className="px-8 py-3 bg-gradient-to-r from-[#30D5C8] to-[#25b9ad] text-[#0b1f3a] font-semibold rounded-lg hover:from-[#25b9ad] hover:to-[#1fa89c] transition-all shadow-lg shadow-[#30D5C8]/20 hover:shadow-xl hover:shadow-[#30D5C8]/30 hover:scale-105"
                  >
                    <Plus className="w-5 h-5 inline mr-2" />
                    Create Hero Section
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {heroSections.map(hero => (
                  <div
                    key={hero.id}
                    className="bg-[#0b1f3a]/80 backdrop-blur-sm rounded-2xl border border-[#30D5C8]/20 overflow-hidden hover:border-[#30D5C8]/40 hover:shadow-2xl hover:shadow-[#30D5C8]/10 transition-all duration-300 group"
                  >
                    {/* Preview */}
                    <div
                      className="h-48 flex items-center justify-center p-6 relative overflow-hidden"
                      style={{ 
                        background: hero.gradient || 'linear-gradient(135deg, #30D5C8 0%, #1a4575 100%)'
                      }}
                    >
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all"></div>
                      <div className="text-center text-white relative z-10">
                        {hero.iconUrl && (
                          <div className="w-14 h-14 mx-auto mb-3 bg-white/10 backdrop-blur-sm rounded-xl p-2 group-hover:scale-110 transition-transform">
                            <img src={hero.iconUrl} alt="icon" className="w-full h-full object-contain" />
                          </div>
                        )}
                        <h3 className="text-xl font-bold truncate drop-shadow-lg">
                          {hero.title || 'Untitled Section'}
                        </h3>
                        {hero.subtitle && (
                          <p className="text-sm opacity-90 mt-2 line-clamp-2 drop-shadow-md">
                            {hero.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Info & Actions */}
                    <div className="p-5 bg-[#15386a]/30">
                      <div className="mb-4">
                        <p className="font-semibold text-white text-lg mb-1">
                          {hero.title || 'Untitled Hero'}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-[#30D5C8]/20 text-[#30D5C8] text-xs font-medium rounded capitalize">
                            {hero.page} Page
                          </span>
                          {hero.searchBar && (
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">
                              Search Bar
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(hero)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#30D5C8]/10 text-[#30D5C8] font-medium rounded-lg hover:bg-[#30D5C8]/20 border border-[#30D5C8]/20 hover:border-[#30D5C8]/40 transition-all"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={(e) => handleDelete(hero.id, e)}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 font-medium rounded-lg hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 transition-all"
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
            {/* Back Button & Form */}
            <div className="space-y-6">
              <button
                onClick={() => {
                  setShowForm(false)
                  setSelectedHero(null)
                }}
                className="flex items-center gap-2 text-[#30D5C8] hover:text-[#25b9ad] font-medium transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Back to List
              </button>

              {/* Form Container */}
              <div className="bg-[#0b1f3a]/80 backdrop-blur-sm rounded-2xl border border-[#30D5C8]/20 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#30D5C8]/10 to-transparent p-6 border-b border-[#30D5C8]/20">
                  <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                    {selectedHero ? (
                      <>
                        <Edit className="w-6 h-6 text-[#30D5C8]" />
                        Edit Hero Section
                      </>
                    ) : (
                      <>
                        <Plus className="w-6 h-6 text-[#30D5C8]" />
                        Create New Hero Section
                      </>
                    )}
                  </h2>
                  <p className="text-gray-400 mt-1">
                    {selectedHero ? 'Update the hero section details below' : 'Fill in the details to create a new hero section'}
                  </p>
                </div>
                <div className="p-6">
                  <HeroSectionForm hero={selectedHero} onSave={handleSave} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}