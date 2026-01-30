import { users, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    this.initializeMockData();
  }

  private initializeMockData() {
    this.createUser({
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      isActive: true,
    });
    this.createUser({
      name: "Demo Member",
      email: "demo@example.com",
      role: "member",
      isActive: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    // Ensure all required fields are present, providing defaults if necessary
    // Although our schema defines defaults, in memory we must set them manually if missing
    const user: User = { 
      id, 
      name: insertUser.name,
      email: insertUser.email,
      role: insertUser.role ?? "member",
      isActive: insertUser.isActive ?? true
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;

    const updated: User = { ...existing, ...data };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
}

export const storage = new MemStorage();
