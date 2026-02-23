import type { Metadata } from "next";

type PlansPageProps = {
  searchParams?: {
    tier?: string;
    billing?: string;
    source?: string;
  };
};

function normalizeTier(raw?: string) {
  const value = (raw ?? "").trim().toLowerCase();

  const tierMap: Record<string, { label: string; seo: string }> = {
    starter: { label: "Starter", seo: "Starter Plan" },
    basic: { label: "Basic", seo: "Basic Plan" },
    pro: { label: "Pro", seo: "Pro Plan" },
    professional: { label: "Professional", seo: "Professional Plan" },
    business: { label: "Business", seo: "Business Plan" },
    growth: { label: "Growth", seo: "Growth Plan" },
    enterprise: { label: "Enterprise", seo: "Enterprise Plan" },
  };

  return tierMap[value] ?? null;
}

function normalizeBilling(raw?: string) {
  const value = (raw ?? "").trim().toLowerCase();

  if (["monthly", "month", "mo"].includes(value)) {
    return { label: "Monthly", seo: "monthly billing" };
  }

  if (["yearly", "annual", "annually", "year"].includes(value)) {
    return { label: "Annual", seo: "annual billing" };
  }

  return null;
}

function buildTitle(tier: ReturnType<typeof normalizeTier>, billing: ReturnType<typeof normalizeBilling>) {
  if (tier && billing) return `${tier.label} Plan (${billing.label}) | RentFlow360 Pricing`;
  if (tier) return `${tier.label} Plan | RentFlow360 Pricing`;
  if (billing) return `Plans & Pricing (${billing.label}) | RentFlow360`;
  return "Plans & Pricing | RentFlow360";
}

function buildDescription(
  tier: ReturnType<typeof normalizeTier>,
  billing: ReturnType<typeof normalizeBilling>
) {
  const base =
    "Explore RentFlow360 plans and pricing for property management, marketplace listings, and growth tools. Compare features and choose the plan that fits your workflow.";

  if (tier && billing) {
    return `Explore the RentFlow360 ${tier.seo} with ${billing.seo}. Compare features, listing tools, and operations capabilities to find the best fit for your workflow.`;
  }

  if (tier) {
    return `Review the RentFlow360 ${tier.seo}. Compare features for marketplace listings, property operations, and workflow management.`;
  }

  if (billing) {
    return `Compare RentFlow360 plans with ${billing.seo}. Explore features for property management, marketplace listings, and operational workflows.`;
  }

  return base;
}

function buildCanonical(searchParams?: PlansPageProps["searchParams"]) {
  const params = new URLSearchParams();

  const tier = normalizeTier(searchParams?.tier);
  const billing = normalizeBilling(searchParams?.billing);

  if (tier && searchParams?.tier) params.set("tier", searchParams.tier);
  if (billing && searchParams?.billing) params.set("billing", searchParams.billing);

  const query = params.toString();
  return query ? `/plans?${query}` : "/plans";
}

export async function generateMetadata(
  { searchParams }: PlansPageProps
): Promise<Metadata> {
  const tier = normalizeTier(searchParams?.tier);
  const billing = normalizeBilling(searchParams?.billing);

  const title = buildTitle(tier, billing);
  const description = buildDescription(tier, billing);
  const canonical = buildCanonical(searchParams);

  // Optional: tailor OG/Twitter title a bit more for campaign traffic
  const source = (searchParams?.source ?? "").trim().toLowerCase();
  const isCampaignSource = ["google", "ads", "campaign", "email", "linkedin"].includes(source);

  const ogTitle = isCampaignSource
    ? `${tier?.label ?? "RentFlow360"} Plans & Pricing`
    : title.replace(" | RentFlow360 Pricing", " | RentFlow360");

  return {
    title,
    description,
    keywords: [
      "RentFlow360",
      "plans",
      "pricing",
      "property management software pricing",
      "marketplace pricing",
      "rental management plans",
      "PropTech software",
      ...(tier ? [`${tier.label.toLowerCase()} plan`] : []),
      ...(billing ? [`${billing.label.toLowerCase()} billing`] : []),
    ],
    alternates: {
      canonical,
    },
    openGraph: {
      title: ogTitle,
      description,
      url: canonical,
      siteName: "RentFlow360",
      type: "website",
      // images: [
      //   {
      //     url: "/og/plans.png",
      //     width: 1200,
      //     height: 630,
      //     alt: "RentFlow360 Plans and Pricing",
      //   },
      // ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      // images: ["/og/plans.png"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
