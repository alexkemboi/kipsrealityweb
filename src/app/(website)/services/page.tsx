// src/app/%28website%29/services/page.tsx
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import ServicesPageClient from "@/components/website/services/ServicePageClient";

export const dynamic = "force-dynamic";

const PAGE_PATH = "/services";
const FALLBACK_SITE_NAME = "RentFlow360";

type JsonLike =
  | string
  | number
  | boolean
  | null
  | JsonLike[]
  | { [key: string]: JsonLike };

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (typeof item === "number" || typeof item === "boolean") return String(item);
      return "";
    })
    .filter(Boolean);
}

function getBaseUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!siteUrl) return undefined;
  return siteUrl.replace(/\/+$/, "");
}

function getAbsoluteUrl(path: string) {
  const base = getBaseUrl();
  return base ? `${base}${path.startsWith("/") ? path : `/${path}`}` : undefined;
}

function buildPageDescription(serviceCount?: number, categoryCount?: number) {
  const counts =
    typeof serviceCount === "number" && typeof categoryCount === "number"
      ? ` Explore ${serviceCount} services across ${categoryCount} categories.`
      : "";

  return `Browse professional services on ${FALLBACK_SITE_NAME}, organized by category for faster discovery and better decision-making.${counts}`;
}

function buildKeywords(categoryNames: string[]) {
  const base = [
    "services marketplace",
    "professional services",
    "property services",
    "RentFlow360 services",
    "service categories",
    "rental housing services",
    "vendor services marketplace",
  ];

  return [...base, ...categoryNames.slice(0, 8)];
}

type ServiceLite = {
  id: number;
  name: string;
  description: string | null;
  categoryName: string;
};

type CategoryLite = {
  id: number;
  name: string;
  tagline: string | null;
  color: string | null;
};

async function fetchSeoCountsAndPreview() {
  try {
    const [categoryCount, serviceCount, categoriesPreview, servicesPreview] = await Promise.all([
      prisma.categories.count(),
      prisma.services.count(),
      prisma.categories.findMany({
        select: { id: true, name: true, tagline: true, color: true },
        orderBy: { id: "asc" },
        take: 12,
      }),
      prisma.services.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          categories: { select: { name: true } },
        },
        orderBy: { id: "asc" },
        take: 20,
      }),
    ]);

    const mappedServices: ServiceLite[] = servicesPreview.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      categoryName: s.categories?.name ?? "Services",
    }));

    return {
      categoryCount,
      serviceCount,
      categoriesPreview: categoriesPreview as CategoryLite[],
      servicesPreview: mappedServices,
    };
  } catch (error) {
    console.error("[ServicesPage] SEO fetch error:", error);
    return {
      categoryCount: undefined,
      serviceCount: undefined,
      categoriesPreview: [] as CategoryLite[],
      servicesPreview: [] as ServiceLite[],
    };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { categoryCount, serviceCount, categoriesPreview } = await fetchSeoCountsAndPreview();

  const title = `Services Marketplace | ${FALLBACK_SITE_NAME}`;
  const description = buildPageDescription(serviceCount, categoryCount);
  const absoluteUrl = getAbsoluteUrl(PAGE_PATH);

  return {
    title,
    description,
    keywords: buildKeywords(categoriesPreview.map((c) => c.name)),
    alternates: {
      canonical: PAGE_PATH,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl ?? PAGE_PATH,
      type: "website",
      siteName: FALLBACK_SITE_NAME,
      images: absoluteUrl ? [{ url: `${absoluteUrl}/opengraph-image` }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: absoluteUrl ? [`${absoluteUrl}/opengraph-image`] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    category: "business",
    other: {
      "format-detection": "telephone=no",
    },
  };
}

const categoriesQuery = {
  include: { services: true },
  orderBy: { id: "asc" },
} satisfies Prisma.categoriesFindManyArgs;

type CategoryWithServices = Prisma.categoriesGetPayload<typeof categoriesQuery>;

async function fetchCategories(): Promise<CategoryWithServices[]> {
  try {
    return await prisma.categories.findMany(categoriesQuery);
  } catch (error) {
    console.error("[ServicesPage] Error fetching services categories:", error);
    return [];
  }
}

function ServicesJsonLd({
  categories,
  services,
  categoryCount,
  serviceCount,
}: {
  categories: CategoryLite[];
  services: ServiceLite[];
  categoryCount?: number;
  serviceCount?: number;
}) {
  const absoluteUrl = getAbsoluteUrl(PAGE_PATH);
  const websiteUrl = getBaseUrl();

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Services Marketplace",
    description: buildPageDescription(serviceCount, categoryCount),
    url: absoluteUrl ?? PAGE_PATH,
    isPartOf: websiteUrl
      ? {
          "@type": "WebSite",
          name: FALLBACK_SITE_NAME,
          url: websiteUrl,
        }
      : undefined,
    about: {
      "@type": "Thing",
      name: "Professional Services Marketplace",
    },
    mainEntity: {
      "@type": "ItemList",
      name: "Service Categories",
      numberOfItems: categoryCount ?? categories.length,
      itemListElement: categories.slice(0, 12).map((cat, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: cat.name,
        url: absoluteUrl ? `${absoluteUrl}#category-${cat.id}` : undefined,
        item: {
          "@type": "Thing",
          name: cat.name,
          description: cat.tagline ?? undefined,
        },
      })),
    },
  };

  const itemListServicesJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Marketplace Services",
    numberOfItems: serviceCount ?? services.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: services.slice(0, 20).map((srv, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: srv.name,
        description: srv.description ?? undefined,
        serviceType: srv.categoryName,
        provider: {
          "@type": "Organization",
          name: FALLBACK_SITE_NAME,
          url: websiteUrl,
        },
        areaServed: {
          "@type": "Country",
          name: "United States",
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListServicesJsonLd) }}
      />
    </>
  );
}

export default async function ServicesPage() {
  const [categoriesFromDB, seoPreview] = await Promise.all([
    fetchCategories(),
    fetchSeoCountsAndPreview(),
  ]);

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
      features: toStringArray(srv.features as JsonLike),
      impact: srv.impact,
      icon: srv.icon,
    })),
  }));

  return (
    <>
      <ServicesJsonLd
        categories={seoPreview.categoriesPreview}
        services={seoPreview.servicesPreview}
        categoryCount={seoPreview.categoryCount}
        serviceCount={seoPreview.serviceCount}
      />
      <ServicesPageClient categories={categories} />
    </>
  );
}
