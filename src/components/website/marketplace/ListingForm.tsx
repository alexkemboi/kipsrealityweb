"use client";

import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, MapPin, Tag, DollarSign } from "lucide-react";
import { useDropzone } from "react-dropzone";

export default function ListingForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    category: "property",
    contactEmail: "",
    contactPhone: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImages(prev => [...prev, ...acceptedFiles.slice(0, 6)]); // Limit to 6 images
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 6,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log("Listing submitted:", formData);
      console.log("Images:", images);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        price: "",
        location: "",
        category: "property",
        contactEmail: "",
        contactPhone: "",
      });
      setImages([]);
      
      alert("Listing published successfully!");
    } catch (error) {
      console.error("Error submitting listing:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewUrls = images.map(file => URL.createObjectURL(file));

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-2xl bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl shadow-2xl shadow-blue-500/5">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Tag className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
            Create New Listing
          </CardTitle>
          <p className="text-slate-600 text-lg font-medium mt-2">
            Share your property or item with potential buyers
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Listing Title *
              </label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Modern 2-Bedroom Apartment with Mountain View"
                className="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all duration-200 px-4 py-3"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your property or item in detail. Include key features, condition, and any special notes..."
                className="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all duration-200 px-4 py-3 resize-vertical min-h-[120px]"
                rows={4}
                required
              />
            </div>

            {/* Price & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className=" text-sm font-semibold text-slate-700 flex items-center gap-2">
                  Price (KES) *
                </label>
                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="85,000"
                  className="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all duration-200 px-4 py-3"
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className=" text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location *
                </label>
                <Input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Westlands, Nairobi"
                  className="w-full bg-white text-slate-900 placeholder-slate-400 border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all duration-200 px-4 py-3"
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
           

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-white text-slate-900 border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all duration-200 px-4 py-3 appearance-none cursor-pointer"
              >
                <option value="property">Property</option>
                <option value="furniture"> Furniture</option>
                <option value="appliance">Appliance</option>
                <option value="decor"> Home Décor</option>
                <option value="service"> Service</option>
                <option value="vehicle"> Vehicle</option>
                <option value="electronics"> Electronics</option>
              </select>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <label className=" text-sm font-semibold text-slate-700 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Images {images.length > 0 && `(${images.length}/6)`}
              </label>
              
              <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-slate-300 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/30"
                }`}
              >
                <input {...getInputProps()} />
                <div className="space-y-3">
                  <Upload className={`w-12 h-12 mx-auto transition-colors ${
                    isDragActive ? "text-blue-500" : "text-slate-400"
                  }`} />
                  <div className="space-y-1">
                    <p className="text-slate-700 font-medium">
                      {isDragActive ? "Drop images here" : "Drag & drop images here"}
                    </p>
                    <p className="text-slate-500 text-sm">
                      or click to browse (max 6 images, 5MB each)
                    </p>
                  </div>
                </div>
              </div>

              {/* Image Previews */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {previewUrls.map((src, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={src}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl border-2 border-slate-200 group-hover:border-slate-300 transition-all duration-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 shadow-lg"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Publishing...
                </div>
              ) : (
                "Publish Listing"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}