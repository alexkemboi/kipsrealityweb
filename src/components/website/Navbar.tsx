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

let navbarCache: { expiresAt: number; data: NavbarItem[] } | null = null
const NAVBAR_CACHE_TTL = 30 * 1000 // 30 seconds

async function getNavbarItems(): Promise<NavbarItem[]> {
  const now = Date.now()
  if (navbarCache && navbarCache.expiresAt > now) {
    return navbarCache.data
  }

  try {

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
      name: i.name === "Service" ? "Services" : i.name,
      href: i.href,
      order: i.order,
      isVisible: i.isVisible,
      isAvailable: i.isAvailable,
    }));

    // Attach children if present 
    const itemsWithChildren = raw.map((i: any) => ({
      id: i.id,
      name: i.name === "Service" ? "Services" : i.name,
      href: i.href,
      order: i.order,
      isVisible: i.isVisible,
      isAvailable: i.isAvailable,
      children: i.children?.map((c: any) => ({
        id: c.id,
        name: c.name === "Service" ? "Services" : c.name,
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