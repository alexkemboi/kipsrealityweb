import { getProperties,updateProperty, deleteProperty } from "@/lib/property-manager";
import PropertyTable from "@/components/Dashboard/propertymanagerdash/property/PropertyTable";

export default async function PropertyManagerPage() {
  const properties = await getProperties();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Manage Properties
      </h1>
      <PropertyTable properties={properties || []} />
    </div>
  );
}
