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

      <div className="max-w-3xl mx-auto px-6">
          

      <div className="w-full max-w-2xl bg-[#051127] rounded-2xl  shadow-lg p-8">
        <h1 className="text-4xl text-white font-bold mb-6 text-center">
          Enter Listing Details
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl">
          {/* Title */}
          <div>
            <label className="block text-sm mb-2 font-medium text-white">Property Title</label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Modern 2-Bedroom Apartment"
              className="w-full p-3 rounded-lg bg-white text-black font-semibold border-neutral-700 focus:border-blue-500 placeholder:text-gray-400 focus:outline-none"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm mb-2 font-medium text-white">Price (KES)</label>
            <Input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g. 45000"
              className="w-full p-3 rounded-lg bg-white text-black font-semibold border-neutral-700 focus:border-blue-500  placeholder:text-gray-400 focus:outline-none"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm mb-2 font-medium text-white">Location</label>
            <Input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Westlands, Nairobi"
              className="w-full p-3 rounded-lg bg-white text-black font-semibold border-neutral-700 focus:border-blue-500 focus:outline-none placeholder:text-gray-400 
"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm mb-2 font-medium text-white">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white text-black font-semibold border-neutral-700 focus:border-blue-500 focus:outline-none placeholder:text-gray-400"
              required
            >
              <option value="Residential">Property</option>
              <option value="Commercial">Furniture</option>
              <option value="Appliance">Amenity</option>
              <option value="Decor">Office Space</option>
              <option value="Services">Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-base mb-2 font-medium text-white">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your property..."
              rows={4}
              className="w-full p-3 rounded-lg bg-white text-black font-semibold border-neutral-700 focus:border-blue-500 focus:outline-none placeholder:text-gray-400"
              required
            ></textarea>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm mb-2 font-medium text-white">Upload Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4
                         file:rounded-md file:border-0 file:text-sm file:font-semibold
                         file:bg-[#1a5bff] file:text-white hover:file:bg-blue-700"
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
      </div>
      </main>
      )
};