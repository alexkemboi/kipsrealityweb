"use client";

import { useForm } from "react-hook-form";

export default function ServiceForm() {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    console.log("Service form data:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create Service Listing</h2>

      <input {...register("service_type")} placeholder="Service Type" className="border p-2 rounded w-full mb-3" />
      <input {...register("rate")} type="number" placeholder="Rate (per hour/day)" className="border p-2 rounded w-full mb-3" />
      <textarea {...register("description")} placeholder="Service Description" className="border p-2 rounded w-full mb-3" />
      <input {...register("availability")} placeholder="Availability" className="border p-2 rounded w-full mb-3" />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Submit Service
      </button>
    </form>
  );
}
