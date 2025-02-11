"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import type { PixelData } from "../types/canvas"

interface MinimapProps {
  width: number
  height: number
  pixels: PixelData[]
  viewportWidth: number
  viewportHeight: number
  panOffset: { x: number; y: number }
  zoom: number
  onNavigate: (x: number, y: number) => void
}

const Minimap: React.FC<MinimapProps> = ({
  width,
  height,
  pixels,
  viewportWidth,
  viewportHeight,
  panOffset,
  zoom,
  onNavigate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const scale = Math.min(80 / width, 80 / height)
    canvas.width = width * scale
    canvas.height = height * scale

    // Clear the canvas
    ctx.fillStyle = "#f0f0f0"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw pixels
    pixels.forEach((pixel) => {
      ctx.fillStyle = pixel.color
      ctx.fillRect(pixel.x * scale, pixel.y * scale, scale, scale)
    })

    // Draw viewport rectangle
    const viewportRect = {
      x: (-panOffset.x / zoom) * scale,
      y: (-panOffset.y / zoom) * scale,
      width: (viewportWidth / zoom) * scale,
      height: (viewportHeight / zoom) * scale,
    }

    ctx.strokeStyle = "rgba(255, 0, 0, 0.5)"
    ctx.lineWidth = 2
    ctx.strokeRect(viewportRect.x, viewportRect.y, viewportRect.width, viewportRect.height)
  }, [width, height, pixels, viewportWidth, viewportHeight, panOffset, zoom])

  const handleMinimapClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scale = Math.min(80 / width, 80 / height)
    const x = (event.clientX - rect.left) / scale
    const y = (event.clientY - rect.top) / scale

    onNavigate(x, y)
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleMinimapClick}
      className="border border-gray-300 cursor-pointer"
      style={{ width: "80px", height: "80px" }}
    />
  )
}

export default Minimap
