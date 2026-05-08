"use client"

import { Product } from "@/lib/db"
import { useI18n } from "@/lib/i18n"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface ProductCardProps {
  product: Product
  isAdded: boolean
  onAdd: () => void
}

export function ProductCard({ product, isAdded, onAdd }: ProductCardProps) {
  const { t } = useI18n()
  const p = product

  return (
    <Link href={`/products/${p.id}`} className="block h-full">
      <Card className={`p-0 group overflow-hidden border-border/50 hover:shadow-elevated hover:border-primary/30 transition-all duration-300 h-full flex flex-col cursor-pointer`}>
        {/* Product Image */}
        <div className="relative h-64 bg-white flex items-center justify-center overflow-hidden p-6 border-b border-border/40">
          {p.image_url ? (
            <div className="relative w-full h-full">
              <Image 
                src={p.image_url} 
                alt={p.name}
                fill
                className="object-contain group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground/30">
              <ShoppingBag className="h-12 w-12 mb-2" />
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {p.name}
            </h3>
            {p.description && (
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                {p.description}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
            <span className="text-lg font-bold text-foreground">
              {Number(p.price).toLocaleString('ru-KZ')} ₸
            </span>
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onAdd()
              }}
            >
              {isAdded ? t('common.added') : t('products.addToRoutine')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
