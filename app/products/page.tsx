"use client"

import { LanguageSwitcher } from "@/components/language-switcher"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProductCard } from "@/components/product-card"
import { HistoryButton } from "@/components/history-button"
import { addToBasket, readBasket } from "@/lib/basket"
import { useI18n } from "@/lib/i18n"
import { motion } from "framer-motion"
import { ArrowLeft, Package, Search, ShoppingBag, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"

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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut" as const },
  }),
}

export default function ProductsPage() {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")
  const [basketIds, setBasketIds] = useState<Set<number>>(() => new Set())
  
  const { data: products, isLoading } = useSWR<Product[]>(`/api/products`, fetcher)

  useEffect(() => {
    const refresh = () => {
      const ids = new Set(readBasket().map((item) => item.id))
      setBasketIds(ids)
    }

    refresh()
    window.addEventListener("storage", refresh)
    return () => window.removeEventListener("storage", refresh)
  }, [])

  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 12

  const filteredProducts = useMemo(() => {
    if (!products) return []
    
    return products.filter(product => {
      const matchesSearch = searchQuery === "" || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesSearch
    })
  }, [products, searchQuery])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredProducts, currentPage])

  const clearFilters = () => {
    setSearchQuery("")
  }

  const hasActiveFilters = searchQuery

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <Image src="/icon-white.png" alt="MizuCaire" className="w-6 h-6 object-contain" width={24} height={24} />
              </div>
              <span className="text-xl font-bold text-foreground font-display">{t('products.title')}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {filteredProducts.length} {filteredProducts.length === 1 ? t('products.product') : t('products.products')}
            </span>
            <Link href="/basket">
              <Button variant="outline" size="sm" className="rounded-full">
                <ShoppingBag className="h-4 w-4 mr-1" />
                Basket
              </Button>
            </Link>
            <HistoryButton />
            <LanguageSwitcher variant="minimal" />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="search"
              placeholder={t('products.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-full bg-card border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                {t('products.searchLabel')} &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery("")} className="ml-2 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                {t('products.clearAll')}
              </Button>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg" />
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2 mb-4" />
                  <div className="h-6 bg-muted rounded w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : paginatedProducts.length > 0 ? (
          <>
            <motion.div 
              key={currentPage}
              initial="hidden" 
              animate="visible" 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {paginatedProducts.map((product, i) => (
                <motion.div key={product.id} custom={i} variants={fadeUp}>
                  <ProductCard
                    product={product as any}
                    isAdded={basketIds.has(product.id)}
                    onAdd={() => {
                      const next = addToBasket({
                        id: product.id,
                        name: product.name,
                        price: Number(product.price),
                        image_url: product.image_url,
                      } as any)
                      setBasketIds(new Set(next.map((item) => item.id)))
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-full px-4"
                >
                  {t('common.previous')}
                </Button>
                
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1
                    // Show only first, last, and pages around current
                    if (
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-9 h-9 rounded-full p-0"
                        >
                          {page}
                        </Button>
                      )
                    } else if (
                      (page === 2 && currentPage > 3) ||
                      (page === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return <span key={page} className="text-muted-foreground">...</span>
                    }
                    return null
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-full px-4"
                >
                  {t('common.next')}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">{t('products.noProducts')}</h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters
                ? t('products.noProductsFiltered')
                : t('products.noProducts')}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="rounded-full">
                {t('products.clearFilters')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
