import type { Metadata } from 'next';
import Navbar from '@/components/website/Navbar';
import { JobsClientPage } from '@/components/Career/JobClient';
import { jobPositions } from '@/app/data/jobData';


export const metadata: Metadata = {
  title: 'Job Listings - Kips Reality',
  description:
    'Explore the latest career opportunities at Kips Reality and find your next role today.',
  keywords: 'jobs, careers, hiring, employment, Kips Reality',
};

export const dynamic = "force-dynamic";

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="w-full bg-[#18181a] text-white py-32 flex flex-col items-center justify-center text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Join <span className="text-gradient-primary">RentFlow360</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Explore exciting career opportunities and grow with a team that’s
            redefining real estate excellence.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        <JobsClientPage initialJobs={jobPositions} />
      </div>
    </div>
  );
}
