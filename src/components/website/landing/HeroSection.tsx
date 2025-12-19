import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, PlayCircle, ShieldCheck, Zap } from "lucide-react";
import ClientAnimations from "./ClientAnimation";

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
}

async function getHeroData(): Promise<HeroData | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/hero?page=home`, {
      cache: "no-store",
      next: { revalidate: 0 }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error("Error fetching hero:", error);
    return null;
  }
}

export default async function HeroSection() {
  const hero = await getHeroData();

  const data = hero || {
    title: "Smart Property Management Made Easy",
    subtitle: "Streamline Rentals. Automate Workflows.",
    description: "RentFlow360 helps landlords and property managers track tenants, automate payments, manage maintenance requests, and grow their rental business effortlessly.",
    buttonText: "Get Started",
    buttonUrl: "/signup",
    secondaryButtonText: "View Demo",
    secondaryButtonUrl: "/demo"
  };

  return (
    <section className="relative bg-white pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none bg-white">
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left max-w-2xl lg:max-w-none">

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-blue-700 mb-6 leading-[1.1] lg:leading-[1.1]">
              {data.title}
            </h1>

            <p className="text-lg sm:text-xl text-neutral-500 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
              {data.subtitle && <span className="block font-semibold text-neutral-700 mb-2">{data.subtitle}</span>}
              {data.description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8">
              {data.buttonText && (
                <a href={data.buttonUrl}>
                  <Button
                    size="lg"
                    className="h-14 px-8 text-[16px] bg-blue-700 hover:bg-blue-800 text-white shadow-lg shadow-blue-500/15 rounded-full transition-all duration-300 w-full sm:w-auto font-bold"
                  >
                    {data.buttonText}
                  </Button>
                </a>
              )}

              <a href="/demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-[16px] border-blue-700 text-blue-700 hover:bg-blue-50 rounded-full transition-all duration-300 w-full sm:w-auto font-bold"
                >
                  Get a Demo
                </Button>
              </a>

              {data.secondaryButtonText && data.secondaryButtonText !== "View Demo" && (
                <a href={data.secondaryButtonUrl}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-[16px] border-neutral-200 text-neutral-600 hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50/50 bg-white rounded-full transition-all hover:-translate-y-1 w-full sm:w-auto font-semibold gap-2.5"
                  >
                    <PlayCircle className="w-5 h-5 text-blue-700" />
                    {data.secondaryButtonText}
                  </Button>
                </a>
              )}
            </div>

            {/* Trust Text */}
            <div className="flex items-center justify-center lg:justify-start gap-8 text-[#1d3d67] text-[12px] font-bold tracking-wider opacity-80 mt-2">
              <div className="flex items-center gap-1.5 transition-transform hover:scale-110">
                <ShieldCheck className="w-4 h-4 text-[#1d3d67]" />
                <span>TRUSTED</span>
              </div>
              <div className="flex items-center gap-1.5 transition-transform hover:scale-110">
                <ShieldCheck className="w-4 h-4 text-[#1d3d67]" />
                <span>SECURE</span>
              </div>
              <div className="flex items-center gap-1.5 transition-transform hover:scale-110">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>FAST</span>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 w-full max-w-xl lg:max-w-none relative flex flex-col items-center">
            {/* Badge Component */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-blue-100/50 text-blue-700 text-[12px] font-bold tracking-wider shadow-xl shadow-blue-500/10 mb-8 animate-fade-in-up">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-700"></span>
              </span>
              WELCOME TO THE FUTURE
            </div>

            <div className="relative w-full aspect-[4/3] max-w-[600px] animate-fade-in-right overflow-hidden rounded-[40px] shadow-2xl">
              <img
                src="/rentflow image.png"
                alt="RentFlow360 Future"
                className="w-full h-full object-cover animate-float-slow opacity-95 block"
              />
            </div>
          </div>
        </div>
      </div>

      <ClientAnimations />
    </section>
  );
}