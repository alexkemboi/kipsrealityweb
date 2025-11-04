import Navbar from "@/components/Dashboard/Navbar/Navbar";
import Footer from "@/components/website/Footer";
import PropertyCards from "@/components/PropertyManagement/ViewProperty";

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="w-full bg-[#18181a] text-white py-18 mb-8 flex flex-col items-center justify-center text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-2xl md:text-4xl text-gradient-primary font-bold mb-6 py-4">
            Your Properties
          </h1>
        </div>
      </section>

      <PropertyCards />

    </div>
  );
}
