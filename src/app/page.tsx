
"use client"
import { ProductCarousel } from '@/components/product-carousel'
import { RecentlyViewedProducts } from '@/components/recently-viewed-products'

import { Button } from '@/components/ui/button'
import { getProducts } from '@/services/productService'
import { Product } from '@/lib/types'
import { ArrowRight, ShoppingBag, Zap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const HeroSection = () => (
  <section className="bg-card shadow-lg rounded-b-3xl">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-8 items-center py-12 md:py-20">
        <div className="space-y-6 text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
            <span className="block">All digital keys</span>
            <span className="block text-primary">One Step Solution for Your All Digital keys</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
           Get genuine digital keys at the best prices. Secure, instant delivery for Windows, Office, Games, and other essential software.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 transition-all duration-300 text-white shadow-lg transform hover:-translate-y-1">
              <Link href="/products">
                <ShoppingBag className="mr-2" />
                Shop Now
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/products?category=new-arrivals">
                View Collection
                <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative h-64 md:h-96 lg:h-full">
          <Image
            src="/two.jpg"
            alt="Summer collection"
            layout="fill"
            objectFit="cover"
            className="rounded-2xl shadow-2xl"
          
          />
        </div>
      </div>
    </div>
  </section>
);

const categories = [
  { name: 'Windows key', href: '/products?category=Windows key', image: '/three.jpg', hint: 'modern gadgets' },
  { name: 'Micorsoft key', href: '/products?category=Microsoft key', image: '/four.jpg', hint: 'stylish clothing' },
  { name: 'Game keys', href: '/products?category=Game keys', image: '/five.jpg', hint: 'cozy interior' },
  { name: 'Others key', href: '/products?category=Others key', image: '/one.jpg', hint: 'cosmetics products' },
];

const FeaturedCategories = () => (
  <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h2 className="text-3xl font-bold text-center mb-8">Featured Categories</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {categories.map((category) => (
        <Link href={category.href} key={category.name} className="group block">
          <div className="relative aspect-square overflow-hidden rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-105">
            <Image src={category.image} alt={category.name} layout="fill" objectFit="cover" data-ai-hint={category.hint} />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <h3 className="text-white text-xl font-bold">{category.name}</h3>
            </div>
          </div>
        </Link>
      ))}
    </div>
  </section>
);

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const saleEndDate = new Date();
    saleEndDate.setDate(saleEndDate.getDate() + 3); // 3 days from now

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = saleEndDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-4">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex flex-col items-center p-3 bg-card/80 rounded-lg shadow-inner w-20">
          <span className="text-3xl font-bold text-accent">{value.toString().padStart(2, '0')}</span>
          <span className="text-sm text-muted-foreground uppercase">{unit}</span>
        </div>
      ))}
    </div>
  );
};


const FlashSaleSection = () => (
  <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="relative bg-gradient-to-br from-accent/80 to-red-400/80 rounded-2xl shadow-xl p-8 md:p-12 overflow-hidden">
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="text-center lg:text-left">
          <h2 className="text-4xl font-extrabold text-white mb-2 flex items-center justify-center lg:justify-start gap-3">
            <Zap className="h-10 w-10"/>
            Flash Sale!
          </h2>
          <p className="text-white/90 text-lg">Don't miss out on these amazing deals. Up to 50% off!</p>
        </div>
        <CountdownTimer />
        <Button size="lg" variant="secondary" asChild className="shadow-lg transform hover:-translate-y-1 transition-transform duration-300">
           <Link href="/products?category=sale">View Deals <ArrowRight className="ml-2"/></Link>
        </Button>
      </div>
    </div>
  </section>
);

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productList = await getProducts();
        setProducts(productList);
      } catch (error) {
        console.error("Failed to fetch products for homepage:", error);
      }
    };
    fetchProducts();
  }, []);

  const featuredProducts = products.filter(p => p.category === 'Windows key').slice(0, 8);
  const trendingProducts = products.slice(0, 8);

  return (
    <div className="flex flex-col gap-12 md:gap-16 lg:gap-20 pb-20">
      <HeroSection />
      <FeaturedCategories />
      <ProductCarousel
        products={trendingProducts}
        title="Trending Now"
        subtitle="Check out our most popular products"
      />
      <FlashSaleSection />
       <ProductCarousel
        products={featuredProducts}
        title="New in Windows"
        subtitle="The latest software to keep you ahead of the curve"
      />
      {/* <RecentlyViewedProducts /> */}
    </div>
  )
}
