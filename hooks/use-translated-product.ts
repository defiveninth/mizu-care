"use client"

import { Product } from '@/lib/db'

/**
 * @deprecated Translation is now handled server-side. 
 * The products API returns localized content automatically based on the locale query param.
 */
export function useTranslatedProduct(product: Product | undefined) {
  return { product, isTranslating: false }
}

export function useTranslatedProducts(products: Product[]) {
  return { products }
}
