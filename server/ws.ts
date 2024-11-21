import type { Server } from "http";
import { WebSocketServer } from "ws";
import { db } from "../db";
import { vocabularyItems } from "@db/schema";

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('WebSocket message received:', {
          type: data.type,
          timestamp: new Date().toISOString()
        });

        if (data.type === "vocabulary_update") {
          // Broadcast vocabulary updates to all clients
          const items = await db.select().from(vocabularyItems);
          console.log('Broadcasting vocabulary update:', {
            itemCount: items.length,
            timestamp: new Date().toISOString()
          });

          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: "vocabulary_update", items }));
            }
          });
        }
      } catch (error) {
        console.error("WebSocket error:", error);
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });

  return wss;
}
