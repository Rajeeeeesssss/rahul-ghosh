"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Star } from "lucide-react"

import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist()

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  }

  return (
    <div className={cn("group relative", className)}>
      <Link href={`/products/${product.id}`}>
        <div className="overflow-hidden rounded-lg bg-card shadow-md transition-all duration-300 group-hover:shadow-xl">
          <div className="aspect-square overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              width={400}
              height={400}
              className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={`${product.category} product`}
            />
          </div>
          <div className="p-4">
            <h3 className="text-base font-semibold text-foreground truncate">{product.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{product.brand}</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-lg font-bold text-primary">₹{product.price.toFixed(2)}</p>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm text-muted-foreground">{product.rating}</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={handleAddToCart} className="w-full bg-gradient-to-r from-primary to-blue-400 text-white hover:opacity-90 transition-opacity">
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
              <Button variant="outline" size="icon" onClick={handleWishlistToggle}>
                <Heart className={cn("h-4 w-4", isWishlisted(product.id) && "fill-accent text-accent")} />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
