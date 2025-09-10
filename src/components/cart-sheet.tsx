
"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import Image from "next/image"
import Link from "next/link"
import { ScrollArea } from "./ui/scroll-area"
import { QuantitySelector } from "./quantity-selector"
import { Trash2 } from "lucide-react"

export function CartSheet({ children }: { children: React.ReactNode }) {
  const { cartItems, cartCount, cartTotal, removeFromCart, updateQuantity } = useCart()

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>Cart ({cartCount})</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          {cartItems.length > 0 ? (
            <ScrollArea className="h-full pr-6">
              <div className="flex flex-col gap-6 py-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-start gap-4">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="rounded-md object-cover"
                      data-ai-hint="product image"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <QuantitySelector
                          quantity={item.quantity}
                          onQuantityChange={(newQuantity) => updateQuantity(item.id, newQuantity)}
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center px-6">
              <h3 className="text-xl font-semibold">Your cart is empty</h3>
              <p className="text-muted-foreground">Add some products to get started.</p>
              <SheetClose asChild>
                <Button asChild>
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </SheetClose>
            </div>
          )}
        </div>
        {cartItems.length > 0 && (
          <SheetFooter className="bg-background border-t px-6 py-4">
            <div className="w-full space-y-4">
              <div className="flex justify-between font-semibold">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <SheetClose asChild>
                <Button size="lg" className="w-full bg-gradient-to-r from-primary to-blue-500 text-white" asChild>
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </SheetClose>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
