"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import type { PixelData } from "../types/canvas"
import io, { type Socket } from "socket.io-client"
import { ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CanvasProps {
  width: number
  height: number
  pixelSize: number
  userId: string
  selectedColor: string
}

const COOLDOWN_TIME = 5000 // 5 seconds cooldown
const MIN_ZOOM = 0.5
const MAX_ZOOM = 5

const Canvas: React.FC<CanvasProps> = ({ width, height, pixelSize, userId, selectedColor }) => {
  const [pixels, setPixels] = useState<PixelData[]>([])
  const [cooldown, setCooldown] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io("ws://localhost:3001", {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current.on("connect", () => {
      console.log("Connected to WebSocket server")
      socketRef.current?.emit("joinRoom", userId)
    })

    socketRef.current.on("connect_error", (error) => {
      console.error("Connection error:", error)
    })

    socketRef.current.on("updatePixel", (pixelData: PixelData) => {
      setPixels((prevPixels) => [...prevPixels, pixelData])
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [userId])

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.scale(zoom, zoom)
    ctx.translate(panOffset.x, panOffset.y)

    // Draw grid
    ctx.beginPath()
    for (let x = 0; x <= width; x++) {
      ctx.moveTo(x * pixelSize, 0)
      ctx.lineTo(x * pixelSize, height * pixelSize)
    }
    for (let y = 0; y <= height; y++) {
      ctx.moveTo(0, y * pixelSize)
      ctx.lineTo(width * pixelSize, y * pixelSize)
    }
    ctx.strokeStyle = "#ddd"
    ctx.stroke()

    // Draw pixels
    pixels.forEach((pixel) => {
      ctx.fillStyle = pixel.color
      ctx.fillRect(pixel.x * pixelSize, pixel.y * pixelSize, pixelSize, pixelSize)
    })

    ctx.restore()
  }, [width, height, pixelSize, pixels, zoom, panOffset])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

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
    const x = Math.floor((event.clientX - rect.left - panOffset.x * zoom) / (pixelSize * zoom))
    const y = Math.floor((event.clientY - rect.top - panOffset.y * zoom) / (pixelSize * zoom))

    if (x < 0 || x >= width || y < 0 || y >= height) return

    const newPixel: PixelData = { x, y, color: selectedColor, userId }
    setPixels((prevPixels) => [...prevPixels, newPixel])
    socketRef.current?.emit("pixelPlaced", newPixel)
    setCooldown(COOLDOWN_TIME)
    drawCanvas()
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setDragStart({ x: event.clientX - panOffset.x * zoom, y: event.clientY - panOffset.y * zoom })
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return

    const dx = (event.clientX - dragStart.x) / zoom
    const dy = (event.clientY - dragStart.y) / zoom
    setPanOffset({ x: dx, y: dy })
    drawCanvas()
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleZoom = (delta: number) => {
    setZoom((prevZoom) => {
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prevZoom + delta))
      return newZoom
    })
  }

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault()
    const delta = event.deltaY > 0 ? -0.1 : 0.1
    handleZoom(delta)
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width * pixelSize}
        height={height * pixelSize}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="border border-gray-300 cursor-move"
      />
      {cooldown > 0 && (
        <div className="absolute top-2 left-2 bg-white p-2 rounded shadow">Cooldown: {cooldown / 1000}s</div>
      )}
      <div className="absolute bottom-2 right-2 flex space-x-2">
        <Button onClick={() => handleZoom(0.1)} size="icon">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button onClick={() => handleZoom(-0.1)} size="icon">
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default Canvas
