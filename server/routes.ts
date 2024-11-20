import type { Express } from "express";
import { db } from "../db";
import { vocabularyItems, chatMessages } from "@db/schema";
import { eq } from "drizzle-orm";
import { generateChatResponse } from "./services/chat";

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
      
      // Validate input
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: "Invalid input" });
      }

      // Set proper headers for JSON with UTF-8 encoding
      res.setHeader('Content-Type', 'application/json; charset=utf-8');

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
      const errorMessage = error instanceof Error ? error.message : "Failed to send message";
      res.status(500).json({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      });
    }
  });
}
