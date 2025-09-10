import { ShoppingCart } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <ShoppingCart className="h-7 w-7 text-primary" />
      <span className="text-xl font-bold tracking-tight text-foreground">
        Product Key Bazar
      </span>
    </div>
  );
}
