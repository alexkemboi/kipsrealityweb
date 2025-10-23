import react from "react";
import {useState} from "react";
import {Input} from "@/components/ui/input";
import { Button } from "@/components/ui/button";


export default function CreateListingPage() {

    const [formData, setFormData] = useState({
        title: "",
        price: "",
        location: "",
        description: "",
        category: "Residential",
      });
      const [images, setImages] = useState<FileList | null>(null);
    
      const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value,
        });
      };
    
      const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImages(e.target.files);
      };
    
      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Listing submitted:", formData);
        console.log("Images:", images);
        // TODO: connect to backend API or Firebase storage
      };
return(
        <main className="container mx-auto px-4 py-12">

 <div className="w-full bg-[#18181a] text-white py-32 flex flex-col items-center justify-center text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Create <span className="text-gradient-primary">Listing</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Fill in the details below to create a new marketplace listing and reach potential buyers or renters today.
          </p>
        </div>
      <div className="mt-14">      </div>

      <div className="w-full max-w-2xl bg-neutral-900 rounded-2xl  shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Create <span className="text-gradient-primary">New Listing</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm mb-2 font-medium">Property Title</label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Modern 2-Bedroom Apartment"
              className="w-full p-3 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm mb-2 font-medium">Price (KES)</label>
            <Input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g. 45000"
              className="w-full p-3 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm mb-2 font-medium">Location</label>
            <Input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Westlands, Nairobi"
              className="w-full p-3 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm mb-2 font-medium">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-blue-500 focus:outline-none"
              required
            >
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Land">Land</option>
              <option value="Office Space">Office Space</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm mb-2 font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your property..."
              rows={4}
              className="w-full p-3 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-blue-500 focus:outline-none resize-none"
              required
            ></textarea>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm mb-2 font-medium">Upload Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4
                         file:rounded-md file:border-0 file:text-sm file:font-semibold
                         file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>

          {/* Submit */}
          <div className="text-center pt-4">
            <Button type="submit" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
              Submit Listing
            </Button>
          </div>
        </form>
      </div>
      </main>
      )
};