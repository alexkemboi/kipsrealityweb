export const dynamic = "force-dynamic";

import { fetchCategories } from "@/lib/categories";
import Navbar from "@/components/Dashboard/Navbar/Navbar";
import Footer from "@/components/website/Footer";
import CategoryCards from "@/components/website/marketplace/CategoryMenuCards";
import Link from "next/link";

type CategoriesPageProps = {
  searchParams?: { q?: string };
};

type CategoryLike = {
  id?: string | number;
  name?: string;
  title?: string;
  label?: string;
  slug?: string;
  description?: string;
  [key: string]: any;
};

function getCategoryDisplayName(category: CategoryLike) {
  return String(category?.name || category?.title || category?.label || category?.slug || "Category");
}

function getSearchableText(category: CategoryLike) {
  return [
    category?.name,
    category?.title,
    category?.label,
    category?.slug,
    category?.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const rawQuery = (searchParams?.q ?? "").trim();
  const q = rawQuery.toLowerCase();

  let categories: CategoryLike[] = [];

  try {
    categories = (await fetchCategories()) ?? [];
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    categories = [];
  }

  const filteredCategories = q
    ? categories.filter((category) => getSearchableText(category).includes(q))
    : categories;

  // Derive featured chips from actual data (first 6 alphabetically)
  const featuredChips = [...categories]
    .map((c) => getCategoryDisplayName(c))
    .filter(Boolean)
    .filter((value, index, arr) => arr.findIndex((v) => v.toLowerCase() === value.toLowerCase()) === index)
    .sort((a, b) => a.localeCompare(b))
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative w-full overflow-hidden border-b bg-background">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-background" />
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-16 right-10 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />
        <div className="absolute bottom-8 left-8 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:36px_36px]" />

        <div className="relative mx-auto max-w-6xl px-6 py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs md:text-sm text-zinc-200 backdrop-blur">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Marketplace Categories
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Choose a category for your listing
            </h1>

            {/* Subtitle */}
            <p className="mt-4 text-sm leading-relaxed text-zinc-300 sm:text-base md:text-lg">
              Select the right category to help renters, buyers, and clients discover your listing faster.
            </p>

            {/* Search Form (server-friendly GET) */}
            <form
              method="GET"
              action="/marketplace/categories"
              className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
            >
              <div className="group flex w-full max-w-xl items-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur transition focus-within:border-primary/50 focus-within:bg-white/10 focus-within:ring-2 focus-within:ring-primary/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-2 h-4 w-4 shrink-0 text-zinc-400 transition group-focus-within:text-zinc-200"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>

                <input
                  type="text"
                  name="q"
                  defaultValue={rawQuery}
                  placeholder="Search categories..."
                  autoComplete="off"
                  className="w-full bg-transparent text-sm text-white placeholder:text-zinc-400 outline-none"
                  aria-label="Search categories"
                />

                {rawQuery && (
                  <Link
                    href="/marketplace/categories"
                    className="ml-2 rounded-md px-2 py-1 text-xs text-zinc-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    Clear
                  </Link>
                )}
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow transition hover:opacity-90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Browse Categories
              </button>
            </form>

            {/* Featured chips */}
            {featuredChips.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-zinc-400">Popular:</span>
                {featuredChips.map((chip) => (
                  <Link
                    key={chip}
                    href={`/marketplace/categories?q=${encodeURIComponent(chip)}`}
                    className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200 transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    {chip}
                  </Link>
                ))}
              </div>
            )}

            {/* Query status + count */}
            <div className="mt-4 flex flex-col items-center gap-2 text-sm">
              {rawQuery ? (
                <p className="text-zinc-300">
                  Showing results for{" "}
                  <span className="font-medium text-white">“{rawQuery}”</span>
                </p>
              ) : (
                <p className="text-zinc-400">Browse all available categories</p>
              )}

              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200">
                {filteredCategories.length} {filteredCategories.length === 1 ? "category" : "categories"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <main className="pb-10">
        {filteredCategories.length === 0 ? (
          <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm transition">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border bg-background">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5 text-muted-foreground"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>

              <h2 className="text-lg font-semibold text-foreground">No categories found</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a different keyword or clear the search to view all categories.
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <Link
                  href="/marketplace/categories"
                  className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  Clear Search
                </Link>

                {featuredChips.slice(0, 3).map((chip) => (
                  <Link
                    key={`empty-${chip}`}
                    href={`/marketplace/categories?q=${encodeURIComponent(chip)}`}
                    className="inline-flex items-center rounded-xl border px-3 py-2 text-sm transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    Try “{chip}”
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in-50 duration-300">
            <CategoryCards categories={filteredCategories} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
