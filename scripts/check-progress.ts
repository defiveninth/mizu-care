import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

const sql = neon(process.env.DATABASE_URL!)

async function check() {
  const rows = await sql`SELECT locale, COUNT(*) as count FROM product_translations GROUP BY locale`
  console.log(rows)
}

check()
