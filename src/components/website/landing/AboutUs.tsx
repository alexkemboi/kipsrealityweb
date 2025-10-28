import Image from "next/image";
import { FlipWords } from "../../ui/flip-words";
import aboutBg from "@/assets/hero-cityscape.jpg";
import { AboutUs as AboutUsType } from "@/app/data/AboutUsData";

interface AboutProps {
  aboutData: AboutUsType[];
}

export default function About({ aboutData }: AboutProps) {
  const words = ["platform", "experience", "solution"];

  const aboutUs = aboutData.find((s) => s.id === 1);
  const ourStory = aboutData.find((s) => s.id === 2);
  const ourVision = aboutData.find((s) => s.id === 3);

  return (
    <section
      id="about"
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src={aboutBg}
          alt="Cityscape Background"
          className="w-full h-full object-cover opacity-15"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
      </div>

      <div className="relative z-20 container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-3xl lg:text-5xl font-bold text-[#0089bf] mb-4">
            <span className="text-[#151b1f]">One</span>{" "}
            <FlipWords words={words} />
          </h2>
          <p className="text-lg lg:text-2xl text-[#151b1f]/90 leading-relaxed">
            Simplifying property management with a seamless, tech-driven platform
            that connects landlords and tenants effortlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {aboutUs && (
            <div className="bg-[#1d3d67] backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl transition-transform hover:scale-[1.02]">
              <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                About <span className="text-gradient-primary animate-gradient">Us</span>
              </h3>
              <p className="text-white/80 text-lg leading-relaxed">
                {aboutUs.description}
              </p>
            </div>
          )}

          {ourStory && (
            <div className="bg-[#1d3d67] backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl transition-transform hover:scale-[1.02]">
              <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Our <span className="text-gradient-primary animate-gradient">Story</span>
              </h3>
              <p className="text-white/80 text-lg leading-relaxed">
                {ourStory.description}
              </p>
            </div>
          )}

          {ourVision && (
            <div className="bg-[#1d3d67] backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl transition-transform hover:scale-[1.02]">
              <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Our <span className="text-gradient-primary animate-gradient">Vision</span>
              </h3>
              <p className="text-white/80 text-lg leading-relaxed">
                {ourVision.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
