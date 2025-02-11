"use client"

import type React from "react"

interface ColorPaletteProps {
  colors: string[]
  onColorSelect: (color: string) => void
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ colors, onColorSelect }) => {
  return (
    <div className="flex space-x-2 border-1 border-black">
      {colors.map((color) => (
        <button
          key={color}
          className="w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          style={{ backgroundColor: color }}
          onClick={() => onColorSelect(color)}
        />
      ))}
    </div>
  )
}

export default ColorPalette
