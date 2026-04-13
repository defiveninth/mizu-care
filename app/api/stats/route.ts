import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const stats = await sql`
      SELECT 
        total_scans,
        total_ratings,
        ratings_sum,
        accuracy_rate,
        CASE 
          WHEN total_ratings > 0 THEN ROUND((ratings_sum::decimal / total_ratings), 1)
          ELSE 0 
        END as average_rating
      FROM scan_stats 
      WHERE id = 1
    `
    
    return NextResponse.json(stats[0] || {
      total_scans: 0,
      total_ratings: 0,
      accuracy_rate: 98,
      average_rating: 0
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

export async function POST() {
  // Increment scan count
  try {
    await sql`
      UPDATE scan_stats 
      SET total_scans = total_scans + 1,
          updated_at = NOW()
      WHERE id = 1
    `
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating stats:', error)
    return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 })
  }
}
