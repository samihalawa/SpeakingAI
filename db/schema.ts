import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const vocabularyItems = pgTable("vocabulary_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  spanish: text("spanish").notNull(),
  chinese: text("chinese").notNull(),
  example: text("example"),
  notes: text("notes"),
  wordType: text("word_type").notNull().default('noun'),
  tags: text("tags").array(),
  theme: text("theme"),
  difficulty: text("difficulty").notNull().default('beginner'),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastReviewed: timestamp("last_reviewed", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  role: text("role").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});

export const insertVocabularySchema = createInsertSchema(vocabularyItems);
export const selectVocabularySchema = createSelectSchema(vocabularyItems);
export type InsertVocabulary = z.infer<typeof insertVocabularySchema>;
export type Vocabulary = z.infer<typeof selectVocabularySchema>;

export const insertChatMessageSchema = createInsertSchema(chatMessages);
export const selectChatMessageSchema = createSelectSchema(chatMessages);
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = z.infer<typeof selectChatMessageSchema>;
