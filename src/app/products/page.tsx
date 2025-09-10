
"use client"

import { useState, useMemo, useEffect } from 'react';
import type { Product } from '@/lib/types';
import { getProducts } from '@/services/productService';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { ProductSort } from '@/components/product-sort';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

const PRODUCTS_PER_PAGE = 8;

const ProductGridSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => (
            <div key={i} className="space-y-2">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        ))}
    </div>
);


export default function ProductsPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const searchQuery = searchParams.get('q');
  
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const products = await getProducts();
        setAllProducts(products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let products = allProducts;

    if (category) {
        products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if(searchQuery) {
        products = products.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    if (sortOption === 'price-asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    } else { // 'newest'
      products.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    }
    
    return products;
  }, [category, sortOption, allProducts, searchQuery]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const loadMore = () => {
    setVisibleCount(prevCount => prevCount + PRODUCTS_PER_PAGE);
  };
  
  let pageTitle = 'All Products';
  if (category) {
    pageTitle = category.charAt(0).toUpperCase() + category.slice(1);
  } else if (searchQuery) {
    pageTitle = `Search results for "${searchQuery}"`;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
        <ProductSort onSortChange={setSortOption} />
      </div>

      {loading ? (
        <ProductGridSkeleton />
      ) : (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visibleProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
                ))}
            </div>
            {filteredProducts.length === 0 && !loading && (
                <div className="text-center py-16">
                    <p className="text-lg text-muted-foreground">No products found.</p>
                </div>
            )}
        </>
      )}


      {visibleCount < filteredProducts.length && (
        <div className="mt-12 text-center">
          <Button size="lg" onClick={loadMore}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
