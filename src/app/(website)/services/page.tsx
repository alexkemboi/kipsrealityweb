// src/app/%28website%29/services/page.tsx
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import ServicesPageClient from "@/components/website/services/ServicePageClient";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const categoriesQuery = {
    include: { services: true },
    orderBy: { id: "asc" },
  } satisfies Prisma.categoriesFindManyArgs;

  type CategoryWithServices = Prisma.categoriesGetPayload<typeof categoriesQuery>;

  let categoriesFromDB: CategoryWithServices[] = [];

  try {
    categoriesFromDB = await prisma.categories.findMany(categoriesQuery);
  } catch (error) {
    console.error("Error fetching services categories:", error);
    categoriesFromDB = [];
  }


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
