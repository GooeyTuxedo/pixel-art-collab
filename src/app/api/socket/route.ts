import { Server } from "socket.io"
import type { PixelData } from "../../types/canvas"

const ioHandler = (req: any, res: any) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on("connection", (socket) => {
      console.log("New client connected")

      socket.on("joinRoom", (userId: string) => {
        socket.join(userId)
        console.log(`User ${userId} joined`)
      })

      socket.on("pixelPlaced", (pixelData: PixelData) => {
        socket.broadcast.emit("updatePixel", pixelData)
      })

      socket.on("disconnect", () => {
        console.log("Client disconnected")
      })
    })
  }
  res.end()
}

export const config = {
  runtime: "edge",
}

export default ioHandler
