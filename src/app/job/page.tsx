import type { Metadata } from 'next';
import Navbar from '@/components/LandingPage/Navbar';
import { JobsClientPage } from '@/components/Career/JobClient';
import { jobPositions } from '@/app/data/jobData';

export const metadata: Metadata = {
  title: 'Job Listings - Kips Reality',
  description: 'Explore the latest career opportunities at Kips Reality and find your next role today.',
  keywords: 'jobs, careers, hiring, employment, Kips Reality',
};

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <JobsClientPage initialJobs={jobPositions} />
    </div>
  );
}
