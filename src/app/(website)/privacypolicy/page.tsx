import Navbar from "@/components/website/Navbar";
import Footer from "@/components/website/Footer";
import PolicyPageClient, { Policy } from "./PolicyPageClient";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function fetchPolicy(): Promise<Policy | null> {
  try {
    // Get only the most recent policy
    const policy = await prisma.policy.findFirst({
      include: { Section: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (!policy) return null;

    // Map Section to sections for frontend compatibility
    return {
      id: policy.id,
      title: policy.title,
      companyName: policy.companyName,
      contactEmail: policy.contactEmail,
      privacyEmail: policy.privacyEmail,
      website: policy.website || undefined,
      mailingAddress: policy.mailingAddress || undefined,
      responseTime: policy.responseTime || undefined,
      inactiveAccountThreshold: policy.inactiveAccountThreshold || undefined,
      createdAt: policy.createdAt.toISOString(),
      updatedAt: policy.updatedAt.toISOString(),
      sections: (policy.Section || [])
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((section) => ({
          id: section.id,
          title: section.title,
          intro: section.intro || undefined,
          content: typeof section.content === 'string' ? section.content : section.content ? String(section.content) : undefined,
        })),
    };
  } catch (error) {
    console.error("Error fetching policy:", error);
    return null;
  }
}

export default async function PolicyListPage() {
  const policy = await fetchPolicy();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <PolicyPageClient policy={policy} />
      <Footer />
    </div>
  );
}
