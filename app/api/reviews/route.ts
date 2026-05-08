import { NextResponse } from 'next/server'
import { reviewDb } from '@/lib/db'

export async function GET() {
  try {
    const reviews = await reviewDb.getAll()
    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { author_name, rating, comment } = await request.json()

    if (!author_name || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    const newReview = await reviewDb.create({
      author_name,
      rating: Number(rating),
      comment
    })

    return NextResponse.json(newReview, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
