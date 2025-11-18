
'use client'

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Property, ApartmentComplexDetail, HouseDetail } from "@/app/data/PropertyData";
import { PropertyType } from "@/app/data/PropertTypeData";
import { Appliance } from "@/app/data/ApplianceData";
import { fetchPropertyTypes } from "@/lib/property-type";
import { fetchAppliances } from "@/lib/appliance";
import { postProperty, PropertyPayload } from "@/lib/property-manager";
import Footer from "@/components/website/Footer";
import { HomeIcon } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function PropertyForm() {
  const { register, handleSubmit, watch, reset } = useForm<Property>({
    defaultValues: {
      houseDetail: { houseName: "",numberOfFloors: 0, bedrooms: 0, bathrooms: 0, size: 0 },
      apartmentComplexDetail: { buildingName: "", totalFloors: 0, totalUnits: 0 },
      applianceIds: [],
      isFurnished: false,
    },
  });

  const { user } = useAuth();
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
        const [types, apps] = await Promise.all([fetchPropertyTypes(), fetchAppliances()]);
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
    if (!user) {
      toast.error("You must be logged in to create a property.");
      return;
    }

    setLoading(true);

    const payload: PropertyPayload = {
      manager: {
        id: user.id, // logged-in user as manager
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        orgUserId: user.organizationUserId!, // use organizationUserId from AuthContext
        organizationId: user.organization!.id,
      },
      organizationId: user.organization!.id,
      name: data.name,
      propertyTypeId: selectedPropertyTypeId!,
      locationId: data.locationId!,
      city: data.city,
      address: data.address,
      amenities: data.amenities,
      isFurnished: data.isFurnished,
      availabilityStatus: data.availabilityStatus,
      propertyDetails:
        selectedPropertyTypeName === "apartment"
          ? data.apartmentComplexDetail
          : selectedPropertyTypeName === "house"
          ? data.houseDetail
          : undefined,
      applianceIds: data.applianceIds || [],
    };

    try {
      await postProperty(payload);
      toast.success("Property created successfully!");
      reset();
    } catch (error: any) {
      console.error("Error creating property:", error);
      toast.error(error.message || "Failed to create property.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" bg-gradient-to-b from-gray-50 to-gray-200">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Banner */}
      <section className="relative w-full  text-white py-14 text-center overflow-hidden ">
       
      </section>

      {/* Form Section */}
      <main className="max-w-4xl mx-auto px-6 sm:px-8 -mt-20 mb-8">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-white/20">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-600 text-white rounded-full shadow-lg">
              <HomeIcon className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Property Details</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-8">
            {/* Basic Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                {...register("city")}
                placeholder="City"
                required
                className="border border-gray-300 focus:border-blue-500 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-200 rounded-xl p-3 w-full"
              />
              <input
                {...register("address")}
                placeholder="Address"
                required
                className="border border-gray-300 focus:border-blue-500 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-200 rounded-xl p-3 w-full"
              />
              <select
                {...register("propertyTypeId")}
                required
                className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl p-3 w-full"
              >
                <option value="">Select Property Type</option>
                {propertyTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

           {/* House Fields */}
{selectedPropertyTypeName === "house" && (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
 {/* House Name */}
  <div className="flex flex-col">
    <label
      htmlFor="houseName"
      className="text-sm font-semibold text-gray-700 mb-1"
    >
      House Name
    </label>
    <input
      id="houseName"
      {...register("houseDetail.houseName")}
      placeholder="Enter house name"
      className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500"
    />
  </div>

    {/* Number of Floors */}
    <div className="flex flex-col">
      <label
        htmlFor="numberOfFloors"
        className="text-sm font-semibold text-gray-700 mb-1"
      >
        Number of Floors
      </label>
      <input
        id="numberOfFloors"
        type="number"
        {...register("houseDetail.numberOfFloors", { valueAsNumber: true })}
        placeholder="Enter number of floors"
        className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500"
      />
    </div>

    {/* Bedrooms */}
    <div className="flex flex-col">
      <label
        htmlFor="bedrooms"
        className="text-sm font-semibold text-gray-700 mb-1"
      >
        Bedrooms
      </label>
      <input
        id="bedrooms"
        type="number"
        {...register("houseDetail.bedrooms", { valueAsNumber: true })}
        placeholder="Enter bedrooms"
        className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500"
      />
    </div>

    {/* Bathrooms */}
    <div className="flex flex-col">
      <label
        htmlFor="bathrooms"
        className="text-sm font-semibold text-gray-700 mb-1"
      >
        Bathrooms
      </label>
      <input
        id="bathrooms"
        type="number"
        {...register("houseDetail.bathrooms", { valueAsNumber: true })}
        placeholder="Enter bathrooms"
        className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500"
      />
    </div>

    {/* Size */}
    <div className="flex flex-col">
      <label
        htmlFor="size"
        className="text-sm font-semibold text-gray-700 mb-1"
      >
        Size (sqft)
      </label>
      <input
        id="size"
        type="number"
        {...register("houseDetail.size", { valueAsNumber: true })}
        placeholder="Enter size in sqft"
        className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500"
      />
    </div>


    {/* Total Units */}
  <div className="flex flex-col">
    <label
      htmlFor="totalUnits"
      className="text-sm font-semibold text-gray-700 mb-1"
    >
      Total Units
    </label>
    <input
      id="totalUnits"
      type="number"
      {...register("houseDetail.totalUnits", { valueAsNumber: true })}
      placeholder="Enter total units"
      className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500"
    />
  </div>
  </div>
)}


            {/* Apartment Fields */}
            {selectedPropertyTypeName === "apartment" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Building Name */}
  <div className="flex flex-col">
    <label
      htmlFor="buildingName"
      className="text-sm font-semibold text-gray-700 mb-1"
    >
      Building Name
    </label>
    <input
      id="buildingName"
      {...register("apartmentComplexDetail.buildingName")}
      placeholder="Enter building name"
      className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500"
    />
  </div>

  {/* Total Floors */}
  <div className="flex flex-col">
    <label
      htmlFor="totalFloors"
      className="text-sm font-semibold text-gray-700 mb-1"
    >
      Total Floors
    </label>
    <input
      id="totalFloors"
      type="number"
      {...register("apartmentComplexDetail.totalFloors", { valueAsNumber: true })}
      placeholder="Enter total floors"
      className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500"
    />
  </div>

  {/* Total Units */}
  <div className="flex flex-col">
    <label
      htmlFor="totalUnits"
      className="text-sm font-semibold text-gray-700 mb-1"
    >
      Total Units
    </label>
    <input
      id="totalUnits"
      type="number"
      {...register("apartmentComplexDetail.totalUnits", { valueAsNumber: true })}
      placeholder="Enter total units"
      className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500"
    />
  </div>
</div>

            )}

           

            {/* Furnished */}
            <label className="flex items-center gap-3 mt-4 text-gray-700">
              <input type="checkbox" {...register("isFurnished")} className="h-5 w-5 accent-blue-600" />
              <span className="text-lg">Is Furnished?</span>
            </label>

            {/* Submit */}
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

    </div>
  );
}