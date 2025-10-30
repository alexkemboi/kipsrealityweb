"use client";

import { useForm } from "react-hook-form";

export default function PropertyForm() {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    console.log("Property form data:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create Property Listing</h2>

      <input {...register("title")} placeholder="Property Title" className="border p-2 rounded w-full mb-3" />
      <input {...register("location")} placeholder="Location" className="border p-2 rounded w-full mb-3" />
      <input {...register("bedrooms")} type="number" placeholder="Bedrooms" className="border p-2 rounded w-full mb-3" />
      <input {...register("bathrooms")} type="number" placeholder="Bathrooms" className="border p-2 rounded w-full mb-3" />
      <textarea {...register("description")} placeholder="Description" className="border p-2 rounded w-full mb-3" />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Submit Property
      </button>
    </form>
  );
}
