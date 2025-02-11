import "dotenv/config"

import { Server } from "socket.io"
import { createServer } from "http"
import { kv } from "@vercel/kv"
import type { PixelData } from "./app/types/canvas"

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

const CANVAS_KEY = "pixel_art_canvas"

io.on("connection", async (socket) => {
  console.log("Client connected")

  // Send initial canvas state to the client
  const canvasState = (await kv.lrange<PixelData[]>(CANVAS_KEY, 0, 9999)) || []
  socket.emit("initialState", canvasState)

  socket.on("joinRoom", (userId: string) => {
    socket.join(userId)
    console.log(`User ${userId} joined`)
  })

  socket.on("pixelPlaced", async (pixelData: PixelData) => {
    // Update the canvas state in Vercel KV
    await kv.lpush(CANVAS_KEY, JSON.stringify(pixelData))
    // Limit the stored pixels to the last 10000 (adjust as needed)
    await kv.ltrim(CANVAS_KEY, 0, 9999)

    // Broadcast the update to all clients
    socket.broadcast.emit("updatePixel", pixelData)
  })

  socket.on("changeCanvasSize", async (width: number, height: number) => {
    // Update canvas size in Vercel KV (you may want to store this separately)
    await kv.set("canvas_size", JSON.stringify({ width, height }))

    // Broadcast the canvas size change to all clients
    io.emit("canvasSizeChanged", width, height)
  })

  socket.on("clearCanvas", async () => {
    // Clear the canvas state in Vercel KV
    await kv.del(CANVAS_KEY)

    // Broadcast the canvas clear event to all clients
    io.emit("canvasCleared")
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected")
  })
})

const PORT = 3001
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`)
})
