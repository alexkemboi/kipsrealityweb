import { notFound } from "next/navigation";
import PropertyForm from "@/components/website/marketplace/CategoryForms/PropertyForm";
import ServiceForm from "@/components/website/marketplace/CategoryForms/ServiceForm";
import ApplianceForm from "@/components/website/marketplace/CategoryForms/ApplianceForm";

export default function CreateListingPage({ params }: { params: { category: string } }) {
  const { category } = params;

  switch (category.toLowerCase()) {
    case "property":
      return <PropertyForm />;
    case "service":
      return <ServiceForm />;
    case "appliance":
      return <ApplianceForm />;
    default:
      return notFound();
  }
}
