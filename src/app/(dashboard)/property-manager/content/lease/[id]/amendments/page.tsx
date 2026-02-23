import { notFound } from "next/navigation";
import AmendmentManager from "@/components/Dashboard/propertymanagerdash/tenants/AmmendmentManger";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return <AmendmentManager leaseId={id} />;
}
