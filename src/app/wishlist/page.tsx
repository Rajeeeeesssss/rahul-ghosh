
"use client"

import { useWishlist } from "@/contexts/wishlist-context";
import { getProduct } from "@/services/productService";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeartCrack } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const ProductGridSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        ))}
    </div>
);

export default function WishlistPage() {
  const { wishlistItems } = useWishlist();
  const [wishlistedProducts, setWishlistedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistedProducts = async () => {
        setLoading(true);
        try {
            const productPromises = wishlistItems.map(id => getProduct(id));
            const products = await Promise.all(productPromises);
            setWishlistedProducts(products.filter((p): p is Product => Boolean(p)));
        } catch (error) {
            console.error("Failed to fetch wishlisted products:", error);
        } finally {
            setLoading(false);
        }
    }
    fetchWishlistedProducts();
  }, [wishlistItems])

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Your Wishlist</h1>
      {loading ? (
        <ProductGridSkeleton />
      ) : wishlistedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <HeartCrack className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Your wishlist is empty</h2>
          <p className="mt-2 text-muted-foreground">Looks like you haven't added anything yet.</p>
          <Button asChild className="mt-6">
            <Link href="/products">Start Exploring</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

    