import EditUnitForm from "@/components/Dashboard/propertymanagerdash/units/EditUnitForm";

export default async function EditUnitPage({
  params,
}: {
  params: Promise<{ id: string; unitNumber: string }>;
}) {
  const { id, unitNumber } = await params; 

  return <EditUnitForm propertyId={id} unitNumber={unitNumber} />;
}
