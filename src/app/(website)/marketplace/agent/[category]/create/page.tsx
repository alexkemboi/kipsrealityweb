import { notFound } from "next/navigation";
import PropertyForm from "@/components/website/marketplace/CategoryForms/PropertyForm";
import ServiceForm from "@/components/website/marketplace/CategoryForms/ServiceForm";
import ApplianceForm from "@/components/website/marketplace/CategoryForms/ApplianceForm";

interface PageProps {
  params: Promise<{ category: string }>;
}

export default async function CreateListingPage({ params }: PageProps) {
  const resolvedParams = await params;
  const categoryId = resolvedParams.category;

  switch (categoryId.toLowerCase()) {
    case "property":
      return <PropertyForm />;
    case "services":
      return <ServiceForm />;
    case "appliances":
      return <ApplianceForm />;
    default:
      return notFound();
  }
}