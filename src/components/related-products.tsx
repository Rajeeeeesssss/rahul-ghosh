
"use client"

import { useEffect, useState } from 'react';
import { getRelatedProducts } from '@/ai/flows/related-products';
import { ProductCarousel } from './product-carousel';
import type { Product } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

interface RelatedProductsProps {
  product: Product;
}

const LoadingSkeleton = () => (
   <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-8">
      <Skeleton className="h-8 w-64 mx-auto" />
      <Skeleton className="h-4 w-80 mx-auto mt-4" />
    </div>
    <div className="flex space-x-4 overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="w-1/4 shrink-0 p-1">
          <div className="space-y-2">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export function RelatedProducts({ product }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        const foundProducts = await getRelatedProducts({
          productDescription: product.description,
          productCategory: product.category,
          currentProductId: product.id,
          numberOfProducts: 4,
        });

        setRelatedProducts(foundProducts);
      } catch (error) {
        console.error("Failed to fetch related products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [product.id, product.description, product.category]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <ProductCarousel 
      products={relatedProducts}
      title="You Might Also Like"
      subtitle="Customers who viewed this item also viewed"
    />
  );
}
