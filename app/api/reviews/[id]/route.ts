import { NextResponse } from "next/server"
import { reviewDb } from "@/lib/db"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reviewId = Number(id)

    if (!Number.isFinite(reviewId)) {
      return NextResponse.json({ error: "Invalid review id" }, { status: 400 })
    }

    const deleted = await reviewDb.delete(reviewId)

    if (!deleted) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
  }
}
