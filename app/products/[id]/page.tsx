"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import useSWR from "swr"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, ShoppingBag, ExternalLink, Info, Check, ListChecks } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"
import { addToBasket } from "@/lib/basket"

interface Product {
  id: number
  name: string
  description: string | null
  price: number
  image_url: string | null
  link: string | null
  sostav: string[]
  created_at: string
  updated_at: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { t } = useI18n()
  const [added, setAdded] = useState(false)

  const { data: product, isLoading, error } = useSWR<Product>(
    id ? `/api/products/${id}` : null,
    fetcher
  )

  const p = product

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto flex items-center px-6 py-3">
            <Button variant="ghost" size="icon" className="rounded-full mr-3" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Skeleton className="h-6 w-40" />
          </div>
        </nav>
        <div className="container mx-auto px-6 py-10 max-w-3xl">
          <Skeleton className="h-72 w-full rounded-2xl mb-8" />
          <Skeleton className="h-8 w-2/3 mb-3" />
          <Skeleton className="h-5 w-1/3 mb-6" />
          <Skeleton className="h-24 w-full mb-6" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
        <p className="text-xl font-semibold text-foreground">{t('product.notFound')}</p>
        <Button variant="outline" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('product.back')}
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm font-medium text-muted-foreground line-clamp-1 max-w-[200px]">
              {p?.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/basket">
              <Button variant="outline" size="sm" className="rounded-full">
                Basket
              </Button>
            </Link>
            <span className="text-lg font-bold text-foreground">{Number(product.price).toLocaleString('ru-KZ')} ₸</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto max-w-6xl px-6 md:px-12 py-8 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20"
        >
          {/* Left Column: Product Image */}
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white shadow-sm border border-border/40 flex items-center justify-center p-8 md:p-12">
            {p?.image_url ? (
              <div className="relative w-full h-full">
                <Image
                  src={p.image_url}
                  alt={p.name}
                  fill
                  className="object-contain transition-transform duration-500 hover:scale-105"
                  priority
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground/20">
                <ShoppingBag className="h-24 w-24 mb-4" />
                <span className="text-sm font-medium">No image available</span>
              </div>
            )}
          </div>

          {/* Right Column: Info & Actions */}
          <div className="flex flex-col space-y-10">
            <div className="space-y-6">
              <h1 className="text-3xl md:text-5xl font-bold text-foreground text-balance leading-tight tracking-tight">
                {p?.name}
              </h1>
              
              <div className="flex items-center gap-6 flex-wrap">
                <span className="text-3xl md:text-4xl font-bold text-primary">{Number(p?.price).toLocaleString('ru-KZ')} ₸</span>
                {p?.link && (
                  <Link href={p.link} target="_blank">
                    <Button variant="outline" className="rounded-full px-6 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Buy Online
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Description */}
            {p?.description && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
                  <Info className="h-3.5 w-3.5 text-primary" />
                  {t('product.description')}
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {p.description}
                </p>
              </div>
            )}

            {/* Ingredients (Sostav) */}
            {p?.sostav && p.sostav.length > 0 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
                  <ListChecks className="h-3.5 w-3.5 text-primary" />
                  Ingredients
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {p.sostav.map((ing, i) => (
                    <Badge key={i} variant="secondary" className="rounded-full py-1.5 px-4 bg-secondary/40 text-secondary-foreground border-none hover:bg-secondary/60 transition-colors">
                      {ing}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="flex gap-4 pt-8 mt-auto">
              <Button
                className="flex-1 rounded-full py-8 text-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                onClick={() => {
                  if (!p) return
                  addToBasket({
                    id: p.id,
                    name: p.name,
                    price: Number(p.price),
                    image_url: p.image_url,
                  } as any)
                  setAdded(true)
                  window.setTimeout(() => setAdded(false), 1500)
                }}
              >
                {added ? (
                  <span className="inline-flex items-center gap-2">
                    <Check className="h-6 w-6" />
                    {t('basket.addedToBasket')}
                  </span>
                ) : (
                  t('product.addToRoutine')
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
