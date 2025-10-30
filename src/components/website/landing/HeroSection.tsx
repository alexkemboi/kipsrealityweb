"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Shield, Star } from "lucide-react";

interface HeroData {
  id: number;
  page: string;
  title: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  gradient?: string;
}

export default function HeroSection() {
  const [hero, setHero] = useState<HeroData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    const fetchHero = async () => {
      try {
        const res = await fetch("/api/hero?page=home", { cache: "no-store" });
        const data = await res.json();
        setHero(Array.isArray(data) ? data[0] : data);
      } catch (error) {
        console.error("Error fetching hero:", error);
      }
    };
    fetchHero();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!hero)
    return (
      <section className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.1),transparent_50%)]"></div>
        <div className="flex flex-col items-center gap-4 z-10">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-teal-500/30 rounded-full absolute animate-ping"></div>
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 animate-pulse font-medium">Crafting your experience...</p>
        </div>
      </section>
    );

  return (
    <section
      className="relative flex flex-col items-center justify-center text-center px-4 sm:px-6 py-20 sm:py-28 md:py-32 lg:py-36 text-white overflow-hidden min-h-[70vh] md:min-h-[75vh]"
      style={{
        background: hero.gradient || "linear-gradient(135deg, #0a0f1e 0%, #0f172a 25%, #1e293b 50%, #0f172a 75%, #0a0f1e 100%)",
      }}
    >
      {/* Interactive Mouse Follower Gradient */}
      <div 
        className="absolute inset-0 opacity-30 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(20,184,166,0.15), transparent 40%)`
        }}
      ></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Particles */}
        <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-teal-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-[60%] left-[15%] w-1 h-1 bg-blue-400 rounded-full animate-float opacity-40" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute top-[40%] right-[20%] w-1.5 h-1.5 bg-purple-400 rounded-full animate-float opacity-50" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
        <div className="absolute top-[80%] right-[10%] w-2 h-2 bg-teal-300 rounded-full animate-float opacity-60" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}></div>
        <div className="absolute top-[15%] right-[30%] w-1 h-1 bg-blue-300 rounded-full animate-float opacity-40" style={{ animationDelay: '1.5s', animationDuration: '4.5s' }}></div>
        
        {/* Large Gradient Orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-br from-teal-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-gradient-to-bl from-purple-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        
        {/* Animated Grid with Glow */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]"></div>
        
        {/* Radial Glow from Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-teal-500/5 via-transparent to-transparent rounded-full"></div>
      </div>

      {/* Hero Content */}
      <div className={`max-w-6xl mx-auto space-y-5 sm:space-y-6 md:space-y-8 z-10 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Premium Badge with Animation */}
        <div className={`inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-full text-sm font-medium shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 transition-all duration-300 hover:scale-105 cursor-default ${mounted ? 'animate-bounce-subtle' : ''}`}>
          <Sparkles className="w-4 h-4 text-teal-400 animate-spin-slow" />
          <span className="bg-gradient-to-r from-teal-200 via-white to-teal-200 bg-clip-text text-transparent font-semibold">Welcome to the future</span>
          <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
        </div>

        {hero.title && (
          <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.1] tracking-tight transition-all duration-1000 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="relative inline-block">
              <span className="absolute inset-0 bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 blur-2xl opacity-30 animate-pulse"></span>
              <span className="relative bg-gradient-to-r from-white via-teal-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
                {hero.title}
              </span>
            </span>
          </h1>
        )}

        {hero.subtitle && (
          <p className={`text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-teal-300 font-medium">{hero.subtitle.split(' ')[0]}</span>{' '}
            {hero.subtitle.split(' ').slice(1).join(' ')}
          </p>
        )}

        {hero.description && (
          <p className={`text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {hero.description}
          </p>
        )}

        <div className={`flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-5 mt-8 sm:mt-10 md:mt-12 transition-all duration-1000 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {hero.buttonText && hero.buttonUrl && (
            <a href={hero.buttonUrl} className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full blur-lg opacity-50 group-hover:opacity-100 transition duration-300 animate-pulse-slow"></div>
              <Button
                size="lg"
                className="relative bg-gradient-to-r from-teal-500 via-teal-400 to-teal-500 hover:from-teal-400 hover:via-teal-300 hover:to-teal-400 text-white px-8 sm:px-10 py-6 sm:py-7 rounded-full shadow-2xl shadow-teal-500/40 hover:shadow-teal-500/60 transition-all duration-300 hover:scale-110 text-base sm:text-lg font-bold border border-teal-300/50 w-full sm:w-auto"
              >
                <span className="flex items-center gap-2">
                  {hero.buttonText}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </Button>
            </a>
          )}

          {hero.secondaryButtonText && hero.secondaryButtonUrl && (
            <a href={hero.secondaryButtonUrl} className="group relative">
              <Button
                size="lg"
                variant="outline"
                className="relative text-white border-2 border-white/30 hover:border-teal-400/60 bg-white/5 hover:bg-white/10 backdrop-blur-md px-8 sm:px-10 py-6 sm:py-7 rounded-full transition-all duration-300 hover:scale-105 text-base sm:text-lg font-bold shadow-xl hover:shadow-2xl w-full sm:w-auto"
              >
                {hero.secondaryButtonText}
              </Button>
            </a>
          )}
        </div>

        {/* Enhanced Trust Indicators with Icons */}
        <div className={`flex flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-10 mt-12 sm:mt-16 md:mt-20 px-4 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center gap-3 group cursor-default">
            <div className="p-2 bg-gradient-to-br from-teal-500/20 to-teal-500/10 rounded-full border border-teal-500/30 group-hover:scale-110 transition-transform duration-300">
              <Star className="w-4 h-4 text-teal-400" />
            </div>
            <span className="text-gray-300 font-medium text-sm sm:text-base">Trusted by 10,000+</span>
          </div>
          <div className="flex items-center gap-3 group cursor-default">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-full border border-blue-500/30 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-gray-300 font-medium text-sm sm:text-base">Enterprise Security</span>
          </div>
          <div className="flex items-center gap-3 group cursor-default">
            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-full border border-purple-500/30 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-gray-300 font-medium text-sm sm:text-base">Lightning Fast</span>
          </div>
        </div>
      </div>

      {/* Premium Multi-Layer Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="w-full h-[120px] sm:h-[150px] md:h-[180px]"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffffff"  />
            </linearGradient>
            <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path
            fill="url(#waveGradient1)"
            d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,154.7C672,149,768,171,864,186.7C960,203,1056,213,1152,208C1248,203,1344,181,1392,170.7L1440,160V320H0Z"
            opacity="0.5"
          >
            <animate attributeName="d" dur="10s" repeatCount="indefinite"
              values="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,154.7C672,149,768,171,864,186.7C960,203,1056,213,1152,208C1248,203,1344,181,1392,170.7L1440,160V320H0Z;
                      M0,192L48,181.3C96,171,192,149,288,154.7C384,160,480,192,576,186.7C672,181,768,139,864,133.3C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128V320H0Z;
                      M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,154.7C672,149,768,171,864,186.7C960,203,1056,213,1152,208C1248,203,1344,181,1392,170.7L1440,160V320H0Z"
            />
          </path>
          <path
            fill="url(#waveGradient2)"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,170.7C1248,160,1344,160,1392,160L1440,160V320H0Z"
          >
            <animate attributeName="d" dur="8s" repeatCount="indefinite"
              values="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,170.7C1248,160,1344,160,1392,160L1440,160V320H0Z;
                      M0,256L48,245.3C96,235,192,213,288,213.3C384,213,480,235,576,245.3C672,256,768,256,864,245.3C960,235,1056,213,1152,202.7C1248,192,1344,192,1392,192L1440,192V320H0Z;
                      M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,170.7C1248,160,1344,160,1392,160L1440,160V320H0Z"
            />
          </path>
        </svg>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}