"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Archive,
  BadgeCheck,
  BarChart3,
  Bell,
  BellRing,
  CalendarDays,
  Clock3,
  CreditCard,
  Eye,
  FileBarChart,
  FileEdit,
  Image as ImageIcon,
  Inbox,
  LayoutGrid,
  MessageSquare,
  NotebookPen,
  Plug,
  PlusSquare,
  Settings,
  Timer,
  TrendingUp,
  UserCog,
  Users,
  ArrowRight,
} from "lucide-react";

type MenuCard = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeTone?: "neutral" | "success" | "warning";
  featured?: boolean;
  ctaLabel?: string;
};

type MenuSection = {
  key: "listings" | "leads" | "performance" | "settings";
  title: string;
  subtitle: string;
  viewAllHref?: string;
  items: MenuCard[];
};

const sections: MenuSection[] = [
  {
    key: "listings",
    title: "Listings",
    subtitle: "Create and manage marketplace inventory.",
    viewAllHref: "/marketplace/listings",
    items: [
      {
        title: "Create New Listing",
        description:
          "Start a new listing with guided steps, media uploads, and category selection.",
        href: "/marketplace/create",
        icon: PlusSquare,
        featured: true,
        ctaLabel: "Create",
      },
      {
        title: "My Listings",
        description:
          "Review active, draft, and archived listings in one centralized workspace.",
        href: "/marketplace/listings",
        icon: LayoutGrid,
        ctaLabel: "Manage",
      },
      {
        title: "Draft Listings",
        description:
          "Continue unfinished listings and publish when details are ready.",
        href: "/marketplace/listings?status=draft",
        icon: FileEdit,
        badge: "Drafts",
        badgeTone: "neutral",
        ctaLabel: "Open",
      },
      {
        title: "Published Listings",
        description:
          "Monitor live listings currently visible in the marketplace.",
        href: "/marketplace/listings?status=published",
        icon: BadgeCheck,
        badge: "Live",
        badgeTone: "success",
        ctaLabel: "View",
      },
      {
        title: "Archived Listings",
        description:
          "Access older listings and restore or duplicate them when needed.",
        href: "/marketplace/listings?status=archived",
        icon: Archive,
        ctaLabel: "Browse",
      },
      {
        title: "Media & Photos",
        description:
          "Organize listing images and assets for faster publishing workflows.",
        href: "/marketplace/media",
        icon: ImageIcon,
        ctaLabel: "Manage",
      },
    ],
  },
  {
    key: "leads",
    title: "Leads",
    subtitle: "Manage inquiries, conversations, and follow-up workflow.",
    viewAllHref: "/marketplace/leads",
    items: [
      {
        title: "New Inquiries",
        description:
          "Review the latest inbound marketplace inquiries and respond quickly.",
        href: "/marketplace/leads/inquiries",
        icon: Inbox,
        badge: "New",
        badgeTone: "success",
        ctaLabel: "Review",
      },
      {
        title: "Messages",
        description:
          "Manage conversations with prospects and keep responses organized.",
        href: "/marketplace/messages",
        icon: MessageSquare,
        ctaLabel: "Open",
      },
      {
        title: "Saved Prospects",
        description:
          "Track qualified prospects you want to prioritize for outreach.",
        href: "/marketplace/leads/prospects",
        icon: Users,
        ctaLabel: "View",
      },
      {
        title: "Follow-Ups",
        description:
          "Stay on top of pending callbacks and next-step reminders.",
        href: "/marketplace/leads/follow-ups",
        icon: BellRing,
        badge: "Pending",
        badgeTone: "warning",
        ctaLabel: "Manage",
      },
      {
        title: "Appointments",
        description:
          "Coordinate showings, meetings, and listing-related appointments.",
        href: "/marketplace/leads/appointments",
        icon: CalendarDays,
        ctaLabel: "Schedule",
      },
      {
        title: "Lead Notes",
        description:
          "Capture notes and context for better follow-up and conversion.",
        href: "/marketplace/leads/notes",
        icon: NotebookPen,
        ctaLabel: "Open",
      },
    ],
  },
  {
    key: "performance",
    title: "Performance",
    subtitle: "Measure visibility, engagement, and conversion outcomes.",
    viewAllHref: "/marketplace/performance",
    items: [
      {
        title: "Listing Views",
        description:
          "Track listing impressions and page views across your marketplace inventory.",
        href: "/marketplace/performance/views",
        icon: Eye,
        ctaLabel: "Analyze",
      },
      {
        title: "Inquiry Conversion",
        description:
          "Measure how well listing traffic converts into qualified inquiries.",
        href: "/marketplace/performance/conversion",
        icon: TrendingUp,
        ctaLabel: "Analyze",
      },
      {
        title: "Top Listings",
        description:
          "See which listings perform best by engagement and inquiry volume.",
        href: "/marketplace/performance/top-listings",
        icon: BarChart3,
        ctaLabel: "View",
      },
      {
        title: "Response Time",
        description:
          "Monitor response speed to improve prospect experience and outcomes.",
        href: "/marketplace/performance/response-time",
        icon: Timer,
        ctaLabel: "Track",
      },
      {
        title: "Engagement Trends",
        description:
          "Review activity trends over time to optimize listing strategy.",
        href: "/marketplace/performance/engagement",
        icon: Activity,
        ctaLabel: "Explore",
      },
      {
        title: "Reports",
        description:
          "Export summary reports for your marketplace activity and performance.",
        href: "/marketplace/performance/reports",
        icon: FileBarChart,
        ctaLabel: "Export",
      },
    ],
  },
  {
    key: "settings",
    title: "Settings",
    subtitle: "Configure profile, preferences, and marketplace behavior.",
    viewAllHref: "/marketplace/settings",
    items: [
      {
        title: "Agent Profile",
        description:
          "Update your public agent profile details and marketplace presence.",
        href: "/marketplace/settings/profile",
        icon: UserCog,
        ctaLabel: "Edit",
      },
      {
        title: "Notifications",
        description:
          "Control alerts for inquiries, messages, and listing activity.",
        href: "/marketplace/settings/notifications",
        icon: Bell,
        ctaLabel: "Configure",
      },
      {
        title: "Availability",
        description:
          "Set working hours and appointment availability preferences.",
        href: "/marketplace/settings/availability",
        icon: Clock3,
        ctaLabel: "Update",
      },
      {
        title: "Billing",
        description:
          "Manage subscription details, invoices, and payment methods.",
        href: "/marketplace/settings/billing",
        icon: CreditCard,
        ctaLabel: "Manage",
      },
      {
        title: "Integrations",
        description:
          "Connect tools and services to streamline your listing workflow.",
        href: "/marketplace/settings/integrations",
        icon: Plug,
        badge: "Beta",
        badgeTone: "neutral",
        ctaLabel: "Connect",
      },
      {
        title: "Marketplace Settings",
        description:
          "Adjust listing defaults, preferences, and marketplace options.",
        href: "/marketplace/settings/marketplace",
        icon: Settings,
        ctaLabel: "Open",
      },
    ],
  },
];

function badgeToneClasses(tone: MenuCard["badgeTone"] = "neutral") {
  switch (tone) {
    case "success":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
    case "warning":
      return "border-amber-500/20 bg-amber-500/10 text-amber-400";
    case "neutral":
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

function MenuCardItem({ item }: { item: MenuCard }) {
  const Icon = item.icon;

  const baseCardClass =
    "group relative flex min-h-[140px] flex-col rounded-2xl border border-border bg-card/80 p-4 md:p-5 shadow-sm backdrop-blur-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md hover:border-primary/30 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

  const featuredCardClass =
    "group relative flex min-h-[180px] flex-col rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-card/80 p-5 md:p-6 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md hover:border-primary/40 sm:col-span-2 xl:col-span-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

  return (
    <Link
      href={item.href}
      className={item.featured ? featuredCardClass : baseCardClass}
      aria-label={item.title}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-200 transition group-hover:bg-primary/10 group-hover:text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>

        {item.badge ? (
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${badgeToneClasses(
              item.badgeTone
            )}`}
          >
            {item.badge}
          </span>
        ) : null}
      </div>

      {/* Body */}
      <div className="mt-4">
        <h4 className="text-base font-semibold tracking-tight text-foreground">
          {item.title}
        </h4>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {item.description}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
          <span>{item.ctaLabel ?? "Open"}</span>
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>
      </div>
    </Link>
  );
}

function MenuSectionBlock({ section }: { section: MenuSection }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-base font-semibold tracking-tight md:text-lg">
            {section.title}
          </h3>
          <p className="text-sm text-muted-foreground">{section.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">
            {section.items.length} tools
          </p>
          {section.viewAllHref ? (
            <Link
              href={section.viewAllHref}
              className="rounded text-xs text-primary transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              View all
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {section.items.map((item) => (
          <MenuCardItem key={`${section.key}-${item.title}`} item={item} />
        ))}
      </div>
    </section>
  );
}

export default function AgentMenuCards() {
  return (
    <div className="space-y-8 md:space-y-10">
      {sections.map((section) => (
        <MenuSectionBlock key={section.key} section={section} />
      ))}
    </div>
  );
}
