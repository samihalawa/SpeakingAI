var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// db/index.ts
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  chatMessages: () => chatMessages,
  insertChatMessageSchema: () => insertChatMessageSchema,
  insertVocabularySchema: () => insertVocabularySchema,
  selectChatMessageSchema: () => selectChatMessageSchema,
  selectVocabularySchema: () => selectVocabularySchema,
  vocabularyItems: () => vocabularyItems
});
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
var vocabularyItems = pgTable("vocabulary_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  spanish: text("spanish").notNull(),
  chinese: text("chinese").notNull(),
  example: text("example"),
  notes: text("notes"),
  wordType: text("word_type").notNull().default("noun"),
  tags: text("tags").array(),
  theme: text("theme"),
  difficulty: text("difficulty").notNull().default("beginner"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastReviewed: timestamp("last_reviewed", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
var chatMessages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  role: text("role").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});
var insertVocabularySchema = createInsertSchema(vocabularyItems);
var selectVocabularySchema = createSelectSchema(vocabularyItems);
var insertChatMessageSchema = createInsertSchema(chatMessages);
var selectChatMessageSchema = createSelectSchema(chatMessages);

// db/index.ts
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var db = drizzle({
  connection: process.env.DATABASE_URL,
  schema: schema_exports,
  ws
});

// server/services/chat.ts
import OpenAI from "openai";
import { eq, or } from "drizzle-orm";
var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
var SYSTEM_PROMPT = `You are an advanced Spanish language tutor for Chinese speakers. Detect the input language and respond accordingly:

For Chinese input:
- Translate to natural Spanish
- Identify challenging vocabulary and expressions
- Explain in Chinese why certain phrases might be challenging
- Provide example sentences for complex terms

For Spanish input:
- Provide accurate Chinese translation
- Identify important vocabulary and expressions
- Include colloquial/formal usage notes in Chinese
- Give example sentences with Chinese translations

Respond in JSON format:
{
  "input_language": "chinese" | "spanish",
  "translation": "Translation in target language",
  "explanation": "\u89E3\u91CA\u7FFB\u8BD1\u9009\u62E9\u7684\u539F\u56E0\u548C\u96BE\u70B9",
  "vocabulary": [
    {
      "word": "Spanish word/phrase",
      "translation": "\u4E2D\u6587\u7FFB\u8BD1",
      "usage_type": "\u6B63\u5F0F/\u53E3\u8BED/\u4E60\u8BED",
      "explanation": "\u8BE6\u7EC6\u7684\u4E2D\u6587\u89E3\u91CA",
      "example": "Spanish example sentence",
      "example_translation": "\u4F8B\u53E5\u4E2D\u6587\u7FFB\u8BD1",
      "grammar_notes": "\u8BED\u6CD5\u8981\u70B9\u4E2D\u6587\u8BF4\u660E"
    }
  ]
}

Focus on explaining why expressions are challenging and provide detailed Chinese explanations.
All explanations must be in Chinese.`;
async function generateChatResponse(userMessage) {
  if (!userMessage || userMessage.trim().length === 0) {
    throw new Error("Message content cannot be empty");
  }
  if (userMessage.length > 1e3) {
    throw new Error("Message content is too long (max 1000 characters)");
  }
  try {
    decodeURIComponent(encodeURIComponent(userMessage));
  } catch (error) {
    throw new Error("Message contains invalid characters");
  }
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" },
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });
    if (!completion.choices?.[0]?.message?.content) {
      throw new Error("Invalid response format from OpenAI");
    }
    const responseText = new TextDecoder("utf-8").decode(
      new TextEncoder().encode(completion.choices[0].message.content)
    );
    if (!responseText) {
      throw new Error("No response received from OpenAI");
    }
    let response;
    try {
      try {
        response = JSON.parse(responseText);
        const validateChineseString = (str) => {
          if (!str) return "";
          try {
            const hasChineseChar = /[\u4E00-\u9FFF]/.test(str);
            if (hasChineseChar) {
              return new TextDecoder("utf-8").decode(
                new TextEncoder().encode(str)
              );
            }
            return str;
          } catch (e) {
            console.error("Chinese character encoding error:", e);
            return str;
          }
        };
        if (!response.input_language || !response.translation || !Array.isArray(response.vocabulary)) {
          throw new Error("Missing required fields in response");
        }
        response.translation = validateChineseString(response.translation);
        response.explanation = validateChineseString(response.explanation || "");
        response.vocabulary = response.vocabulary.map((item) => {
          if (!item.word || !item.translation) {
            throw new Error("Invalid vocabulary item structure");
          }
          return {
            ...item,
            translation: validateChineseString(item.translation),
            explanation: validateChineseString(item.explanation),
            example_translation: validateChineseString(item.example_translation),
            grammar_notes: validateChineseString(item.grammar_notes)
          };
        });
        if (!response.vocabulary.some(
          (item) => /[\u4E00-\u9FFF]/.test(item.translation) || /[\u4E00-\u9FFF]/.test(item.explanation || "")
        )) {
          console.warn("No Chinese characters found in vocabulary translations");
        }
      } catch (error) {
        console.error("JSON parsing or validation error:", error);
        throw error;
      }
    } catch (error) {
      console.error("Failed to parse or process JSON response:", error);
      response = {
        input_language: "chinese",
        translation: "\u5BF9\u4E0D\u8D77\uFF0C\u7CFB\u7EDF\u6682\u65F6\u65E0\u6CD5\u5904\u7406\u60A8\u7684\u8BF7\u6C42\u3002",
        explanation: "\u7CFB\u7EDF\u9519\u8BEF\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002",
        vocabulary: []
      };
    }
    const existingVocabulary = await db.select().from(vocabularyItems).where(
      or(...response.vocabulary.map((v) => eq(vocabularyItems.spanish, v.word.toLowerCase())))
    );
    const existingWords = new Set(existingVocabulary.map((v) => v.spanish.toLowerCase()));
    const newVocabulary = response.vocabulary.filter((v) => !existingWords.has(v.word.toLowerCase()));
    if (newVocabulary.length > 0) {
      const vocabToAdd = newVocabulary.map((v) => ({
        spanish: v.word,
        chinese: v.translation,
        example: v.example,
        notes: `${v.explanation}

\u7528\u6CD5\uFF1A${v.usage_type}
\u8BED\u6CD5\uFF1A${v.grammar_notes}`
      }));
      try {
        const addedItems = await db.insert(vocabularyItems).values(vocabToAdd).returning();
        process.send?.({
          type: "vocabulary_update",
          items: addedItems
        });
      } catch (error) {
        console.error("Error adding vocabulary items:", error);
      }
    }
    console.log("Chat processing:", {
      inputLength: userMessage.length,
      inputLanguage: response.input_language,
      translationLength: response.translation.length,
      hasExplanation: !!response.explanation,
      totalVocabularyDetected: response.vocabulary.length,
      newVocabularyCount: newVocabulary.length,
      existingVocabularyCount: response.vocabulary.length - newVocabulary.length
    });
    let content = "";
    try {
      content = decodeURIComponent(encodeURIComponent(response.translation));
      if (response.explanation) {
        const sanitizedExplanation = decodeURIComponent(encodeURIComponent(response.explanation));
        content += `

${sanitizedExplanation}`;
      }
    } catch (error) {
      console.error("Error sanitizing response content:", error);
      throw new Error("Failed to process response content");
    }
    return {
      content,
      explanation: response.explanation,
      detectedVocabulary: newVocabulary
    };
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new Error("Failed to generate chat response");
  }
}

// server/routes.ts
function registerRoutes(app2) {
  app2.get("/api/vocabulary", async (req, res) => {
    try {
      const items = await db.select().from(vocabularyItems).orderBy(vocabularyItems.createdAt);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vocabulary" });
    }
  });
  app2.post("/api/vocabulary", async (req, res) => {
    try {
      const [item] = await db.insert(vocabularyItems).values(req.body).returning();
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to add vocabulary" });
    }
  });
  app2.get("/api/chat/messages", async (req, res) => {
    try {
      const messages = await db.select().from(chatMessages).orderBy(chatMessages.timestamp);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });
  app2.post("/api/chat/send", async (req, res) => {
    try {
      const { content } = req.body;
      if (!content || typeof content !== "string") {
        return res.status(400).json({ error: "Invalid input" });
      }
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      const [userMessage] = await db.insert(chatMessages).values({ content, role: "user" }).returning();
      const { content: responseContent, detectedVocabulary } = await generateChatResponse(content);
      const [assistantMessage] = await db.insert(chatMessages).values({
        content: responseContent,
        role: "assistant"
      }).returning();
      res.json({
        message: userMessage,
        response: assistantMessage,
        detectedVocabulary
      });
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send message";
      res.status(500).json({
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? String(error) : void 0
      });
    }
  });
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "\xA1Aprende!",
        short_name: "\xA1Aprende!",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "ui-vendor": ["@radix-ui/react-context-menu", "@radix-ui/themes"],
          "motion-vendor": ["framer-motion"]
        }
      }
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});

// server/vite.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
async function setupVite(app2, server) {
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: {
      middlewareMode: true,
      hmr: { server }
    },
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html"
      );
      const template = await fs.promises.readFile(clientTemplate, "utf-8");
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import { createServer } from "http";
function log(message) {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [express] ${message}`);
}
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path2 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  registerRoutes(app);
  const server = createServer(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const PORT = 5e3;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();
