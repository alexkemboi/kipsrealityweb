"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, FileText, Link as LinkIcon, Search, X } from "lucide-react";
import dynamic from "next/dynamic";

const Markdown = dynamic(() => import("@uiw/react-markdown-preview"), { ssr: false });

export interface Section {
  id: number;
  title: string;
  intro?: string;
  content?: string;
}

export interface Policy {
  id: number;
  title: string;
  companyName: string;
  contactEmail: string;
  privacyEmail: string;
  website?: string;
  mailingAddress?: string;
  responseTime?: string;
  inactiveAccountThreshold?: string;
  createdAt: string;
  updatedAt: string;
  sections: Section[];
}

interface PolicyPageClientProps {
  policy: Policy | null;
}

type ExpandedMap = Record<string, boolean>;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function PolicyPageClient({ policy }: PolicyPageClientProps) {
  const [expandedSections, setExpandedSections] = useState<ExpandedMap>({});
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);

  if (!policy) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="rounded-2xl border bg-card p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border bg-background text-muted-foreground">
              <FileText className="h-6 w-6" />
            </div>
            <p className="text-muted-foreground">No privacy policy found.</p>
          </div>
        </div>
      </div>
    );
  }

  const replacePlaceholders = (text: string) =>
    (text || "")
      .replace(/{companyName}/g, policy.companyName)
      .replace(/{contactEmail}/g, policy.contactEmail)
      .replace(/{privacyEmail}/g, policy.privacyEmail)
      .replace(/{responseTime}/g, policy.responseTime || "")
      .replace(/{inactiveAccountThreshold}/g, policy.inactiveAccountThreshold || "");

  const sectionsWithIndex = useMemo(
    () => policy.sections.map((s, idx) => ({ ...s, originalIndex: idx })),
    [policy.sections]
  );

  const filteredSections = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return sectionsWithIndex;

    return sectionsWithIndex.filter((s) => {
      const haystack = [
        replacePlaceholders(s.title),
        replacePlaceholders(s.intro || ""),
        replacePlaceholders(s.content || ""),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [searchTerm, sectionsWithIndex]);

  useEffect(() => {
    const term = searchTerm.trim();
    if (!term) return;

    setExpandedSections((prev) => {
      const next: ExpandedMap = { ...prev };
      filteredSections.forEach((s) => {
        next[String(s.id)] = true;
      });
      return next;
    });
  }, [searchTerm, filteredSections]);

  const expandAll = () => {
    const next: ExpandedMap = {};
    filteredSections.forEach((s) => (next[String(s.id)] = true));
    setExpandedSections(next);
  };

  const collapseAll = () => setExpandedSections({});

  const toggleSection = (sectionId: number) => {
    const key = String(sectionId);
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copySectionLink = async (sectionId: number) => {
    const url = `${window.location.origin}${window.location.pathname}#section-${sectionId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch (e) {
      console.error("Failed to copy link", e);
    }
  };

  const tocSections = filteredSections.length ? filteredSections : sectionsWithIndex;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero */}
      <section className="relative w-full overflow-hidden border-b bg-background">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-background" />
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:36px_36px]" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide uppercase text-zinc-200 backdrop-blur">
                Legal
              </span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide uppercase text-zinc-200 backdrop-blur">
                Privacy
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              {policy.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-zinc-300">
              <div className="inline-flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <FileText className="h-4 w-4 text-zinc-200" />
                </span>
                <span>
                  Last updated:{" "}
                  <span className="font-semibold text-white">{formatDate(policy.updatedAt)}</span>
                </span>
              </div>

              <span className="hidden sm:block h-1 w-1 rounded-full bg-zinc-500" />

              <div className="inline-flex items-center gap-2">
                <span>Contact:</span>
                <a
                  href={`mailto:${policy.contactEmail}`}
                  className="font-medium text-white underline underline-offset-4 decoration-white/30 hover:decoration-white"
                >
                  {policy.contactEmail}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Search + TOC */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden mb-10">
          <div className="p-6 md:p-8 space-y-8">
            {/* Search */}
            <div className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold">Find a section</h2>
                  <p className="text-sm text-muted-foreground">
                    Search titles and content ({filteredSections.length} result
                    {filteredSections.length === 1 ? "" : "s"})
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={expandAll}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    Expand all
                  </button>
                  <button
                    type="button"
                    onClick={collapseAll}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    Collapse all
                  </button>
                </div>
              </div>

              <div className="group flex items-center rounded-xl border bg-background px-4 py-3 transition focus-within:ring-2 focus-within:ring-primary/40">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  ref={searchRef}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search sections..."
                  className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  aria-label="Search policy sections"
                />
                {searchTerm ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      searchRef.current?.focus();
                    }}
                    className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-lg border transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>

            {/* TOC */}
            {tocSections.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Table of Contents
                  </p>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {tocSections.map((section) => (
                    <a
                      key={section.id}
                      href={`#section-${section.id}`}
                      className="group flex items-start gap-3 rounded-xl border bg-background/40 p-3 transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border bg-background text-xs font-bold text-primary">
                        {section.originalIndex + 1}
                      </span>
                      <span className="text-sm font-medium leading-tight text-foreground/80 group-hover:text-foreground">
                        {replacePlaceholders(section.title)}
                      </span>
                    </a>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {filteredSections.map((section) => {
            const key = String(section.id);
            const isExpanded = Boolean(expandedSections[key]);

            return (
              <article
                key={section.id}
                id={`section-${section.id}`}
                className="group rounded-2xl border bg-card shadow-sm transition hover:shadow-md scroll-mt-28 overflow-hidden"
              >
                <div className="flex items-start gap-3 px-5 md:px-6 py-5">
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className="flex-1 text-left"
                  >
                    <div className="flex items-start gap-4">
                      <span className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-background text-primary font-bold">
                        {section.originalIndex + 1}
                      </span>

                      <div className="min-w-0">
                        <h3 className="text-lg md:text-xl font-semibold tracking-tight text-foreground">
                          <span className="sm:hidden mr-2 text-primary font-bold">
                            {section.originalIndex + 1}.
                          </span>
                          {replacePlaceholders(section.title)}
                        </h3>

                        {section.intro ? (
                          <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-3xl">
                            {replacePlaceholders(section.intro)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copySectionLink(section.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-background transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      aria-label="Copy section link"
                      title="Copy section link"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className={cn(
                        "inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-background transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                        isExpanded && "bg-accent"
                      )}
                      aria-label={isExpanded ? "Collapse section" : "Expand section"}
                      title={isExpanded ? "Collapse" : "Expand"}
                    >
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </button>
                  </div>
                </div>

                <div
                  className={cn(
                    "px-5 md:px-6 transition-all duration-300 ease-in-out",
                    isExpanded ? "max-h-[8000px] opacity-100 pb-6" : "max-h-0 opacity-0 overflow-hidden"
                  )}
                >
                  <div className="border-t pt-5">
                    <div
                      data-color-mode="light"
                      className="prose prose-zinc max-w-none dark:prose-invert"
                    >
                      <Markdown source={replacePlaceholders(section.content || "")} />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* No results */}
        {filteredSections.length === 0 && (
          <div className="rounded-2xl border bg-card p-10 text-center shadow-sm mt-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border bg-background text-muted-foreground">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">No results found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We couldn’t find any sections matching “{searchTerm}”.
            </p>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  searchRef.current?.focus();
                }}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Clear search
              </button>
            </div>
          </div>
        )}

        <div className="h-10" />
      </div>
    </div>
  );
}
