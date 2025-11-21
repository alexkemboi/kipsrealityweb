import AmendmentManager from "@/components/Dashboard/propertymanagerdash/tenants/AmmendmentManger";

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  return <AmendmentManager leaseId={params.id} />;
}
