"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";

export default function ListingForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    category: "property",
  });

  const [images, setImages] = useState<FileList | null>(null);
  const [preview, setPreview] = useState<string[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setImages(files);
      const imagePreviews = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setPreview(imagePreviews);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Listing submitted:", formData);
    console.log("Images:", images);
  };

  return (
    <section className="min-h-screen bg-white flex items-center justify-center py-20 px-4 relative overflow-hidden">
  {/* Optional soft glow behind form */}

<Card className="relative w-full max-w-2xl bg-white border border-neutral-200 rounded-2xl shadow-xl ">
    <CardHeader>
      <CardTitle className="text-3xl font-bold text-center text-black drop-shadow-lg">
        Create New Listing
      </CardTitle>
      <p className="text-center text-black text-lg font-semibold mt-2">
        Fill in the details below to publish your property or asset.
      </p>
    </CardHeader>

    <CardContent>
      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        {/* Title */}
        <div>
          <label className="block text-base font-medium mb-2 text-black">Title</label>
          <Input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Modern 2-Bedroom Apartment"
            className="w-full bg-white text-black placeholder-neutral-500 border border-neutral-700 focus:border-blue-500 rounded-lg shadow-inner"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-base font-medium mb-2 text-black">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your property or item..."
            className="w-full bg-white text-black placeholder-neutral-500 border border-neutral-700 focus:border-blue-500 focus:outline-none
 rounded-lg shadow-inner"
            rows={4}
            required
          />
        </div>

        {/* Price & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-medium mb-2 text-black">Price (KES)</label>
            <Input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g. 85,000"
              className="w-full bg-white text-black placeholder-neutral-500 border border-neutral-700 focus:border-blue-500 rounded-lg shadow-inner"
              required
            />
          </div>

          <div>
            <label className="block text-base font-medium mb-2 text-black">Location</label>
            <Input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Westlands, Nairobi"
              className="w-full bg-white text-black placeholder-neutral-500 border border-neutral-700 focus:border-blue-500 rounded-lg shadow-inner"
              required
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-base font-medium mb-2 text-black">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white text-black border border-black focus:border-blue-500 focus:outline-none shadow-inner"
          >
            <option value="property">Property</option>
            <option value="furniture">Furniture</option>
            <option value="appliance">Appliance</option>
            <option value="decor">Home Décor</option>
            <option value="service">Service</option>
          </select>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2 text-white/80">Upload Images</label>
          <div className="relative border-2 border-dashed border-neutral-700 rounded-xl p-6 text-center hover:border-blue-500 transition bg-white">
            <Input
              type="file"
              name="images"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="imageUpload"
            />
            <label
              htmlFor="imageUpload"
              className="cursor-pointer text-black hover:text-blue-400 flex flex-col items-center gap-2"
            >
              <Upload className="w-6 h-6" />
              <span>Click or drag images to upload</span>
            </label>
          </div>

          {/* Preview Section */}
          {preview.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {preview.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Preview ${index}`}
                  className="w-full h-24 object-cover rounded-lg border border-neutral-700 shadow-md hover:scale-105 transition"
                />
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-[0_4px_20px_rgba(59,130,246,0.5)] hover:shadow-[0_6px_30px_rgba(59,130,246,0.6)]"
        >
          Publish Listing
        </Button>
      </form>
    </CardContent>
  </Card>
</section>

  );
}
