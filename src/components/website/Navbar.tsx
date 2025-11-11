import { NavbarClient } from "./NavbarClient";
import { prisma } from "@/lib/db"; 

interface NavbarItem {
  id: number;
  name: string;
  href: string;
  order: number;
  isVisible: boolean;
  isAvailable: boolean;
}

// Simple in-memory cache to avoid exhausting DB connection pool from frequent SSR calls
let navbarCache: { expiresAt: number; data: NavbarItem[] } | null = null
const NAVBAR_CACHE_TTL = 30 * 1000 // 30 seconds

async function getNavbarItems(): Promise<NavbarItem[]> {
  const now = Date.now()
  if (navbarCache && navbarCache.expiresAt > now) {
    return navbarCache.data
  }

  try {
    // Fetch top-level items and their children. Avoid mixing `select` at the same
    // level as `include` to prevent Prisma query errors; map the result to the
    // shape we need afterwards.
    const raw = await prisma.navbarItem.findMany({
      where: {
        isVisible: true,
        isAvailable: true,
        parentId: null,
      },
      include: {
        children: {
          where: { isVisible: true, isAvailable: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    const items: NavbarItem[] = raw.map((i: any) => ({
      id: i.id,
      name: i.name,
      href: i.href,
      order: i.order,
      isVisible: i.isVisible,
      isAvailable: i.isAvailable,
    }));

    // Attach children if present (map to same NavbarItem type)
    const itemsWithChildren = raw.map((i: any) => ({
      id: i.id,
      name: i.name,
      href: i.href,
      order: i.order,
      isVisible: i.isVisible,
      isAvailable: i.isAvailable,
      children: i.children?.map((c: any) => ({
        id: c.id,
        name: c.name,
        href: c.href,
        order: c.order,
        isVisible: c.isVisible,
        isAvailable: c.isAvailable,
        parentId: c.parentId,
      })) || [],
    })) as unknown as NavbarItem[];

    // Cache result
    navbarCache = { expiresAt: now + NAVBAR_CACHE_TTL, data: itemsWithChildren };
    return itemsWithChildren;
  } catch (error) {
    console.error("Error fetching navbar items:", error);
    return [];
  }
}

export default async function Navbar() {
  const navLinks = await getNavbarItems();

  return <NavbarClient navLinks={navLinks} />;
}