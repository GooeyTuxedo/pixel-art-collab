"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import type { PixelData } from "../types/canvas"

interface CanvasProps {
  width: number
  height: number
  pixelSize: number
}

const Canvas: React.FC<CanvasProps> = ({ width, height, pixelSize }) => {
  const [pixels, setPixels] = useState<PixelData[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear the canvas
    ctx.clearRect(0, 0, width * pixelSize, height * pixelSize)

    // Draw the pixels
    pixels.forEach((pixel) => {
      ctx.fillStyle = pixel.color
      ctx.fillRect(pixel.x * pixelSize, pixel.y * pixelSize, pixelSize, pixelSize)
    })
  }, [pixels, width, height, pixelSize])

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((event.clientX - rect.left) / pixelSize)
    const y = Math.floor((event.clientY - rect.top) / pixelSize)

    // TODO: Implement color selection and real-time update
    const newPixel: PixelData = { x, y, color: "#000000" }
    setPixels([...pixels, newPixel])
  }

  return (
    <canvas
      ref={canvasRef}
      width={width * pixelSize}
      height={height * pixelSize}
      onClick={handleCanvasClick}
      className="border border-gray-300"
    />
  )
}

export default Canvas
