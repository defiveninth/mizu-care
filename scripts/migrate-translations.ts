import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function migrate() {
  console.log('Starting migration: creating product_translations table...')
  
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS product_translations (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        locale VARCHAR(10) NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        usage_tip TEXT,
        type TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(product_id, locale)
      )
    `
    console.log('Success: product_translations table created or already exists.')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

migrate()
