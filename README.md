# Pixel Art Collaborator

Pixel Art Collaborator is a real-time, multi-user pixel art creation platform built with Next.js, TypeScript, and WebSocket technology. It allows users to collaboratively create pixel art on a shared canvas in real-time.

## Features

- Real-time collaborative pixel placement
- Customizable canvas size
- Color palette with recently used colors
- Zoom and pan functionality
- Minimap for easy navigation
- Mobile-responsive design
- Admin panel for canvas management (accessible at `/admin`)

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Socket.IO for real-time communication
- Vercel KV for data persistence

## Project Structure

- `app/`: Contains the main application pages and components
  - `page.tsx`: Main page with the collaborative canvas
  - `admin/page.tsx`: Admin panel for canvas management
  - `components/`: Reusable React components
    - `Canvas.tsx`: Main canvas component
    - `ColorPalette.tsx`: Color selection component
    - `Minimap.tsx`: Navigation minimap component
    - `AdminPanel.tsx`: Admin controls component
- `websocket-server.ts`: WebSocket server for real-time updates

## Key Components

### Canvas

The main canvas component handles rendering the pixel grid, user interactions for placing pixels, and real-time updates from other users.

### Color Palette

Allows users to select colors for pixel placement and keeps track of recently used colors.

### Minimap

Provides a small overview of the entire canvas and allows quick navigation to different areas.

### Admin Panel

Located at `/admin`, it provides controls for changing the canvas size and clearing the canvas.

## Real-time Collaboration

The application uses Socket.IO to enable real-time collaboration. When a user places a pixel, the update is sent to the server and then broadcasted to all connected clients, ensuring that everyone sees the latest state of the canvas.

## Data Persistence

Vercel KV is used to store the canvas state, allowing the artwork to persist between sessions and server restarts.

## Scalability Considerations

- The current implementation stores individual pixel data. For larger canvases, consider optimizing data storage and transmission.
- Implement lazy loading or chunking for very large canvases to improve performance.
- Consider rate limiting and additional security measures for a production environment.

## Future Enhancements

- User authentication and authorization
- Multiple canvases or rooms
- Undo/redo functionality
- More advanced drawing tools (e.g., lines, shapes)
- Gallery for completed artworks
- Social features (e.g., chat, user profiles)


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
