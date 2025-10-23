'use client';

import { JobCard } from './JobCard';
import { Jobs } from '@/app/data/jobData';
import Footer from '../website/Footer';

interface JobsClientPageProps {
  initialJobs: Jobs[];
}

export function JobsClientPage({ initialJobs }: JobsClientPageProps) {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Latest Job Listings
      </h1>

      {initialJobs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialJobs.map((job) => (
            <JobCard key={job.id} post={job} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground">
            No job listings available at the moment.
          </p>
        </div>
      )}

    </main>
  );
}
