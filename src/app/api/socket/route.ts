import { createServer } from "http"
import { Server } from "socket.io"

const io = new Server({
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

const httpServer = createServer()
io.attach(httpServer)

export async function GET(request: Request) {
  // Handle WebSocket upgrade
  const upgrade = request.headers.get("upgrade")
  if (upgrade?.toLowerCase() !== "websocket") {
    return new Response("Expected websocket", { status: 426 })
  }

  try {
    // Start the server if it hasn't been started
    if (!httpServer.listening) {
      httpServer.listen(3001)
    }

    return new Response(null, {
      status: 101,
      headers: {
        Upgrade: "websocket",
        Connection: "Upgrade",
      },
    })
  } catch (error) {
    console.error("WebSocket error:", error)
    return new Response("WebSocket error", { status: 500 })
  }
}

export const config = {
  runtime: "edge",
}
