import EditUnitForm from "@/components/Dashboard/propertymanagerdash/units/EditUnitForm";
import { fetchUnitDetails } from "@/lib/units";


export default async function EditUnitPage({
  params,
}: {
  params: Promise<{ id: string; unitNumber: string }>;
}) {
  const { id: propertyId, unitNumber } = await params;

  const unit = await fetchUnitDetails(propertyId, unitNumber);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-10 px-4">
      <EditUnitForm
        propertyId={propertyId}
        unitNumber={unitNumber}
        existingUnit={unit}
      />
    </div>
  );
}