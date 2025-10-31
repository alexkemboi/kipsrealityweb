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

// Server Component - Fetch navbar items on the server
async function getNavbarItems(): Promise<NavbarItem[]> {
  try {
    const items = await prisma.navbarItem.findMany({
      where: {
        isVisible: true,
        isAvailable: true,
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