'use client'

interface HeroSectionPreviewProps {
  hero: any
}

export default function HeroSectionPreview({ hero }: HeroSectionPreviewProps) {
  if (!hero) return <div>No hero section to preview</div>

  return (
    <div
      className="relative flex flex-col items-center justify-center text-center p-8 rounded-xl min-h-[300px] bg-cover bg-center"
      style={{ background: hero.gradient || 'linear-gradient(to right, #6EE7B7, #3B82F6)' }}
    >
      {hero.iconUrl && (
        <img src={hero.iconUrl} alt="Icon" className="w-16 h-16 mb-4" />
      )}
      {hero.title && <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">{hero.title}</h1>}
      {hero.subtitle && <p className="text-lg sm:text-xl text-white/80 mb-4">{hero.subtitle}</p>}
      {hero.description && <p className="text-base sm:text-lg text-white/70 mb-6">{hero.description}</p>}

      {hero.buttonText && hero.buttonUrl && (
        <a
          href={hero.buttonUrl}
          className="px-6 py-3 bg-white text-blue-500 font-semibold rounded-lg hover:bg-gray-100 transition"
        >
          {hero.buttonText}
        </a>
      )}

      {hero.searchBar && (
        <input
          type="text"
          placeholder="Search..."
          className="mt-4 w-full max-w-md p-2 rounded border border-white/50 text-black"
        />
      )}

      {hero.imageUrl && (
        <img src={hero.imageUrl} alt="Hero" className="mt-6 w-full max-w-lg rounded-lg shadow-lg" />
      )}
    </div>
  )
}
