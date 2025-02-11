"use client"

import { useState, useEffect } from "react"
import AdminPanel from "../components/AdminPanel"

export default function AdminPage() {
  const [canvasWidth, setCanvasWidth] = useState(50)
  const [canvasHeight, setCanvasHeight] = useState(50)

  useEffect(() => {
    // Fetch current canvas size from the server
    // This is a placeholder and should be replaced with actual API call
    const fetchCanvasSize = async () => {
      // const response = await fetch('/api/canvas-size');
      // const { width, height } = await response.json();
      // setCanvasWidth(width);
      // setCanvasHeight(height);
    }
    fetchCanvasSize()
  }, [])

  const handleCanvasSizeChange = (width: number, height: number) => {
    setCanvasWidth(width)
    setCanvasHeight(height)
    // Send canvas size change to the server
    // This would typically be done through your WebSocket connection or API
    console.log("Canvas size changed to", width, "x", height)
  }

  const handleClearCanvas = () => {
    // Send clear canvas command to the server
    // This would typically be done through your WebSocket connection or API
    console.log("Canvas cleared")
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
