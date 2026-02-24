import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { aiModel } from "./ai";

export function registerRoutes(app: Express): Server {
  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // AI Chat
  app.post("/api/ai/chat", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }
    
    try {
      const response = await aiModel.generateText(prompt);
      res.json({ response });
    } catch (e) {
      res.status(500).json({ error: "AI generation failed" });
    }
  });

  // User CRUD
  
  // GET /api/users
  app.get("/api/users", async (_req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  // GET /api/users/:id
  app.get("/api/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const user = await storage.getUser(id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  });

  // POST /api/users
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (e) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // PATCH /api/users/:id
  app.patch("/api/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    try {
      const userData = insertUserSchema.partial().parse(req.body);
      const updatedUser = await storage.updateUser(id, userData);
      if (!updatedUser) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(updatedUser);
    } catch (e) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // DELETE /api/users/:id
  app.delete("/api/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const success = await storage.deleteUser(id);
    if (!success) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(204).send();
  });

  const httpServer = createServer(app);
  return httpServer;
}
