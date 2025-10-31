"use client";

import { useForm } from "react-hook-form";

export default function ApplianceForm() {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    console.log("Appliance form data:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create Appliance Listing</h2>

      <input {...register("brand")} placeholder="Brand" className="border p-2 rounded w-full mb-3" />
      <input {...register("model")} placeholder="Model" className="border p-2 rounded w-full mb-3" />
      <input {...register("condition")} placeholder="Condition" className="border p-2 rounded w-full mb-3" />
      <input {...register("price")} type="number" placeholder="Price" className="border p-2 rounded w-full mb-3" />
      <textarea {...register("description")} placeholder="Description" className="border p-2 rounded w-full mb-3" />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Submit Appliance
      </button>
    </form>
  );
}
