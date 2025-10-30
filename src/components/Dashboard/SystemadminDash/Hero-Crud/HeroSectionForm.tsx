'use client'

import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'

interface HeroSectionFormProps {
  hero?: any
  onSave: (updated: any) => void
}

export default function HeroSectionForm({ hero, onSave }: HeroSectionFormProps) {
  const [formData, setFormData] = useState({
    page: '',
    title: '',
    subtitle: '',
    description: '',
    buttonText: '',
    buttonUrl: '',
    imageUrl: '',
    iconUrl: '',
    searchBar: false,
    gradient: 'linear-gradient(to right, #6EE7B7, #3B82F6)',
  })

  // Update form when hero changes
  useEffect(() => {
    if (hero) {
      setFormData({
        page: hero.page || '',
        title: hero.title || '',
        subtitle: hero.subtitle || '',
        description: hero.description || '',
        buttonText: hero.buttonText || '',
        buttonUrl: hero.buttonUrl || '',
        imageUrl: hero.imageUrl || '',
        iconUrl: hero.iconUrl || '',
        searchBar: hero.searchBar || false,
        gradient: hero.gradient || 'linear-gradient(to right, #6EE7B7, #3B82F6)',
      })
    } else {
      // Reset form for new hero
      setFormData({
        page: '',
        title: '',
        subtitle: '',
        description: '',
        buttonText: '',
        buttonUrl: '',
        imageUrl: '',
        iconUrl: '',
        searchBar: false,
        gradient: 'linear-gradient(to right, #6EE7B7, #3B82F6)',
      })
    }
  }, [hero])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement
    const { name, value, type, checked } = target

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSave = async () => {
    try {
      if (!formData.page) return alert('Please select a page')
      const method = hero?.id ? 'PUT' : 'POST'
      const url = hero?.id ? `/api/hero/${hero.id}` : '/api/hero'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Failed to save')
      const data = await res.json()
      onSave(data)
      alert('Hero section saved successfully!')
    } catch (error) {
      console.error(error)
      alert('Failed to save hero section')
    }
  }

  // Preset gradients
  const presetGradients = [
    'linear-gradient(to right, #6EE7B7, #3B82F6)',
    'linear-gradient(to right, #F59E0B, #EF4444)',
    'linear-gradient(to right, #8B5CF6, #EC4899)',
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(to right, #1E3A8A, #3B82F6)',
    'linear-gradient(to right, #065F46, #10B981)',
  ]

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Form Section */}
      <div className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {hero ? 'Edit Hero Section' : 'Create New Hero Section'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Configure your hero section content and appearance
          </p>
        </div>

        {/* Page Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Page <span className="text-red-500">*</span>
          </label>
          <select
            name="page"
            value={formData.page}
            onChange={handleChange}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Page</option>
            <option value="home">Home</option>
            <option value="blog">Blog</option>
            <option value="services">Services</option>
            <option value="contact">Contact</option>
          </select>
        </div>

        {/* Content Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter hero title"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Subtitle</label>
            <textarea
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              placeholder="Enter subtitle"
              rows={2}
              className="w-full p-2.5 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
              rows={3}
              className="w-full p-2.5 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Button Settings */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Button Text</label>
            <input
              type="text"
              name="buttonText"
              value={formData.buttonText}
              onChange={handleChange}
              placeholder="Get Started"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Button URL</label>
            <input
              type="text"
              name="buttonUrl"
              value={formData.buttonUrl}
              onChange={handleChange}
              placeholder="/get-started"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Media URLs */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Icon URL</label>
            <input
              type="text"
              name="iconUrl"
              value={formData.iconUrl}
              onChange={handleChange}
              placeholder="https://example.com/icon.png"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Image URL</label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/hero.jpg"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Gradient Picker */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Background Gradient</label>
          <input
            type="text"
            name="gradient"
            value={formData.gradient}
            onChange={handleChange}
            placeholder="linear-gradient(...)"
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
          />
          <div className="grid grid-cols-3 gap-2">
            {presetGradients.map((grad, idx) => (
              <button
                key={idx}
                onClick={() => setFormData(prev => ({ ...prev, gradient: grad }))}
                className="h-12 rounded-lg border-2 border-gray-300 hover:border-blue-500 transition"
                style={{ background: grad }}
              />
            ))}
          </div>
        </div>

        {/* Search Bar Toggle */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            name="searchBar"
            id="searchBar"
            checked={formData.searchBar}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="searchBar" className="text-sm font-medium text-gray-700 cursor-pointer">
            Show Search Bar
          </label>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          {hero ? 'Update Hero Section' : 'Create Hero Section'}
        </button>
      </div>

      {/* Live Preview Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Live Preview</h3>
          <p className="text-sm text-gray-500 mt-1">See how your hero section will look</p>
        </div>
        
        <div className="border rounded-lg overflow-hidden shadow-lg">
          <div
            className="relative p-8 md:p-12 flex flex-col items-center justify-center gap-4 text-white min-h-[400px]"
            style={{ background: formData.gradient }}
          >
            {formData.iconUrl && (
              <img src={formData.iconUrl} alt="icon" className="w-16 h-16 object-contain" />
            )}
            
            <h1 className="text-3xl md:text-5xl font-black text-center">
              {formData.title || 'Your Title Here'}
            </h1>
            
            {formData.subtitle && (
              <p className="text-center text-lg md:text-xl opacity-90 max-w-2xl">
                {formData.subtitle}
              </p>
            )}
            
            {formData.description && (
              <p className="text-center text-sm md:text-base opacity-80 max-w-xl">
                {formData.description}
              </p>
            )}
            
            {formData.searchBar && (
              <input
                type="text"
                placeholder="Search..."
                className="mt-2 p-3 w-full max-w-md rounded-lg border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:border-white/50"
              />
            )}
            
            {formData.buttonText && (
              <a
                href={formData.buttonUrl || '#'}
                className="mt-4 px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg flex items-center gap-2 hover:scale-105 transition shadow-lg"
              >
                {formData.buttonText}
                <ChevronRight size={20} />
              </a>
            )}
            
            {formData.imageUrl && (
              <img
                src={formData.imageUrl}
                alt="hero"
                className="mt-6 rounded-lg max-h-64 object-cover w-full max-w-2xl shadow-xl"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}