import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export interface Product {
  id: number
  name: string
  description: string | null
  usage_tip: string | null
  price: number
  brand: string
  type: string
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface CreateProductInput {
  name: string
  description?: string | null
  usage_tip?: string | null
  price: number
  brand: string
  type: string
  image_url?: string | null
}

export interface ProductTranslation {
  id: number
  product_id: number
  locale: string
  name: string
  description: string | null
  usage_tip: string | null
  type: string
  created_at: string
  updated_at: string
}

export const productDb = {
  async getAll(locale?: string): Promise<Product[]> {
    if (!locale || locale === 'en') {
      return await sql`SELECT * FROM products ORDER BY created_at DESC` as Product[]
    }

    return await sql`
      SELECT 
        p.id,
        COALESCE(pt.name, p.name) as name,
        COALESCE(pt.description, p.description) as description,
        COALESCE(pt.usage_tip, p.usage_tip) as usage_tip,
        p.price,
        p.brand,
        COALESCE(pt.type, p.type) as type,
        p.image_url,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN product_translations pt ON p.id = pt.product_id AND pt.locale = ${locale}
      ORDER BY p.created_at DESC
    ` as Product[]
  },

  async getById(id: number, locale?: string): Promise<Product | undefined> {
    if (!locale || locale === 'en') {
      const rows = await sql`SELECT * FROM products WHERE id = ${id}` as Product[]
      return rows[0]
    }

    const rows = await sql`
      SELECT 
        p.id,
        COALESCE(pt.name, p.name) as name,
        COALESCE(pt.description, p.description) as description,
        COALESCE(pt.usage_tip, p.usage_tip) as usage_tip,
        p.price,
        p.brand,
        COALESCE(pt.type, p.type) as type,
        p.image_url,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN product_translations pt ON p.id = pt.product_id AND pt.locale = ${locale}
      WHERE p.id = ${id}
    ` as Product[]
    return rows[0]
  },

  async getFiltered(
    search?: string,
    brand?: string,
    type?: string,
    locale?: string
  ): Promise<Product[]> {
    const isEnglish = !locale || locale === 'en'
    const conditions: string[] = []
    const values: any[] = []
    let i = 1

    if (search) {
      if (isEnglish) {
        conditions.push(`(name ILIKE $${i} OR description ILIKE $${i} OR brand ILIKE $${i})`)
      } else {
        conditions.push(`(pt.name ILIKE $${i} OR pt.description ILIKE $${i} OR p.brand ILIKE $${i})`)
      }
      values.push(`%${search}%`)
      i++
    }

    if (brand) {
      conditions.push(`p.brand = $${i}`)
      values.push(brand)
      i++
    }

    if (type) {
      if (isEnglish) {
        conditions.push(`p.type = $${i}`)
      } else {
        conditions.push(`pt.type = $${i}`)
      }
      values.push(type)
      i++
    }

    let query = `
      SELECT 
        p.id,
        ${isEnglish ? 'p.name' : 'COALESCE(pt.name, p.name) as name'},
        ${isEnglish ? 'p.description' : 'COALESCE(pt.description, p.description) as description'},
        ${isEnglish ? 'p.usage_tip' : 'COALESCE(pt.usage_tip, p.usage_tip) as usage_tip'},
        p.price,
        p.brand,
        ${isEnglish ? 'p.type' : 'COALESCE(pt.type, p.type) as type'},
        p.image_url,
        p.created_at,
        p.updated_at
      FROM products p
    `

    if (!isEnglish) {
      query += ` LEFT JOIN product_translations pt ON p.id = pt.product_id AND pt.locale = $${i++}`
      values.push(locale)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }

    query += ` ORDER BY p.created_at DESC`

    return await sql(query, values) as Product[]
  },

  async getBrands(): Promise<string[]> {
    const rows = await sql`SELECT DISTINCT brand FROM products ORDER BY brand` as { brand: string }[]
    return rows.map(r => r.brand)
  },

  async getTypes(locale?: string): Promise<string[]> {
    if (!locale || locale === 'en') {
      const rows = await sql`SELECT DISTINCT type FROM products ORDER BY type` as { type: string }[]
      return rows.map(r => r.type)
    }
    const rows = await sql`
      SELECT DISTINCT COALESCE(pt.type, p.type) as type 
      FROM products p
      LEFT JOIN product_translations pt ON p.id = pt.product_id AND pt.locale = ${locale}
      ORDER BY type
    ` as { type: string }[]
    return rows.map(r => r.type)
  },

  async create(product: CreateProductInput): Promise<Product> {
    const rows = await sql`
      INSERT INTO products (name, description, usage_tip, price, brand, type, image_url)
      VALUES (${product.name}, ${product.description ?? null}, ${product.usage_tip ?? null}, ${product.price}, ${product.brand}, ${product.type}, ${product.image_url ?? null})
      RETURNING *
    ` as Product[]
    return rows[0]
  },

  async update(id: number, product: CreateProductInput): Promise<Product | undefined> {
    const rows = await sql`
      UPDATE products
      SET name = ${product.name},
          description = ${product.description ?? null},
          usage_tip = ${product.usage_tip ?? null},
          price = ${product.price},
          brand = ${product.brand},
          type = ${product.type},
          image_url = ${product.image_url ?? null},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    ` as Product[]
    return rows[0]
  },

  async delete(id: number): Promise<boolean> {
    const rows = await sql`DELETE FROM products WHERE id = ${id} RETURNING id` as { id: number }[]
    return rows.length > 0
  },
}

export const translationDb = {
  async upsert(translation: Partial<ProductTranslation>): Promise<ProductTranslation> {
    const rows = await sql`
      INSERT INTO product_translations (product_id, locale, name, description, usage_tip, type)
      VALUES (${translation.product_id}, ${translation.locale}, ${translation.name}, ${translation.description}, ${translation.usage_tip}, ${translation.type})
      ON CONFLICT (product_id, locale) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        usage_tip = EXCLUDED.usage_tip,
        type = EXCLUDED.type,
        updated_at = NOW()
      RETURNING *
    ` as ProductTranslation[]
    return rows[0]
  },

  async getForProduct(productId: number): Promise<ProductTranslation[]> {
    return await sql`SELECT * FROM product_translations WHERE product_id = ${productId}` as ProductTranslation[]
  }
}
