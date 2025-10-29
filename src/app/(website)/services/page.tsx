import { prisma } from "@/lib/db";
import ServicesPageClient from "@/components/website/services/ServicePageClient";

export default async function ServicesPage() {
  const categoriesFromDB = await prisma.category.findMany({
    include: { services: true },
    orderBy: { id: "asc" },
  });

  // Format JSON `features` safely
  const categories = categoriesFromDB.map((cat) => ({
    id: cat.id,
    name: cat.name,
    tagline: cat.tagline,
    color: cat.color,
    services: cat.services.map((srv) => ({
      id: srv.id,
      category_id: srv.category_id,
      name: srv.name,
      description: srv.description,
      features: Array.isArray(srv.features)
        ? (srv.features as string[])
        : [],
      impact: srv.impact,
      icon: srv.icon,
    })),
  }));

  return <ServicesPageClient categories={categories} />;
}
