import type { Metadata } from "next";
import Navbar from "@/components/website/Navbar";
import Footer from "@/components/website/Footer";
import PolicyPageClient, { Policy } from "./PolicyPageClient";
import { prisma } from "@/lib/db";
import LegalPageJsonLd from "@/components/seo/LegalPageJsonLd";

export const dynamic = "force-dynamic";

const POLICY_PATH = "/privacy-policy";
const DEFAULT_SITE_NAME = "RentFlow360";

type PolicyMetaRecord = {
  title: string;
  companyName: string;
  updatedAt: Date;
};

async function fetchLatestPolicyMeta(): Promise<PolicyMetaRecord | null> {
  try {
    const record = await prisma.policy.findFirst({
      select: {
        title: true,
        companyName: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return record ?? null;
  } catch (error) {
    console.error("[PrivacyPolicyPage] Error fetching metadata:", error);
    return null;
  }
}

function formatDateForSeo(date: Date) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return "";
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const record = await fetchLatestPolicyMeta();
  const canonical = POLICY_PATH;

  if (!record) {
    const title = `Privacy Policy | ${DEFAULT_SITE_NAME}`;
    const description =
      "Read the RentFlow360 Privacy Policy, including how we collect, use, and protect information.";

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: DEFAULT_SITE_NAME,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }

  const cleanTitle = record.title?.trim() || "Privacy Policy";
  const companyName = record.companyName?.trim() || DEFAULT_SITE_NAME;
  const lastUpdated = formatDateForSeo(record.updatedAt);

  const title =
    cleanTitle.toLowerCase() === "privacy policy"
      ? `Privacy Policy | ${companyName}`
      : `${cleanTitle} | ${companyName}`;

  const description = lastUpdated
    ? `Read the latest ${companyName} privacy policy to understand how information is collected, used, and protected. Last updated ${lastUpdated}.`
    : `Read the latest ${companyName} privacy policy to understand how information is collected, used, and protected.`;

  const ogTitle =
    cleanTitle.toLowerCase() === "privacy policy"
      ? `${companyName} Privacy Policy`
      : `${companyName} — ${cleanTitle}`;

  return {
    title,
    description,
    keywords: [
      companyName,
      "privacy policy",
      "data privacy",
      "data protection",
      "legal policy",
      "privacy notice",
      "RentFlow360",
    ],
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description,
      url: canonical,
      siteName: DEFAULT_SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
    other: {
      "article:modified_time": record.updatedAt.toISOString(),
    },
  };
}

async function fetchPolicy(): Promise<Policy | null> {
  try {
    const policy = await prisma.policy.findFirst({
      include: { Section: true }, // keep if Prisma relation field is "Section"
      orderBy: { updatedAt: "desc" },
    });

    if (!policy) return null;

    return {
      id: policy.id,
      title: policy.title,
      companyName: policy.companyName,
      contactEmail: policy.contactEmail,
      privacyEmail: policy.privacyEmail,
      website: policy.website ?? undefined,
      mailingAddress: policy.mailingAddress ?? undefined,
      responseTime: policy.responseTime ?? undefined,
      inactiveAccountThreshold: policy.inactiveAccountThreshold ?? undefined,
      createdAt: policy.createdAt.toISOString(),
      updatedAt: policy.updatedAt.toISOString(),
      sections: (policy.Section ?? [])
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((section) => ({
          id: section.id,
          title: section.title,
          intro: section.intro ?? undefined,
          content:
            typeof section.content === "string"
              ? section.content
              : section.content != null
              ? String(section.content)
              : undefined,
        })),
    };
  } catch (error) {
    console.error("[PrivacyPolicyPage] Error fetching policy:", error);
    return null;
  }
}

export default async function PrivacyPolicyPage() {
  const policy = await fetchPolicy();

  const companyName = policy?.companyName || DEFAULT_SITE_NAME;
  const description = `Read the latest ${companyName} privacy policy to understand how information is collected, used, and protected.`;

  return (
    <div className="min-h-screen bg-background">
      <LegalPageJsonLd
        policyType="privacy"
        title={policy?.title}
        companyName={companyName}
        url={POLICY_PATH}
        description={description}
        datePublished={policy?.createdAt}
        dateModified={policy?.updatedAt}
        contactEmail={policy?.privacyEmail || policy?.contactEmail}
        siteUrl={process.env.NEXT_PUBLIC_SITE_URL}
      />

      <Navbar />
      <main>
        <PolicyPageClient policy={policy} />
      </main>
      <Footer />
    </div>
  );
}
