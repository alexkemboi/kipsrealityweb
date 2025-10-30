import { fetchCategories } from "@/lib/categories";
import Navbar from "@/components/Dashboard/Navbar/Navbar";
import Footer from "@/components/website/Footer";
import CategoryCards from "@/components/website/marketplace/CategoryMenuCards";

export default async function CategoriesPage() {
  const categories = await fetchCategories();

  return (
     <div className="min-h-screen bg-background">
    <Navbar />

    <section className="w-full bg-[#18181a] text-white py-18 mb-8 flex flex-col items-center justify-center text-center">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-2xl md:text-4xl text-gradient-primary font-bold mb-6 py-4">
Choose category for your listing        </h1>
        
      </div>
    </section>

        <CategoryCards categories={categories} />
  </div>
  );
}
