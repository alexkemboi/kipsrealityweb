"use client";

import { useCallback, useEffect, useState } from "react";

export interface MarketplaceCategory {
  id: string | number;
  name?: string | null;
  title?: string | null;
  slug?: string | null;
  createdAt?: string | Date | null;
  [key: string]: unknown;
}

interface UseMarketplaceCategoriesResult {
  categories: MarketplaceCategory[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMarketplaceCategories(): UseMarketplaceCategoriesResult {
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/marketplace/categories", {
        method: "GET",
        cache: "no-store",
        signal,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const data: unknown = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid categories response");
      }

      setCategories(data as MarketplaceCategory[]);
    } catch (err: unknown) {
      // Ignore abort errors
      if (err instanceof DOMException && err.name === "AbortError") return;

      const message =
        err instanceof Error ? err.message : "Failed to load categories";

      setError(message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchCategories(controller.signal);

    return () => controller.abort();
  }, [fetchCategories]);

  const refetch = useCallback(async () => {
    await fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch };
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (err) {
    console.error("[GET /api/categories]", err);
    return NextResponse.json(
      { error: "Failed to load categories" },
      { status: 500 }
    );
  }
}
