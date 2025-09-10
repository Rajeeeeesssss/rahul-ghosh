"use client"

import { Facebook, Instagram, Twitter } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function SiteFooter() {
  return (
    <footer className="bg-card text-card-foreground border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            {/* Logo replaced with six.ico */}
            <Link href="/">
              <Image
                src="/six.ico"
                alt="Product Key Bazar"
                width={50}
                height={50}
              />
            </Link>
            <p className="text-sm text-muted-foreground">One Site One Solution</p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground"><Twitter size={20} /></Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground"><Facebook size={20} /></Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground"><Instagram size={20} /></Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="text-muted-foreground hover:text-foreground">All Products</Link></li>
              <li><Link href="/products?category=Windows key" className="text-muted-foreground hover:text-foreground">Windows key</Link></li>
              <li><Link href="/products?category=Adobie keys" className="text-muted-foreground hover:text-foreground">Adobie keys</Link></li>
              <li><Link href="/products?category=Game keys" className="text-muted-foreground hover:text-foreground">Game keys</Link></li>
              <li><Link href="/products?category=Others key" className="text-muted-foreground hover:text-foreground">Others key</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-foreground">Contact Us</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground">FAQ</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground">Shipping & Returns</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground">Track Order</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-4">Subscribe to our newsletter for the latest deals and updates.</p>
            <form className="flex gap-2">
              <Input type="email" placeholder="Your Email" className="flex-1" />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Product Key Bazar. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
