"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import ColorHistory from "./ColorHistory"

interface ColorPaletteProps {
  colors: string[]
  selectedColor: string
  onColorSelect: (color: string) => void
  colorHistory: string[]
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ colors, selectedColor, onColorSelect, colorHistory }) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <Button
            key={color}
            onClick={() => onColorSelect(color)}
            className="w-8 h-8 p-0 rounded-full"
            style={{ backgroundColor: color }}
            variant={selectedColor === color ? "default" : "outline"}
          />
        ))}
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Recently Used Colors</h3>
        <ColorHistory colors={colorHistory} onColorSelect={onColorSelect} />
      </div>
    </div>
  )
}

export default ColorPalette
