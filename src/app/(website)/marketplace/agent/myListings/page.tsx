"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Image as ImageIcon,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  SquarePen,
  Trash2,
  Archive,
  Upload,
} from "lucide-react";

export type ListingStatus = "draft" | "published" | "pending" | "archived" | "rejected";
export type ListingType = "property" | "asset" | "service";

export type ListingItem = {
  id: string;
  title: string;
  category: string;
  type?: ListingType;
  status: ListingStatus;
  price?: number | null;
  currency?: string; // e.g. USD
  location?: string;
  thumbnailUrl?: string | null;
  views?: number;
  inquiries?: number;
  updatedAt: string; // ISO string
  createdAt?: string; // ISO string
  slug?: string;
  featured?: boolean;
};

type MyListingsProps = {
  listings: ListingItem[];
  categories?: string[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
  className?: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function formatRelativeDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "—";
  const now = Date.now();
  const diffMs = now - d;
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

function formatCurrency(value?: number | null, currency = "USD") {
  if (value === null || value === undefined) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value}`;
  }
}

function statusBadgeClasses(status: ListingStatus) {
  switch (status) {
    case "published":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
    case "draft":
      return "border-slate-500/20 bg-slate-500/10 text-slate-400";
    case "pending":
      return "border-amber-500/20 bg-amber-500/10 text-amber-400";
    case "archived":
      return "border-zinc-500/20 bg-zinc-500/10 text-zinc-400";
    case "rejected":
      return "border-rose-500/20 bg-rose-500/10 text-rose-400";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

function prettyStatus(status: ListingStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function MyListings({
  listings,
  categories,
  totalCount,
  page = 1,
  pageSize = 10,
  className,
}: MyListingsProps) {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<"all" | ListingStatus>("all");
  const [category, setCategory] = React.useState("all");
  const [sort, setSort] = React.useState<
    "updated_desc" | "updated_asc" | "created_desc" | "created_asc" | "title_asc" | "title_desc" | "views_desc"
  >("updated_desc");

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const resolvedCategories = React.useMemo(() => {
    if (categories?.length) return categories;
    return Array.from(new Set(listings.map((l) => l.category).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [categories, listings]);

  const counts = React.useMemo(() => {
    return {
      all: listings.length,
      published: listings.filter((l) => l.status === "published").length,
      draft: listings.filter((l) => l.status === "draft").length,
      pending: listings.filter((l) => l.status === "pending").length,
      archived: listings.filter((l) => l.status === "archived").length,
      rejected: listings.filter((l) => l.status === "rejected").length,
    };
  }, [listings]);

  const filtered = React.useMemo(() => {
    let next = [...listings];

    if (status !== "all") {
      next = next.filter((l) => l.status === status);
    }

    if (category !== "all") {
      next = next.filter((l) => l.category.toLowerCase() === category.toLowerCase());
    }

    const q = query.trim().toLowerCase();
    if (q) {
      next = next.filter((l) => {
        const haystack = [
          l.title,
          l.category,
          l.location,
          l.id,
          l.slug,
          l.type,
          l.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(q);
      });
    }

    next.sort((a, b) => {
      switch (sort) {
        case "updated_asc":
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case "created_desc":
          return new Date(b.createdAt ?? b.updatedAt).getTime() - new Date(a.createdAt ?? a.updatedAt).getTime();
        case "created_asc":
          return new Date(a.createdAt ?? a.updatedAt).getTime() - new Date(b.createdAt ?? b.updatedAt).getTime();
        case "title_asc":
          return a.title.localeCompare(b.title);
        case "title_desc":
          return b.title.localeCompare(a.title);
        case "views_desc":
          return (b.views ?? 0) - (a.views ?? 0);
        case "updated_desc":
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return next;
  }, [listings, status, category, query, sort]);

  const effectiveTotal = totalCount ?? listings.length;

  // Client-side pagination for demo/prototype (can be replaced by server-side paging)
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const [currentPage, setCurrentPage] = React.useState(Math.min(Math.max(1, page), totalPages));

  React.useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paged = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const pageStart = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, filtered.length);

  const allVisibleSelected = paged.length > 0 && paged.every((l) => selectedIds.has(l.id));
  const someVisibleSelected = paged.some((l) => selectedIds.has(l.id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        paged.forEach((l) => next.delete(l.id));
      } else {
        paged.forEach((l) => next.add(l.id));
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const selectedCount = selectedIds.size;

  const summary = React.useMemo(() => {
    const totalViews = listings.reduce((sum, l) => sum + (l.views ?? 0), 0);
    const totalInquiries = listings.reduce((sum, l) => sum + (l.inquiries ?? 0), 0);
    return {
      totalListings: listings.length,
      published: counts.published,
      drafts: counts.draft,
      inquiries: totalInquiries,
      totalViews,
    };
  }, [listings, counts]);

  return (
    <div className={cn("space-y-5 md:space-y-6", className)}>
      {/* Top toolbar */}
      <div className="rounded-2xl border bg-card p-4 md:p-5 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">My Listings</h3>
              <p className="text-sm text-muted-foreground">
                {effectiveTotal} total • {counts.published} published • {counts.draft} drafts
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  // placeholder refresh action
                  // replace with router.refresh() if used in a parent client wrapper
                }}
                className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
                Refresh
              </button>

              <Link
                href="/marketplace/listings/export"
                className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <Upload className="h-4 w-4" aria-hidden="true" />
                Export
              </Link>

              <Link
                href="/marketplace/create"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create Listing
              </Link>
            </div>
          </div>

          {/* Quick summary cards */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <SummaryCard label="Total Listings" value={summary.totalListings} />
            <SummaryCard label="Published" value={summary.published} />
            <SummaryCard label="Drafts" value={summary.drafts} />
            <SummaryCard label="Total Inquiries" value={summary.inquiries} />
          </div>
        </div>
      </div>

      {/* Status tabs */}
      <div className="rounded-2xl border bg-card p-3 md:p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <StatusTab active={status === "all"} onClick={() => { setStatus("all"); setCurrentPage(1); }}>
            All ({counts.all})
          </StatusTab>
          <StatusTab active={status === "published"} onClick={() => { setStatus("published"); setCurrentPage(1); }}>
            Published ({counts.published})
          </StatusTab>
          <StatusTab active={status === "draft"} onClick={() => { setStatus("draft"); setCurrentPage(1); }}>
            Drafts ({counts.draft})
          </StatusTab>
          <StatusTab active={status === "pending"} onClick={() => { setStatus("pending"); setCurrentPage(1); }}>
            Pending ({counts.pending})
          </StatusTab>
          <StatusTab active={status === "archived"} onClick={() => { setStatus("archived"); setCurrentPage(1); }}>
            Archived ({counts.archived})
          </StatusTab>
          {counts.rejected > 0 && (
            <StatusTab active={status === "rejected"} onClick={() => { setStatus("rejected"); setCurrentPage(1); }}>
              Rejected ({counts.rejected})
            </StatusTab>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border bg-card p-4 md:p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="group flex h-10 w-full items-center rounded-xl border bg-background px-3 transition focus-within:ring-2 focus-within:ring-primary/40 sm:max-w-md">
              <Search className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by title, category, location, listing ID..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                aria-label="Search listings"
              />
            </div>

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 rounded-xl border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {resolvedCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as typeof sort);
                setCurrentPage(1);
              }}
              className="h-10 rounded-xl border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label="Sort listings"
            >
              <option value="updated_desc">Last Updated (Newest)</option>
              <option value="updated_asc">Last Updated (Oldest)</option>
              <option value="created_desc">Created (Newest)</option>
              <option value="created_asc">Created (Oldest)</option>
              <option value="title_asc">A–Z</option>
              <option value="title_desc">Z–A</option>
              <option value="views_desc">Most Viewed</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center rounded-full border px-3 py-1">
              {filtered.length} result{filtered.length === 1 ? "" : "s"}
            </span>
            {(query || category !== "all" || status !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  setStatus("all");
                  setCurrentPage(1);
                }}
                className="rounded-lg border px-3 py-1 text-xs font-medium transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedCount > 0 && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 md:p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              <span className="font-medium">{selectedCount}</span> listing{selectedCount === 1 ? "" : "s"} selected
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded-lg border px-3 py-1.5 text-sm transition hover:bg-accent hover:text-accent-foreground"
              >
                Publish
              </button>
              <button
                type="button"
                className="rounded-lg border px-3 py-1.5 text-sm transition hover:bg-accent hover:text-accent-foreground"
              >
                Archive
              </button>
              <button
                type="button"
                className="rounded-lg border px-3 py-1.5 text-sm text-rose-500 transition hover:bg-rose-500/10"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-lg border px-3 py-1.5 text-sm transition hover:bg-accent hover:text-accent-foreground"
              >
                Clear selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {filtered.length === 0 ? (
        <EmptyState hasFilters={Boolean(query || category !== "all" || status !== "all")} />
      ) : (
        <>
          {/* Desktop/table-like rows */}
          <div className="hidden md:block">
            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="mb-3 grid grid-cols-[36px_minmax(260px,2fr)_120px_140px_160px_140px_120px_120px] gap-3 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = !allVisibleSelected && someVisibleSelected;
                    }}
                    onChange={toggleSelectAllVisible}
                    aria-label="Select all visible listings"
                    className="h-4 w-4 rounded border"
                  />
                </div>
                <div>Listing</div>
                <div>Status</div>
                <div>Price / Type</div>
                <div>Location</div>
                <div>Performance</div>
                <div>Updated</div>
                <div className="text-right">Actions</div>
              </div>

              <div className="space-y-3">
                {paged.map((listing) => (
                  <DesktopRow
                    key={listing.id}
                    listing={listing}
                    selected={selectedIds.has(listing.id)}
                    onToggleSelect={() => toggleSelect(listing.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {paged.map((listing) => (
              <MobileCard
                key={listing.id}
                listing={listing}
                selected={selectedIds.has(listing.id)}
                onToggleSelect={() => toggleSelect(listing.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {pageStart}–{pageEnd} of {filtered.length}
            </p>

            <div className="flex items-center gap-2">
              <label className="mr-1 text-xs text-muted-foreground" htmlFor="pageSize">
                Rows
              </label>
              <select
                id="pageSize"
                value={pageSize}
                disabled
                className="h-9 rounded-lg border bg-background px-2 text-sm opacity-70"
                aria-label="Rows per page"
                title="Pass a different pageSize prop to change this"
              >
                <option value={pageSize}>{pageSize}</option>
              </select>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="px-2 text-sm">
                Page {currentPage} of {totalPages}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-background/70 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function StatusTab({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-xl px-3 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        active
          ? "bg-primary text-primary-foreground"
          : "border bg-background hover:bg-accent hover:text-accent-foreground"
      )}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

function DesktopRow({
  listing,
  selected,
  onToggleSelect,
}: {
  listing: ListingItem;
  selected: boolean;
  onToggleSelect: () => void;
}) {
  return (
    <div className="rounded-xl border bg-card px-4 py-3 shadow-sm transition hover:border-primary/20 hover:shadow-md">
      <div className="grid grid-cols-[36px_minmax(260px,2fr)_120px_140px_160px_140px_120px_120px] items-center gap-3">
        {/* Select */}
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            aria-label={`Select ${listing.title}`}
            className="h-4 w-4 rounded border"
          />
        </div>

        {/* Listing summary */}
        <div className="flex min-w-0 items-center gap-3">
          <Thumbnail listing={listing} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold">{listing.title}</p>
              {listing.featured && (
                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  Featured
                </span>
              )}
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {listing.category} • ID: {listing.id}
            </p>
          </div>
        </div>

        {/* Status */}
        <div>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
              statusBadgeClasses(listing.status)
            )}
          >
            {prettyStatus(listing.status)}
          </span>
        </div>

        {/* Price / type */}
        <div className="text-sm">
          <p className="font-medium">{formatCurrency(listing.price, listing.currency ?? "USD")}</p>
          <p className="text-xs capitalize text-muted-foreground">{listing.type ?? "—"}</p>
        </div>

        {/* Location */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-sm">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="truncate">{listing.location || "—"}</span>
          </div>
        </div>

        {/* Performance */}
        <div className="text-sm">
          <p className="flex items-center gap-1 text-muted-foreground">
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{listing.views ?? 0}</span>
          </p>
          <p className="text-xs text-muted-foreground">{listing.inquiries ?? 0} inquiries</p>
        </div>

        {/* Updated */}
        <div className="text-sm">
          <p>{formatRelativeDate(listing.updatedAt)}</p>
          <p className="text-xs text-muted-foreground">{formatDate(listing.updatedAt)}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-1">
          <ActionLink href={`/marketplace/listings/${listing.slug ?? listing.id}/edit`} label="Edit">
            <Pencil className="h-4 w-4" />
          </ActionLink>
          <ActionLink href={`/marketplace/listings/${listing.slug ?? listing.id}`} label="Preview">
            <Eye className="h-4 w-4" />
          </ActionLink>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label={`More actions for ${listing.title}`}
            title="More actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MobileCard({
  listing,
  selected,
  onToggleSelect,
}: {
  listing: ListingItem;
  selected: boolean;
  onToggleSelect: () => void;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="pt-1">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            aria-label={`Select ${listing.title}`}
            className="h-4 w-4 rounded border"
          />
        </div>

        <Thumbnail listing={listing} size="mobile" />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{listing.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {listing.category} • ID: {listing.id}
              </p>
            </div>

            <span
              className={cn(
                "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
                statusBadgeClasses(listing.status)
              )}
            >
              {prettyStatus(listing.status)}
            </span>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border bg-background/60 p-2">
              <p className="text-muted-foreground">Price</p>
              <p className="mt-0.5 text-sm font-medium">
                {formatCurrency(listing.price, listing.currency ?? "USD")}
              </p>
              <p className="capitalize text-muted-foreground">{listing.type ?? "—"}</p>
            </div>

            <div className="rounded-lg border bg-background/60 p-2">
              <p className="text-muted-foreground">Performance</p>
              <p className="mt-0.5 text-sm font-medium">{listing.views ?? 0} views</p>
              <p className="text-muted-foreground">{listing.inquiries ?? 0} inquiries</p>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{listing.location || "—"}</span>
          </div>

          <div className="mt-1 text-xs text-muted-foreground">
            Updated {formatRelativeDate(listing.updatedAt)}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <ActionLink
              href={`/marketplace/listings/${listing.slug ?? listing.id}/edit`}
              label={`Edit ${listing.title}`}
              compact
            >
              <SquarePen className="h-4 w-4" />
            </ActionLink>
            <ActionLink
              href={`/marketplace/listings/${listing.slug ?? listing.id}`}
              label={`Preview ${listing.title}`}
              compact
            >
              <Eye className="h-4 w-4" />
            </ActionLink>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label={`More actions for ${listing.title}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Thumbnail({
  listing,
  size = "desktop",
}: {
  listing: ListingItem;
  size?: "desktop" | "mobile";
}) {
  const classes =
    size === "mobile"
      ? "h-14 w-14 rounded-lg"
      : "h-14 w-14 rounded-lg";

  if (listing.thumbnailUrl) {
    // Using native img to keep this component drop-in and avoid next/image config constraints.
    return (
      <img
        src={listing.thumbnailUrl}
        alt={listing.title}
        className={cn(classes, "shrink-0 border object-cover")}
        loading="lazy"
      />
    );
  }

  return (
    <div className={cn(classes, "flex shrink-0 items-center justify-center border bg-background text-muted-foreground")}>
      <ImageIcon className="h-5 w-5" aria-hidden="true" />
    </div>
  );
}

function ActionLink({
  href,
  children,
  label,
  compact = false,
}: {
  href: string;
  children: React.ReactNode;
  label: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center rounded-lg border transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        compact ? "h-9 w-9" : "h-8 w-8"
      )}
    >
      {children}
    </Link>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
      <div className="mx-auto max-w-2xl rounded-xl border border-dashed bg-background/50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border bg-background">
          {hasFilters ? (
            <Search className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          ) : (
            <Archive className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          )}
        </div>

        <h3 className="text-lg font-semibold">
          {hasFilters ? "No listings match your filters" : "No listings yet"}
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          {hasFilters
            ? "Try a different keyword, switch status tabs, or clear your filters."
            : "Create your first listing to start managing marketplace inventory and inquiries."}
        </p>

        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          {hasFilters ? (
            <Link
              href="#"
              onClick={(e) => e.preventDefault()}
              className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-accent hover:text-accent-foreground"
            >
              Adjust Filters
            </Link>
          ) : (
            <Link
              href="/marketplace/create"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Create First Listing
            </Link>
          )}

          <Link
            href="/marketplace/categories"
            className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-accent hover:text-accent-foreground"
          >
            Browse Categories
          </Link>
        </div>
      </div>
    </div>
  );
}


export const mockListings: ListingItem[] = [
  {
    id: "LST-1001",
    title: "2BR Apartment in Bothell Downtown",
    category: "Property",
    type: "property",
    status: "published",
    price: 2450,
    currency: "USD",
    location: "Bothell, WA",
    thumbnailUrl: null,
    views: 324,
    inquiries: 12,
    updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    slug: "2br-apartment-bothell-downtown",
    featured: true,
  },
  {
    id: "LST-1002",
    title: "Commercial Cleaning Service Package",
    category: "Service",
    type: "service",
    status: "draft",
    price: 600,
    currency: "USD",
    location: "Seattle, WA",
    thumbnailUrl: null,
    views: 14,
    inquiries: 1,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    slug: "commercial-cleaning-service-package",
  },
  {
    id: "LST-1003",
    title: "Office Desk Set (Like New)",
    category: "Asset",
    type: "asset",
    status: "pending",
    price: 350,
    currency: "USD",
    location: "Bellevue, WA",
    thumbnailUrl: null,
    views: 89,
    inquiries: 4,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    slug: "office-desk-set-like-new",
  },
  {
    id: "LST-1004",
    title: "Studio Unit Near Transit",
    category: "Property",
    type: "property",
    status: "archived",
    price: 1750,
    currency: "USD",
    location: "Lynnwood, WA",
    thumbnailUrl: null,
    views: 211,
    inquiries: 9,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    slug: "studio-unit-near-transit",
  },
];
