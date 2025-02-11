"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import type { PixelData } from "../types/canvas"
import io, { type Socket } from "socket.io-client"
import { ZoomIn, ZoomOut, Move } from "lucide-react"
import { Button } from "@/components/ui/button"
import Minimap from "./Minimap"

interface CanvasProps {
  width: number
  height: number
  pixelSize: number
  userId: string
  selectedColor: string
  onSizeChange: (width: number, height: number) => void
}

const COOLDOWN_TIME = 5000 // 5 seconds cooldown
const MIN_ZOOM = 0.5
const MAX_ZOOM = 5

const Canvas: React.FC<CanvasProps> = ({ width, height, pixelSize, userId, selectedColor, onSizeChange }) => {
  const [pixels, setPixels] = useState<PixelData[]>([])
  const [cooldown, setCooldown] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isPanMode, setIsPanMode] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket>(null)

  useEffect(() => {
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

    socketRef.current.on("initialState", (initialPixels: PixelData[]) => {
      setPixels(initialPixels)
    })

    socketRef.current.on("updatePixel", (pixelData: PixelData) => {
      setPixels((prevPixels) => [...prevPixels, pixelData])
    })

    socketRef.current.on("canvasSizeChanged", (newWidth: number, newHeight: number) => {
      console.log("Canvas size changed:", newWidth, newHeight)
      onSizeChange(newWidth, newHeight)
    })

    socketRef.current.on("canvasCleared", () => {
      console.log("Canvas cleared")
      setPixels([])
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [userId, onSizeChange])

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
    if (cooldown > 0 || isPanMode) {
      const timer = setTimeout(() => setCooldown(cooldown - 1000), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (cooldown > 0 || isPanMode) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const clickX = (event.clientX - rect.left) * scaleX
    const clickY = (event.clientY - rect.top) * scaleY

    const x = Math.floor((clickX / zoom - panOffset.x) / pixelSize)
    const y = Math.floor((clickY / zoom - panOffset.y) / pixelSize)

    if (x < 0 || x >= width || y < 0 || y >= height) return

    const newPixel: PixelData = { x, y, color: selectedColor, userId }
    setPixels((prevPixels) => [...prevPixels, newPixel])
    socketRef.current?.emit("pixelPlaced", newPixel)
    setCooldown(COOLDOWN_TIME)
    drawCanvas()
  }

  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    if (event.touches.length === 1) {
      const touch = event.touches[0]
      setIsDragging(true)
      setDragStart({ x: touch.clientX, y: touch.clientY })
    }
  }

  const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    if (isDragging && event.touches.length === 1) {
      const touch = event.touches[0]
      const dx = (touch.clientX - dragStart.x) / zoom
      const dy = (touch.clientY - dragStart.y) / zoom
      setPanOffset({ x: dx, y: dy })
      drawCanvas()
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanMode) {
      setIsDragging(true)
      setDragStart({ x: event.clientX, y: event.clientY })
    }
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging && isPanMode) {
      const dx = (event.clientX - dragStart.x) / zoom
      const dy = (event.clientY - dragStart.y) / zoom
      setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }))
      setDragStart({ x: event.clientX, y: event.clientY })
      drawCanvas()
    }
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

  const handleMinimapNavigate = (x: number, y: number) => {
    if (!containerRef.current) return

    const containerWidth = containerRef.current.clientWidth
    const containerHeight = containerRef.current.clientHeight

    const newPanOffset = {
      x: -x * pixelSize + containerWidth / (2 * zoom),
      y: -y * pixelSize + containerHeight / (2 * zoom),
    }

    setPanOffset(newPanOffset)
    drawCanvas()
  }

  return (
    <div className="relative" ref={containerRef}>
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`border border-gray-300 ${isPanMode ? "cursor-move" : "cursor-crosshair"} w-full h-auto max-w-full max-h-[70vh]`}
      />
      {cooldown > 0 && (
        <div className="absolute top-2 left-2 bg-white p-2 rounded shadow">Cooldown: {cooldown / 1000}s</div>
      )}
      <div className="absolute bottom-2 right-2 flex flex-col space-y-2">
        <Button onClick={() => handleZoom(0.1)} size="icon">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button onClick={() => handleZoom(-0.1)} size="icon">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button onClick={() => setIsPanMode(!isPanMode)} size="icon" variant={isPanMode ? "default" : "outline"}>
          <Move className="h-4 w-4" />
        </Button>
        <Minimap
          width={width}
          height={height}
          pixels={pixels}
          viewportWidth={containerRef.current?.clientWidth || 0}
          viewportHeight={containerRef.current?.clientHeight || 0}
          panOffset={panOffset}
          zoom={zoom}
          onNavigate={handleMinimapNavigate}
        />
      </div>
    </div>
  )
}

export default Canvas
