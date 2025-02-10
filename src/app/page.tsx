"use client"

import { useState } from "react"
import Canvas from "./components/Canvas"
import ColorPalette from "./components/ColorPalette"

const colors = ["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFFFFF"]

export default function Home() {
  const [selectedColor, setSelectedColor] = useState(colors[0])

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Pixel Art Collaborator</h1>
      <Canvas width={50} height={50} pixelSize={10} />
      <div className="mt-4">
        <ColorPalette colors={colors} onColorSelect={setSelectedColor} />
      </div>
    </main>
  )
}
