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

async function getNavbarItems(): Promise<NavbarItem[]> {
  try {
    const items = await prisma.navbarItem.findMany({
      where: {
        isVisible: true,
        isAvailable: true,
        parentId: null, // Only fetch top-level items
      },
      include: {
        children: {
          where: {
            isVisible: true,
            isAvailable: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });
    return items;
  } catch (error) {
    console.error("Error fetching navbar items:", error);
    return [];
  }
}

export default async function Navbar() {
  const navLinks = await getNavbarItems();

  return <NavbarClient navLinks={navLinks} />;
}