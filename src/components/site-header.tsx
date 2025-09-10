
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Heart, Menu, Search, ShoppingCart, User, LogOut, ShieldCheck } from "lucide-react"
import { Logo } from "./logo"
import { useCart } from "@/contexts/cart-context"
import { CartSheet } from "./cart-sheet"
import { useWishlist } from "@/contexts/wishlist-context"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { useRouter } from "next/navigation"
import React, { useCallback, useState } from "react"

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'All Products', href: '/products' },
  { name: 'Electronics', href: '/products?category=electronics' },
  { name: 'Fashion', href: '/products?category=fashion' },
  { name: 'Home', href: '/products?category=home' },
  { name: 'Beauty', href: '/products?category=beauty' },
]

export function SiteHeader() {
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${searchQuery.trim()}`);
    }
  }, [searchQuery, router]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Mobile Nav Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden mr-4">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs">
            <nav className="grid gap-6 text-lg font-medium">
              <div className="flex items-center gap-2 mb-4">
                 <Logo />
              </div>
             {navLinks.map(link => (
                 <Link 
                 key={`${link.name}-${link.href}`} 
                   href={link.href} 
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"  >
                  {link.name}
                 </Link>
                   ))}

               <div className="mt-auto space-y-2">
                 {!user && (
                   <>
                    <Button asChild className="w-full justify-start">
                       <Link href="/login"><User className="mr-2 h-4 w-4" />Login</Link>
                    </Button>
                   </>
                 )}
               </div>
            </nav>
          </SheetContent>
        </Sheet>
        
        {/* Desktop Logo */}
        <div className="mr-6 hidden md:flex">
          <Link href="/">
            <Logo />
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navLinks.slice(0, 2).map(link => (
              <Link key={link.name} href={link.href} className="transition-colors hover:text-foreground/80 text-foreground/60">
                {link.name}
              </Link>
            ))}
        </nav>
        
        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search products..." 
                  className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-accent rounded-full">{wishlistCount}</span>}
                <span className="sr-only">Wishlist</span>
              </Link>
            </Button>
            <CartSheet>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-accent rounded-full">{cartCount}</span>}
                <span className="sr-only">Cart</span>
              </Button>
            </CartSheet>
            
            {user ? (
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                      <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                     <Link href="/profile"><User className="mr-2 h-4 w-4" />Profile</Link>
                  </DropdownMenuItem>
                  {user.email === 'productkeyybazar@gmail.com' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin"><ShieldCheck className="mr-2 h-4 w-4" />Admin</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
                <div className="hidden md:flex items-center gap-2">
                    <Button asChild size="sm">
                       <Link href="/login"><User className="mr-2 h-4 w-4" />Login</Link>
                    </Button>
                </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
