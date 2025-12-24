"use client";

import { useForm } from "react-hook-form";
import Navbar from "@/components/website/Navbar";
import Footer from "@/components/website/Footer";

export default function ApplianceForm() {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data: any) => {
    console.log("Appliance form data:", data);
    reset();
    alert("Appliance listing created successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="w-full bg-[#18181a] text-white py-24 flex flex-col items-center justify-center text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gradient-primary">
          Create Appliance Listing
        </h1>
        <p className="text-white/80 text-lg max-w-xl">
          Add your appliances for sale or rent by filling out the form below.
        </p>
      </section>

      <main className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-md mt-10 mb-20">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Appliance Details</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              {...register("brand")}
              placeholder="Brand"
              className="border p-3 rounded-lg w-full placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              {...register("model")}
              placeholder="Model"
              className="border p-3 rounded-lg w-full placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              {...register("condition")}
              placeholder="Condition (e.g., New, Used)"
              className="border p-3 rounded-lg w-full placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              {...register("price")}
              type="number"
              placeholder="Price (USD)"
              className="border p-3 rounded-lg w-full placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <textarea
            {...register("description")}
            placeholder="Description"
            rows={4}
            className="border p-3 rounded-lg w-full placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="flex items-center gap-2 mt-4">
            <input type="checkbox" {...register("warrantyIncluded")} />
            <span>Includes Warranty</span>
          </label>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 mt-6 w-full transition-all"
          >
            Submit Appliance
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
