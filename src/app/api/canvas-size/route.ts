import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

const CANVAS_SIZE_KEY = "canvas_size"

export async function GET() {
  try {
    const canvasSize = await kv.get(CANVAS_SIZE_KEY)
    if (canvasSize) {
      return NextResponse.json(canvasSize)
    } else {
      return NextResponse.json({ width: 50, height: 50 }) // Default size
    }
  } catch (error) {
    console.error("Failed to fetch canvas size:", error)
    return NextResponse.json({ error: "Failed to fetch canvas size" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { width, height } = await request.json()
    await kv.set(CANVAS_SIZE_KEY, JSON.stringify({ width, height }))
    return NextResponse.json({ message: "Canvas size updated successfully" })
  } catch (error) {
    console.error("Failed to update canvas size:", error)
    return NextResponse.json({ error: "Failed to update canvas size" }, { status: 500 })
  }
}

