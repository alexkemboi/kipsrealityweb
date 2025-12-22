import { prisma } from "@/lib/db";
import { AboutUs } from "@/app/data/AboutUsData";

export interface HeroData {
    id: string;
    page: string;
    title: string;
    subtitle?: string;
    description?: string;
    imageUrl?: string;
    gradient?: string;
    buttonText?: string;
    buttonUrl?: string;
}

export interface CTAData {
    id: string;
    page: string;
    title: string;
    subtitle?: string;
    buttonText: string;
    buttonUrl: string;
    gradient?: string;
}

export const getAboutUsData = async (): Promise<AboutUs[]> => {
    try {
        const data = await prisma.aboutUs.findMany({
            orderBy: { createdAt: "asc" },
        });
        // Map to ensure it matches AboutUs interface if needed, or cast
        return (data as unknown as AboutUs[]) || [];
    } catch (error) {
        console.error("getAboutUsData error:", error);
        return [];
    }
};

export const getHeroSectionData = async (page: string = "about"): Promise<HeroData | null> => {
    try {
        const data = await prisma.heroSection.findFirst({
            where: { page },
        });
        return (data as unknown as HeroData) || null;
    } catch (error) {
        console.error("getHeroSectionData error:", error);
        return null;
    }
};

export const getCTAData = async (page: string = "about"): Promise<CTAData | null> => {
    try {
        const data = await prisma.cTA.findFirst({
            where: { page },
        });
        return (data as unknown as CTAData) || null;
    } catch (error) {
        console.error("getCTAData error:", error);
        return null;
    }
};
