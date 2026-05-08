import { NextResponse } from 'next/server'
import { statsDb } from '@/lib/db'

export async function GET() {
  try {
    const stats = await statsDb.get()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

export async function POST() {
  // Increment scan count
  try {
    await statsDb.incrementScans()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating stats:', error)
    return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 })
  }
}
