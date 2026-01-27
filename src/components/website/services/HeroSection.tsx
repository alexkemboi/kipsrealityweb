import Link from "next/link";

interface HeroData {
  id: number | string;
  page: string;
  title: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  imageUrl?: string;
  gradient?: string;
}

import { getHeroSectionData } from "@/lib/server/website-data";

// Import fallback image
import fallbackHero from "@/assets/hero-cityscape.jpg";
import Image from "next/image";

export const HeroSection = async () => {
  const hero = await getHeroSectionData("services");

  // Define fallback logic for image
  const displayImage = hero?.imageUrl || fallbackHero;
  const isStaticImage = !hero?.imageUrl; // helps us know if we need to use Next/Image for static import

  if (!hero && !isStaticImage) {
    // ... keeping existing loading state is fine, but usually we just render with defaults
    return (
      <section className="min-h-[50vh] flex items-center justify-center bg-white text-slate-900">
        <p>Loading...</p>
      </section>
    );
  }

  return (
    <section
      className="relative w-full pt-28 pb-16 lg:pt-36 lg:pb-24 bg-white"
    >
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Left Column - Content */}
          <div className="relative z-10 order-2 lg:order-2 flex flex-col justify-center pt-4 lg:pt-8">

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold leading-[1.15] mb-4 text-[#1F2933] tracking-tight max-w-lg">
              {(hero?.title || "Comprehensive Services")}
            </h1>

            {/* Subtitle */}
            {hero?.subtitle && (
              <h2 className="text-base lg:text-lg font-medium mb-3 text-[#003b73]">
                {hero.subtitle}
              </h2>
            )}

            <p className="text-sm lg:text-base leading-relaxed text-[#4B5563] mb-6 max-w-md">
              Simplify daily operations, automate repetitive tasks, and gain full visibility across all your properties, everything you need in one intuitive dashboard.
            </p>
          </div>

          {/* Right Column - Image */}
          <div className="relative order-1 lg:order-1 h-full min-h-[400px] lg:min-h-[500px]">
            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-slate-100/50">
              {/* Use specific rendering based on source type */}
              {typeof displayImage === 'string' ? (
                <img
                  src={displayImage}
                  alt={hero?.title || "Services Hero"}
                  className="absolute inset-0 w-full h-full object-cover transform transition duration-700 hover:scale-105"
                />
              ) : (
                <Image
                  src={displayImage}
                  alt={hero?.title || "Services Hero"}
                  fill
                  className="object-cover transform transition duration-700 hover:scale-105"
                  placeholder="blur"
                />
              )}
            </div>

            {/* Decorative Element to blend image */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#003b73]/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#003b73]/10 rounded-full blur-3xl -z-10" />
          </div>

        </div>
      </div>
    </section>
  );
};