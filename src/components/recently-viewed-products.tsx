
"use client"

import { useRecentlyViewed } from "@/contexts/recently-viewed-context";
import { getProducts } from "@/services/productService";
import { ProductCarousel } from "./product-carousel";
import { Product } from "@/lib/types";
import { useEffect, useState, useMemo } from "react";

interface RecentlyViewedProductsProps {
    currentProductId?: string;
}

export function RecentlyViewedProducts({ currentProductId }: RecentlyViewedProductsProps) {
  const { recentlyViewedItems } = useRecentlyViewed();
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchAllProducts = async () => {
        try {
            const products = await getProducts();
            setAllProducts(products);
        } catch (error) {
            console.error("Failed to fetch all products for recently viewed:", error);
        }
    }
    fetchAllProducts();
  }, []); // Empty dependency array ensures this runs only once on mount

  const recentlyViewedProducts = useMemo(() => {
    if (recentlyViewedItems.length > 0 && allProducts.length > 0) {
        // Create a map for quick lookups
        const productMap = new Map(allProducts.map(p => [p.id, p]));
        return recentlyViewedItems
          .filter(id => id !== currentProductId)
          .map(id => productMap.get(id))
          .filter((p): p is Product => Boolean(p));
      }
      return [];
  }, [recentlyViewedItems, allProducts, currentProductId]);

  if (recentlyViewedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
        <ProductCarousel 
            products={recentlyViewedProducts} 
            title="Recently Viewed"
            subtitle="Items you've looked at"
        />
    </div>
  );
}
