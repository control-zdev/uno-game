import { users, rooms, gameStats, type User, type InsertUser, type Room, type InsertRoom, type GameStatsType, type InsertGameStats, type GameState, type Player, type ChatMessage, type Achievement } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Room management
  getRoom(id: string): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  getRooms(): Promise<Room[]>;
  updateRoom(id: string, updates: Partial<Room>): Promise<Room | undefined>;
  deleteRoom(id: string): Promise<boolean>;
  
  // Game state management
  getGameState(roomId: string): Promise<GameState | undefined>;
  setGameState(roomId: string, gameState: GameState): Promise<void>;
  deleteGameState(roomId: string): Promise<boolean>;
  
  // Chat management
  getChatMessages(roomId: string): Promise<ChatMessage[]>;
  addChatMessage(roomId: string, message: ChatMessage): Promise<void>;
  
  // Statistics
  getGameStats(userId: number): Promise<GameStatsType | undefined>;
  updateGameStats(userId: number, stats: Partial<InsertGameStats>): Promise<void>;
  
  // Achievements
  getUserAchievements(userId: number): Promise<Achievement[]>;
  unlockAchievement(userId: number, achievementId: string): Promise<void>;
  
  // Connected players
  addConnectedPlayer(roomId: string, playerId: string): Promise<void>;
  removeConnectedPlayer(roomId: string, playerId: string): Promise<void>;
  getConnectedPlayers(roomId: string): Promise<string[]>;
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  private gameStates: Map<string, GameState> = new Map();
  private chatMessages: Map<string, ChatMessage[]> = new Map();
  private connectedPlayers: Map<string, Set<string>> = new Map();
  private achievements: Achievement[] = [];

  constructor() {
    this.initializeAchievements();
  }

  private initializeAchievements(): void {
    this.achievements = [
      { id: 'first_win', name: 'First Victory', description: 'Win your first game', icon: 'trophy', unlocked: false },
      { id: 'card_master', name: 'Card Master', description: 'Play 100 cards', icon: 'cards-blank', unlocked: false },
      { id: 'speed_player', name: 'Speed Demon', description: 'Win a game in under 5 minutes', icon: 'bolt', unlocked: false },
      { id: 'uno_master', name: 'Uno Master', description: 'Successfully call Uno 50 times', icon: 'crown', unlocked: false },
      { id: 'tournament_champion', name: 'Tournament Champion', description: 'Win a tournament', icon: 'medal', unlocked: false },
      { id: 'wild_wizard', name: 'Wild Wizard', description: 'Play 50 wild cards', icon: 'magic', unlocked: false },
      { id: 'social_butterfly', name: 'Social Butterfly', description: 'Send 100 chat messages', icon: 'comments', unlocked: false },
      { id: 'comeback_king', name: 'Comeback King', description: 'Win with 10+ cards in hand', icon: 'phoenix', unlocked: false },
      { id: 'streak_master', name: 'Streak Master', description: 'Win 5 games in a row', icon: 'fire', unlocked: false },
      { id: 'patient_player', name: 'Patient Player', description: 'Draw 20 cards in a single game', icon: 'hourglass', unlocked: false },
      { id: 'color_changer', name: 'Color Changer', description: 'Change colors 25 times with wild cards', icon: 'palette', unlocked: false },
      { id: 'night_owl', name: 'Night Owl', description: 'Play a game after midnight', icon: 'moon', unlocked: false },
      { id: 'early_bird', name: 'Early Bird', description: 'Play a game before 6 AM', icon: 'sunrise', unlocked: false },
      { id: 'social_gamer', name: 'Social Gamer', description: 'Play with 10 different players', icon: 'users', unlocked: false },
      { id: 'perfectionist', name: 'Perfectionist', description: 'Win without drawing a single card', icon: 'star', unlocked: false },
      { id: 'marathon_player', name: 'Marathon Player', description: 'Play for 2 hours straight', icon: 'clock', unlocked: false },
      { id: 'card_shark', name: 'Card Shark', description: 'Win 50 games total', icon: 'shark', unlocked: false },
      { id: 'lucky_seven', name: 'Lucky Seven', description: 'Win 7 games in a row', icon: 'clover', unlocked: false },
      { id: 'uno_champion', name: 'Uno Champion', description: 'Win 100 games total', icon: 'crown-gold', unlocked: false },
      { id: 'legend', name: 'Bikini Bottom Legend', description: 'Unlock all other achievements', icon: 'legend', unlocked: false }
    ];
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Room management
  async getRoom(id: string): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room || undefined;
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const id = Math.random().toString(36).substring(2, 15);
    const [room] = await db
      .insert(rooms)
      .values({
        id,
        name: insertRoom.name,
        password: insertRoom.password || null,
        maxPlayers: insertRoom.maxPlayers || 4,
        isActive: true,
        settings: insertRoom.settings || {},
        createdBy: null,
        createdAt: new Date(),
      })
      .returning();
    
    // Initialize in-memory collections for this room
    this.chatMessages.set(id, []);
    this.connectedPlayers.set(id, new Set());
    return room;
  }

  async getRooms(): Promise<Room[]> {
    return await db.select().from(rooms).where(eq(rooms.isActive, true));
  }

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room | undefined> {
    const [room] = await db
      .update(rooms)
      .set(updates)
      .where(eq(rooms.id, id))
      .returning();
    return room || undefined;
  }

  async deleteRoom(id: string): Promise<boolean> {
    const result = await db.delete(rooms).where(eq(rooms.id, id));
    
    // Clean up related in-memory data
    this.gameStates.delete(id);
    this.chatMessages.delete(id);
    this.connectedPlayers.delete(id);
    
    return (result.rowCount || 0) > 0;
  }

  // Game state management (still in-memory for performance)
  async getGameState(roomId: string): Promise<GameState | undefined> {
    return this.gameStates.get(roomId);
  }

  async setGameState(roomId: string, gameState: GameState): Promise<void> {
    this.gameStates.set(roomId, gameState);
  }

  async deleteGameState(roomId: string): Promise<boolean> {
    return this.gameStates.delete(roomId);
  }

  // Chat management (in-memory for real-time performance)
  async getChatMessages(roomId: string): Promise<ChatMessage[]> {
    return this.chatMessages.get(roomId) || [];
  }

  async addChatMessage(roomId: string, message: ChatMessage): Promise<void> {
    const messages = this.chatMessages.get(roomId) || [];
    messages.push(message);
    this.chatMessages.set(roomId, messages);
  }

  // Statistics
  async getGameStats(userId: number): Promise<GameStatsType | undefined> {
    const [stats] = await db.select().from(gameStats).where(eq(gameStats.userId, userId));
    return stats || undefined;
  }

  async updateGameStats(userId: number, stats: Partial<InsertGameStats>): Promise<void> {
    const existing = await this.getGameStats(userId);
    if (existing) {
      await db
        .update(gameStats)
        .set(stats)
        .where(eq(gameStats.userId, userId));
    } else {
      await db
        .insert(gameStats)
        .values({
          userId,
          cardsPlayed: 0,
          gamesWon: 0,
          unoCalls: 0,
          wildCardsPlayed: 0,
          tournamentWins: 0,
          ...stats,
        });
    }
  }

  // Achievements (in-memory)
  async getUserAchievements(userId: number): Promise<Achievement[]> {
    return this.achievements.filter(a => a.unlocked);
  }

  async unlockAchievement(userId: number, achievementId: string): Promise<void> {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (achievement) {
      achievement.unlocked = true;
    }
  }

  // Connected players (in-memory for real-time)
  async addConnectedPlayer(roomId: string, playerId: string): Promise<void> {
    if (!this.connectedPlayers.has(roomId)) {
      this.connectedPlayers.set(roomId, new Set());
    }
    this.connectedPlayers.get(roomId)!.add(playerId);
  }

  async removeConnectedPlayer(roomId: string, playerId: string): Promise<void> {
    const players = this.connectedPlayers.get(roomId);
    if (players) {
      players.delete(playerId);
    }
  }

  async getConnectedPlayers(roomId: string): Promise<string[]> {
    const players = this.connectedPlayers.get(roomId);
    return players ? Array.from(players) : [];
  }
}

export const storage = new DatabaseStorage();