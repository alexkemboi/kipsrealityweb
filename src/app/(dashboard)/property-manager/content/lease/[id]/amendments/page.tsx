import AmendmentManager from "@/components/Dashboard/propertymanagerdash/tenants/AmmendmentManger";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AmendmentManager leaseId={id} />;
}
