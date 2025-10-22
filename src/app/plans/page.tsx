import type { Metadata } from 'next';
import PlansClientPage from '@/components/plans/PlansClientPage';
import Navbar from '@/components/LandingPage/Navbar';

export const metadata: Metadata = {
  title: 'Our Plans - RentFlow360',
  description: 'Explore flexible real estate plans tailored to your needs',
  keywords: 'real estate management software, property investment sotware, housing plans, real estate management, Kips Reality plans',
};

export default function PlansPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className=''>
        <PlansClientPage />
      </div>
    </div>
  );
}
