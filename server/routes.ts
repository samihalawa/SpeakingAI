import type { Express } from "express";
import { db } from "../db";
import { vocabularyItems, chatMessages } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express) {
  // Vocabulary routes
  app.get("/api/vocabulary", async (req, res) => {
    try {
      const items = await db.select().from(vocabularyItems).orderBy(vocabularyItems.createdAt);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vocabulary" });
    }
  });

  app.post("/api/vocabulary", async (req, res) => {
    try {
      const [item] = await db.insert(vocabularyItems).values(req.body).returning();
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to add vocabulary" });
    }
  });

  // Chat routes
  app.get("/api/chat/messages", async (req, res) => {
    try {
      const messages = await db.select().from(chatMessages).orderBy(chatMessages.timestamp);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat/send", async (req, res) => {
    try {
      const { content } = req.body;
      const [userMessage] = await db
        .insert(chatMessages)
        .values({ content, role: "user" })
        .returning();

      // Generate AI response with vocabulary detection
      const { content: responseContent, detectedVocabulary } = await generateChatResponse(content);
      
      const [assistantMessage] = await db
        .insert(chatMessages)
        .values({
          content: responseContent,
          role: "assistant",
        })
        .returning();

      res.json({
        message: userMessage,
        response: assistantMessage,
        detectedVocabulary,
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });
}
