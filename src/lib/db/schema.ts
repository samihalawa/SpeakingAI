import { sql } from "drizzle-orm";
import { 
  text, 
  timestamp, 
  pgTable, 
  serial, 
  json 
} from "drizzle-orm/pg-core";

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  role: text('role').notNull(),
  createdAt: timestamp('created_at').default(sql`NOW()`),
  metadata: json('metadata').$type<{
    translation?: string;
    vocabulary?: Array<{
      word: string;
      translation: string;
      type: string;
    }>;
  }>()
});

export const vocabulary = pgTable('vocabulary', {
  id: serial('id').primaryKey(),
  word: text('word').notNull(),
  translation: text('translation').notNull(),
  type: text('type').notNull(),
  examples: json('examples').$type<string[]>(),
  createdAt: timestamp('created_at').default(sql`NOW()`),
  lastReviewed: timestamp('last_reviewed').default(sql`NOW()`)
}); 