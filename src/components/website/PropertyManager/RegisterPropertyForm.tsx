"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Property } from "@/app/data/PropertyData";
import { PropertyType } from "@/app/data/PropertTypeData";
import { Appliance } from "@/app/data/ApplianceData";
import { fetchPropertyTypes } from "@/lib/property-type";
import { fetchAppliances } from "@/lib/appliance";
import { postProperty } from "@/lib/property-manager";
import Footer from "@/components/website/Footer";
import { HomeIcon } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function PropertyForm() {
  const { register, handleSubmit, watch, reset } = useForm<Property>();
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedPropertyTypeId = watch("propertyTypeId");
  const selectedPropertyTypeName = propertyTypes.find(
    (type) => type.id === selectedPropertyTypeId
  )?.name?.toLowerCase();

  useEffect(() => {
    const getData = async () => {
      try {
        const [types, apps] = await Promise.all([
          fetchPropertyTypes(),
          fetchAppliances(),
        ]);
        setPropertyTypes(types);
        setAppliances(apps);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load property types or appliances.");
      }
    };
    getData();
  }, []);

  const onSubmit = async (data: Property) => {
  setLoading(true);

  try {
    const payload = {
      managerId: data.managerId,
      name: data.name,
      organizationId: data.organizationId,
      propertyTypeId: selectedPropertyTypeId,
      locationId: data.locationId,
      city: data.city,
      address: data.address,
      amenities: data.amenities,
      isFurnished: data.isFurnished,
      availabilityStatus: data.availabilityStatus,
      propertyDetails:
        selectedPropertyTypeName === "apartment"
          ? {
              buildingName: data.apartmentComplexDetail?.buildingName,
              totalFloors: data.apartmentComplexDetail?.totalFloors,
              totalUnits: data.apartmentComplexDetail?.totalUnits,
            }
          : selectedPropertyTypeName === "house"
          ? {
              numberOfFloors: data.houseDetail?.numberOfFloors,
              bedrooms: data.houseDetail?.bedrooms,
              bathrooms: data.houseDetail?.bathrooms,
              size: data.houseDetail?.size,
            }
          : {},
    };

    const newProperty = await postProperty(payload);
    console.log("Property created:", newProperty);
    toast.success("Property created successfully!");
    reset();
  } catch (error) {
    console.error("Error creating property:", error);
    toast.error("Failed to create property.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Banner */}
      <section className="relative w-full bg-[#18181a] text-white py-28 text-center overflow-hidden mb-24">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700/60 to-indigo-600/60 mix-blend-overlay"></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">
            Register Your Property
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Add your property to the marketplace.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <main className="max-w-4xl mx-auto px-6 sm:px-8 -mt-20 mb-20">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-white/20">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-600 text-white rounded-full shadow-lg">
              <HomeIcon className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">
              Property Details
            </h2>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-8"
          >
            {/* Basic Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                {...register("city")}
                placeholder="City"
                required
                className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-xl p-3 w-full"
              />
              <input
                {...register("address")}
                placeholder="Address"
                required
                className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-xl p-3 w-full"
              />

              {/* Property Type Dropdown */}
              <select
                {...register("propertyTypeId")}
                required
                className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl p-3 w-full text-gray-700"
              >
                <option value="">Select Property Type</option>
                {propertyTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Conditional Fields for House */}
            {selectedPropertyTypeName === "house" && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <input
                  {...register("houseDetail.numberOfFloors", { valueAsNumber: true })}
                  type="number"
                  placeholder="Number of Floors"
                  className="border border-gray-300 rounded-xl p-3 w-full"
                />
                <input
                  {...register("houseDetail.bedrooms", { valueAsNumber: true })}
                  type="number"
                  placeholder="Bedrooms"
                  className="border border-gray-300 rounded-xl p-3 w-full"
                />
                <input
                  {...register("houseDetail.bathrooms", { valueAsNumber: true })}
                  type="number"
                  placeholder="Bathrooms"
                  className="border border-gray-300 rounded-xl p-3 w-full"
                />
                <input
                  {...register("houseDetail.size", { valueAsNumber: true })}
                  type="number"
                  placeholder="Size (sqft)"
                  className="border border-gray-300 rounded-xl p-3 w-full"
                />
              </div>
            )}

            {/* Conditional Fields for Apartment */}
            {selectedPropertyTypeName === "apartment" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <input
                  {...register("apartmentComplexDetail.buildingName")}
                  placeholder="Building Name"
                  className="border border-gray-300 rounded-xl p-3 w-full"
                />
                <input
                  {...register("apartmentComplexDetail.totalFloors", { valueAsNumber: true })}
                  type="number"
                  placeholder="Total Floors"
                  className="border border-gray-300 rounded-xl p-3 w-full"
                />
                <input
                  {...register("apartmentComplexDetail.totalUnits", { valueAsNumber: true })}
                  type="number"
                  placeholder="Total Units"
                  className="border border-gray-300 rounded-xl p-3 w-full"
                />
              </div>
            )}

            {/* Appliances */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Select Appliances
              </h3>
              {appliances.length === 0 ? (
                <p className="text-gray-500 text-sm">Loading appliances...</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {appliances.map((appliance) => (
                    <label
                      key={appliance.id}
                      className="flex items-center gap-3 border border-gray-200 p-3 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer bg-white"
                    >
                      <input
                        type="checkbox"
                        value={appliance.id}
                        {...register("applianceIds")}
                        className="h-5 w-5 accent-blue-600"
                      />
                      <span className="text-gray-700 font-medium">
                        {appliance.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Furnished Checkbox */}
            <label className="flex items-center gap-3 mt-4 text-gray-700">
              <input
                type="checkbox"
                {...register("isFurnished")}
                className="h-5 w-5 accent-blue-600"
              />
              <span className="text-lg">Is Furnished?</span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`mt-8 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Submitting..." : "Submit Property"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
