"use client"

import type React from "react"
import { ChangeEvent, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AdminPanelProps {
  currentWidth: number
  currentHeight: number
  onSizeChange: (width: number, height: number) => void
  onClearCanvas: () => void
}

const AdminPanel: React.FC<AdminPanelProps> = ({ currentWidth, currentHeight, onSizeChange, onClearCanvas }) => {
  const [newWidth, setNewWidth] = useState(currentWidth)
  const [newHeight, setNewHeight] = useState(currentHeight)

  useEffect(() => {
    setNewWidth(currentWidth)
    setNewHeight(currentHeight)
  }, [currentWidth, currentHeight])

  const handleSizeChange = () => {
    onSizeChange(newWidth, newHeight)
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
      <div className="space-y-4">
        <div className="flex space-x-4">
          <div>
            <Label htmlFor="width">Width</Label>
            <Input
              id="width"
              type="number"
              value={newWidth}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewWidth(Number(e.target.value))}
              min={1}
              max={1000}
            />
          </div>
          <div>
            <Label htmlFor="height">Height</Label>
            <Input
              id="height"
              type="number"
              value={newHeight}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewHeight(Number(e.target.value))}
              min={1}
              max={1000}
            />
          </div>
        </div>
        <Button onClick={handleSizeChange}>Change Canvas Size</Button>
        <Button onClick={onClearCanvas} variant="destructive">
          Clear Canvas
        </Button>
      </div>
    </div>
  )
}

export default AdminPanel
