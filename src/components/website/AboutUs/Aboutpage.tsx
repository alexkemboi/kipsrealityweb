import Image from "next/image";
import Link from "next/link";
import Navbar from '@/components/website/Navbar';
import { AboutUs as AboutUsType } from "@/app/data/AboutUsData";


interface AboutProps {
  aboutData: AboutUsType[];
}



export default function AboutUsPage({ aboutData }: AboutProps) {
const discover= aboutData.find((s) => s.id === 4);
  const journey = aboutData.find((s) => s.id === 5);
  const vision = aboutData.find((s) => s.id === 6);
  const driven = aboutData.find((s) => s.id === 7);



  return (
    <main className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <Navbar />
      {/* Hero Section */}
      <section className="relative flex items-center justify-center h-[70vh] overflow-hidden">
        <Image
          src={"https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=500"}
          alt="About Us Background"
          
           width={500}
  height={350}
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-[#1d3d67]/80 mix-blend-multiply"></div>
        <div className="relative z-10 text-center px-6">
          <h1 className="text-4xl lg:text-6xl font-bold text-[#00b7ff] mb-4 tracking-tight">
{discover?.section}          </h1>
          <p className="text-white/80 max-w-2xl mx-auto text-lg">
{discover?.description}           </p>
        </div>
      </section>

      {/* Our Journey */}
      <section className="container mx-auto px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl lg:text-5xl font-bold text-[#1d3d67]">
{journey?.section}           </h2>
          <p className="text-gray-700 leading-relaxed text-lg">
           {journey?.description}
          </p>
          
        </div>
        <div className="rounded-2xl overflow-hidden shadow-xl border border-white/10 bg-[#1d3d67]/10">
<Image
  src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=500"
  alt="Our Team Journey"
  width={500}
  height={350}
  className="object-cover w-full h-auto rounded-2xl shadow-lg"
/>

        </div>
      </section>

      {/* Mission & Vision */}
      <section className="relative bg-[#1d3d67] text-white py-24">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-5xl font-bold">
{vision?.section}            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
             {vision?.description}           

            </p>
            <div className="flex items-center space-x-4">
              <div className="h-2 w-12 bg-[#00b7ff] rounded-full"></div>
              <span className="text-sm tracking-widest uppercase text-white/70">
                Building tomorrow’s homes today
              </span>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl border border-white/10">
<Image
  src="https://images.unsplash.com/photo-1521316730702-829a8e30dfd0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=500"
  alt="Mission and Vision"
   width={500}
  height={350}
  className="object-cover w-full h-full"
/>
          </div>
        </div>
      </section>

      {/* Innovation Section */}
      <section className="container mx-auto px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="rounded-2xl overflow-hidden shadow-xl border border-[#1d3d67]/10">
          <Image src={"https://images.unsplash.com/photo-1493612276216-ee3925520721?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=464"}
           alt="Innovation at Work" 
            width={500}
  height={350}
           className="object-cover w-full h-full" />
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl lg:text-5xl font-bold text-[#1d3d67]">
            {driven?.section}            

          </h2>
          <p className="text-gray-700 leading-relaxed text-lg">
          {driven?.description}  
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-[#1d3d67] text-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Ready to Join Our Journey?
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-10 text-lg">
            Whether you’re a landlord, tenant, or partner, we’re here to transform your real estate experience.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-[#00b7ff] text-white font-semibold px-8 py-3 rounded-full hover:bg-[#0099dd] transition-all duration-300 shadow-lg"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </main>
  );
}
