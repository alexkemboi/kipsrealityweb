import ListUnitForm from "./ListUnitForm";

export default async function Page({ params }: { params: Promise<{ id: string; unitNumber: string }> }) {
  const { id, unitNumber } = await params; // ✅ Correct way in Next.js 15

  return <ListUnitForm propertyId={id} unitNumber={unitNumber} />;
}
