import type { Metadata } from 'next';
import Navbar from '@/components/website/Navbar';
import AgentMenuCards from '@/components/website/marketplace/AgentMenuCards';

export const metadata: Metadata = {
  title: 'Agent Marketplace Dashboard - RentFlow 360',
  description:
    'Manage your Marketplace Listings.',
  keywords: 'marketplace, listings',
};

export const dynamic = "force-dynamic";

export default function AgentMenu() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="w-full bg-[#18181a] text-white py-32 flex flex-col items-center justify-center text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Marketplace <span className="text-gradient-primary">Management Dashboard</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Manage your marketplace listings efficiently from this centralized dashboard.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        <AgentMenuCards/>
      </div>
    </div>
  );
}
