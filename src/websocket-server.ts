import { Server } from "socket.io"
import { createServer } from "http"

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

io.on("connection", (socket) => {
  console.log("Client connected")

  socket.on("joinRoom", (userId: string) => {
    socket.join(userId)
    console.log(`User ${userId} joined`)
  })

  socket.on("pixelPlaced", (pixelData) => {
    socket.broadcast.emit("updatePixel", pixelData)
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected")
  })
})

const PORT = 3001
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`)
})
