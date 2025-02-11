"use client"

import type React from "react"
import { Button } from "@/components/ui/button"

interface ColorHistoryProps {
  colors: string[]
  onColorSelect: (color: string) => void
}

const ColorHistory: React.FC<ColorHistoryProps> = ({ colors, onColorSelect }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color, index) => (
        <Button
          key={`${color}-${index}`}
          onClick={() => onColorSelect(color)}
          className="w-6 h-6 p-0 rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  )
}

export default ColorHistory
