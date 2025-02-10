"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import type { PixelData } from "../types/canvas"
import io, { type Socket } from "socket.io-client"

interface CanvasProps {
  width: number
  height: number
  pixelSize: number
  userId: string
  selectedColor: string
}

const COOLDOWN_TIME = 5000 // 5 seconds cooldown

const Canvas: React.FC<CanvasProps> = ({ width, height, pixelSize, userId, selectedColor }) => {
  const [pixels, setPixels] = useState<PixelData[]>([])
  const [cooldown, setCooldown] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    socketRef.current = io()

    socketRef.current.on("connect", () => {
      console.log("Connected to server")
      socketRef.current?.emit("joinRoom", userId)
    })

    socketRef.current.on("updatePixel", (pixelData: PixelData) => {
      setPixels((prevPixels) => [...prevPixels, pixelData])
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [userId])

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

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1000), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (cooldown > 0) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((event.clientX - rect.left) / pixelSize)
    const y = Math.floor((event.clientY - rect.top) / pixelSize)

    const newPixel: PixelData = { x, y, color: selectedColor, userId }
    setPixels((prevPixels) => [...prevPixels, newPixel])
    socketRef.current?.emit("pixelPlaced", newPixel)
    setCooldown(COOLDOWN_TIME)
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={width * pixelSize}
        height={height * pixelSize}
        onClick={handleCanvasClick}
        className="border border-gray-300"
      />
      {cooldown > 0 && <div className="mt-2 text-center">Cooldown: {cooldown / 1000}s</div>}
    </div>
  )
}

export default Canvas
