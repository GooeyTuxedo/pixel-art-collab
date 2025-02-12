"use client"

import { useState, useEffect } from "react"
import { io, type Socket } from "socket.io-client"
import AdminPanel from "../components/AdminPanel"

export default function AdminPage() {
  const [canvasWidth, setCanvasWidth] = useState(50)
  const [canvasHeight, setCanvasHeight] = useState(50)
  const [socket, setSocket] = useState<Socket | null>(null)

  console.log(`connecting to ws server: ${process.env.NEXT_PUBLIC_WEBSOCKET_SERVER_URL}`)

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WEBSOCKET_SERVER_URL, {
      transports: ["websocket"],
    })

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server")
    })

    newSocket.on("canvasSizeChanged", (width: number, height: number) => {
      setCanvasWidth(width)
      setCanvasHeight(height)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  useEffect(() => {
    const fetchCanvasSize = async () => {
      try {
        const response = await fetch("/api/canvas-size")
        const { width, height } = await response.json()
        setCanvasWidth(width)
        setCanvasHeight(height)
      } catch (error) {
        console.error("Failed to fetch canvas size:", error)
      }
    }

    fetchCanvasSize()
  }, [])

  const handleCanvasSizeChange = async (width: number, height: number) => {
    try {
      const response = await fetch("/api/canvas-size", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ width, height }),
      })

      if (response.ok) {
        setCanvasWidth(width)
        setCanvasHeight(height)
        socket?.emit("changeCanvasSize", width, height)
      } else {
        console.error("Failed to update canvas size")
      }
    } catch (error) {
      console.error("Error updating canvas size:", error)
    }
  }

  const handleClearCanvas = () => {
    socket?.emit("clearCanvas")
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <AdminPanel
        currentWidth={canvasWidth}
        currentHeight={canvasHeight}
        onSizeChange={handleCanvasSizeChange}
        onClearCanvas={handleClearCanvas}
      />
    </div>
  )
}
