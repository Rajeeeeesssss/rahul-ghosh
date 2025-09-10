
"use client"
import type { Product } from '@/lib/types';
import { useEffect, useState } from 'react';
import { ProductGallery } from '@/components/product-gallery';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/cart-context';
import { QuantitySelector } from '@/components/quantity-selector';
import { useWishlist } from '@/contexts/wishlist-context';
import { cn } from '@/lib/utils';
import { useRecentlyViewed } from '@/contexts/recently-viewed-context';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';

export const ProductDetailSkeleton = () => (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <div className="flex gap-2">
                    <Skeleton className="w-20 h-20 rounded-md" />
                    <Skeleton className="w-20 h-20 rounded-md" />
                    <Skeleton className="w-20 h-20 rounded-md" />
                </div>
            </div>
            <div className="space-y-6">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-12 w-1/3" />
                <Separator />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    </div>
);

export function ProductDetailContent({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  const { addRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    addRecentlyViewed(product);
  }, [product.id, addRecentlyViewed]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleWishlistToggle = () => {
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
      <ProductGallery images={product.images} />
      <div className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">{product.brand}</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{product.name}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <span className="font-semibold">{product.rating}</span>
            <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
          </div>
          <Separator orientation="vertical" className="h-5" />
          <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>
        <p className="text-4xl font-extrabold text-primary">${product.price.toFixed(2)}</p>
        
        <Separator />
        
        <div className="flex items-center gap-4">
          <span className="font-medium">Quantity:</span>
          <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1 bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg hover:opacity-90 transition-opacity">
            <ShoppingCart className="mr-2" /> Add to Cart
          </Button>
          <Button size="lg" variant="outline" onClick={handleWishlistToggle} className="flex-1">
            <Heart className={cn("mr-2", isWishlisted(product.id) && "fill-accent text-accent")} /> 
            {isWishlisted(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
          </Button>
        </div>
        
        <Tabs defaultValue="description" className="w-full">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="text-muted-foreground pt-4">
            {product.description}
          </TabsContent>
          <TabsContent value="specifications" className="text-muted-foreground pt-4">
            <ul className="list-disc list-inside space-y-1">
              <li>Brand: {product.brand}</li>
              <li>Category: {product.category}</li>
              <li>Stock: {product.stock}</li>
            </ul>
          </TabsContent>
          <TabsContent value="reviews" className="text-muted-foreground pt-4">
            <p>No reviews yet. Be the first to review!</p>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}
