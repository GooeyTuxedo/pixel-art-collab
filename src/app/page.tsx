"use client"

import { useState, useEffect } from "react"
import Canvas from "./components/Canvas"
import ColorPalette from "./components/ColorPalette"

const colors = ["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFFFFF"]

export default function Home() {
  const [selectedColor, setSelectedColor] = useState(colors[0])
  const [userId, setUserId] = useState<string | null>(null)
  const [colorHistory, setColorHistory] = useState<string[]>([])
  const [canvasWidth, setCanvasWidth] = useState(50)
  const [canvasHeight, setCanvasHeight] = useState(50)

  useEffect(() => {
    // Generate a random user ID if one doesn't exist
    const storedUserId = sessionStorage.getItem("pixelArtUserId")
    if (storedUserId) {
      setUserId(storedUserId)
    } else {
      const newUserId = Math.random().toString(36).substr(2, 9)
      sessionStorage.setItem("pixelArtUserId", newUserId)
      setUserId(newUserId)
    }

    // Load color history from local storage
    const storedColorHistory = localStorage.getItem("colorHistory")
    if (storedColorHistory) {
      setColorHistory(JSON.parse(storedColorHistory))
    }

    // Fetch initial canvas size
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

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    const updatedHistory = [color, ...colorHistory.filter((c) => c !== color)].slice(0, 10)
    setColorHistory(updatedHistory)
    localStorage.setItem("colorHistory", JSON.stringify(updatedHistory))
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8">
      <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8">Pixel Art Collaborator</h1>
      {userId && (
        <div className="w-full max-w-3xl">
          <Canvas
            initialWidth={canvasWidth}
            initialHeight={canvasHeight}
            pixelSize={10}
            userId={userId}
            selectedColor={selectedColor}
          />
          <div className="mt-4">
            <ColorPalette
              colors={colors}
              selectedColor={selectedColor}
              onColorSelect={handleColorSelect}
              colorHistory={colorHistory}
            />
          </div>
        </div>
      )}
    </main>
  )
}
