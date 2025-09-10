"use client"

import { Button } from "./ui/button"
import { Minus, Plus } from "lucide-react"

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
}

export function QuantitySelector({ quantity, onQuantityChange }: QuantitySelectorProps) {
  const handleDecrement = () => {
    onQuantityChange(Math.max(1, quantity - 1));
  }

  const handleIncrement = () => {
    onQuantityChange(quantity + 1);
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleDecrement}>
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-10 text-center font-semibold">{quantity}</span>
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleIncrement}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
