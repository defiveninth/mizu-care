import fs from 'fs'
import path from 'path'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// Helper to read products from JSON file
const getProductsFromJson = () => {
  const filePath = path.join(process.cwd(), 'products_v3.json')
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const rawProducts = JSON.parse(fileContent)
  
  return rawProducts.map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description || null,
    price: typeof p.price === 'string' ? parseInt(p.price.replace(/[^\d]/g, '')) || 0 : p.price,
    image_url: p.image || null,
    link: p.link || null,
    sostav: p.sostav || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }))
}

export interface Product {
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

export interface Review {
  id: number
  author_name: string
  rating: number
  comment: string
  created_at: string
}

export interface Stats {
  total_scans: number
  total_ratings: number
  ratings_sum: number
  accuracy_rate: number
  updated_at: string
}

export const productDb = {
  async getAll(): Promise<Product[]> {
    return getProductsFromJson()
  },

  async getById(id: number): Promise<Product | undefined> {
    const products = getProductsFromJson()
    return products.find(p => p.id === id)
  },

  async getFiltered(search?: string): Promise<Product[]> {
    let products = getProductsFromJson()

    if (search) {
      const lowerSearch = search.toLowerCase()
      products = products.filter(p => 
        p.name.toLowerCase().includes(lowerSearch) || 
        (p.description && p.description.toLowerCase().includes(lowerSearch))
      )
    }

    return products
  }
}

export const reviewDb = {
  async getAll(): Promise<Review[]> {
    const reviews = await sql`
      SELECT id, author_name, rating, comment, created_at 
      FROM reviews 
      ORDER BY created_at DESC 
    ` as Review[]
    return reviews
  },

  async create(data: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    const result = await sql`
      INSERT INTO reviews (author_name, rating, comment)
      VALUES (${data.author_name}, ${data.rating}, ${data.comment})
      RETURNING id, author_name, rating, comment, created_at
    ` as Review[]

    // Update stats in DB
    await sql`
      UPDATE scan_stats 
      SET total_ratings = total_ratings + 1,
          ratings_sum = ratings_sum + ${data.rating},
          updated_at = NOW()
      WHERE id = 1
    `
    
    return result[0]
  },

  async delete(id: number): Promise<boolean> {
    const existing = await sql`
      SELECT rating FROM reviews WHERE id = ${id}
    ` as { rating: number }[]

    if (existing.length === 0) return false

    const rating = existing[0].rating

    await sql`DELETE FROM reviews WHERE id = ${id}`

    // Update stats in DB
    await sql`
      UPDATE scan_stats 
      SET total_ratings = GREATEST(total_ratings - 1, 0),
          ratings_sum = GREATEST(ratings_sum - ${rating}, 0),
          updated_at = NOW()
      WHERE id = 1
    `
    
    return true
  }
}

export const statsDb = {
  async get(): Promise<Stats & { average_rating: number }> {
    const stats = await sql`
      SELECT 
        total_scans,
        total_ratings,
        ratings_sum,
        accuracy_rate,
        CASE 
          WHEN total_ratings > 0 THEN ROUND((ratings_sum::decimal / total_ratings), 1)
          ELSE 0 
        END as average_rating,
        updated_at
      FROM scan_stats 
      WHERE id = 1
    ` as (Stats & { average_rating: number })[]
    
    return stats[0] || {
      total_scans: 0,
      total_ratings: 0,
      ratings_sum: 0,
      accuracy_rate: 98,
      average_rating: 0,
      updated_at: new Date().toISOString()
    }
  },

  async incrementScans(): Promise<void> {
    await sql`
      UPDATE scan_stats 
      SET total_scans = total_scans + 1,
          updated_at = NOW()
      WHERE id = 1
    `
  }
}
