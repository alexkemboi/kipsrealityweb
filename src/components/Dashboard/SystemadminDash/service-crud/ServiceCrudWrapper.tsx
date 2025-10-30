// app/dashboard/services/ServiceCrudWrapper.tsx
import { prisma } from "@/lib/db";
import ServiceCrud from "./ServiceCrud";
import { Category, Service } from "./type";

export default async function ServiceCrudWrapper() {
  const categoriesFromDB = await prisma.category.findMany({
    include: { services: true },
    orderBy: { id: "asc" },
  });

  const categories: Category[] = categoriesFromDB.map((cat) => ({
    id: cat.id,
    name: cat.name,
    tagline: cat.tagline,
    color: cat.color,
    services: cat.services.map((service) => ({
      id: service.id,
      name: service.name,
      category_id: service.category_id,
      description: service.description,
      impact: service.impact,
      icon: service.icon,
      features: Array.isArray(service.features)
        ? (service.features as string[])
        : [],
    })),
  }));

  return <ServiceCrud initialCategories={categories} />;
}
