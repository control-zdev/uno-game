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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private rooms: Map<string, Room>;
  private gameStates: Map<string, GameState>;
  private chatMessages: Map<string, ChatMessage[]>;
  private gameStats: Map<number, GameStatsType>;
  private userAchievements: Map<number, Achievement[]>;
  private connectedPlayers: Map<string, Set<string>>;
  private currentUserId: number;
  private achievements: Achievement[] = [];

  constructor() {
    this.users = new Map();
    this.rooms = new Map();
    this.gameStates = new Map();
    this.chatMessages = new Map();
    this.gameStats = new Map();
    this.userAchievements = new Map();
    this.connectedPlayers = new Map();
    this.currentUserId = 1;
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
      { id: 'skip_specialist', name: 'Skip Specialist', description: 'Play 30 skip cards', icon: 'forward', unlocked: false },
      { id: 'reverse_master', name: 'Reverse Master', description: 'Play 30 reverse cards', icon: 'undo', unlocked: false },
      { id: 'draw_dealer', name: 'Draw Dealer', description: 'Make opponents draw 100 cards', icon: 'plus', unlocked: false },
      { id: 'perfect_game', name: 'Perfect Game', description: 'Win without drawing any cards', icon: 'star', unlocked: false },
      { id: 'marathon_player', name: 'Marathon Player', description: 'Play for 2 hours straight', icon: 'clock', unlocked: false },
      { id: 'ai_destroyer', name: 'AI Destroyer', description: 'Beat all AI personalities', icon: 'robot', unlocked: false },
      { id: 'room_creator', name: 'Room Creator', description: 'Create 10 game rooms', icon: 'door-open', unlocked: false },
      { id: 'level_master', name: 'Level Master', description: 'Reach level 25', icon: 'chart-line', unlocked: false },
      { id: 'krabby_patty', name: 'Krabby Patty Champion', description: 'Win 100 games', icon: 'burger', unlocked: false }
    ];
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      wins: 0,
      games: 0,
      level: 1,
      experience: 0,
      achievements: [],
      createdAt: new Date(),
    };
    this.users.set(id, user);
    
    // Initialize user achievements
    this.userAchievements.set(id, this.achievements.map(a => ({ ...a })));
    
    // Initialize user stats
    this.gameStats.set(id, {
      id: 0,
      userId: id,
      roomId: '',
      cardsPlayed: 0,
      unoCalls: 0,
      wildCardsPlayed: 0,
      gamesWon: 0,
      tournamentWins: 0,
      createdAt: new Date(),
    });
    
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getRoom(id: string): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const id = Math.random().toString(36).substring(2, 15);
    const room: Room = {
      id,
      name: insertRoom.name,
      password: insertRoom.password || null,
      maxPlayers: insertRoom.maxPlayers || 4,
      isActive: true,
      settings: insertRoom.settings || {},
      createdBy: null,
      createdAt: new Date(),
    };
    this.rooms.set(id, room);
    this.chatMessages.set(id, []);
    this.connectedPlayers.set(id, new Set());
    return room;
  }

  async getRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values()).filter(room => room.isActive);
  }

  async deleteRoom(id: string): Promise<boolean> {
    const room = this.rooms.get(id);
    if (!room) return false;
    
    // Remove room from storage
    this.rooms.delete(id);
    
    // Clean up related data
    this.gameStates.delete(id);
    this.chatMessages.delete(id);
    this.connectedPlayers.delete(id);
    
    return true;
  }

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room | undefined> {
    const room = this.rooms.get(id);
    if (!room) return undefined;
    
    const updatedRoom = { ...room, ...updates };
    this.rooms.set(id, updatedRoom);
    return updatedRoom;
  }



  async getGameState(roomId: string): Promise<GameState | undefined> {
    return this.gameStates.get(roomId);
  }

  async setGameState(roomId: string, gameState: GameState): Promise<void> {
    this.gameStates.set(roomId, gameState);
  }

  async deleteGameState(roomId: string): Promise<boolean> {
    return this.gameStates.delete(roomId);
  }

  async getChatMessages(roomId: string): Promise<ChatMessage[]> {
    return this.chatMessages.get(roomId) || [];
  }

  async addChatMessage(roomId: string, message: ChatMessage): Promise<void> {
    const messages = this.chatMessages.get(roomId) || [];
    messages.push(message);
    this.chatMessages.set(roomId, messages);
  }

  async getGameStats(userId: number): Promise<GameStatsType | undefined> {
    return this.gameStats.get(userId);
  }

  async updateGameStats(userId: number, stats: Partial<InsertGameStats>): Promise<void> {
    const existing = this.gameStats.get(userId);
    if (existing) {
      this.gameStats.set(userId, { ...existing, ...stats });
    }
  }

  async getUserAchievements(userId: number): Promise<Achievement[]> {
    return this.userAchievements.get(userId) || [];
  }

  async unlockAchievement(userId: number, achievementId: string): Promise<void> {
    const achievements = this.userAchievements.get(userId) || [];
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      achievement.unlockedAt = new Date();
      this.userAchievements.set(userId, achievements);
    }
  }

  async addConnectedPlayer(roomId: string, playerId: string): Promise<void> {
    const players = this.connectedPlayers.get(roomId) || new Set();
    players.add(playerId);
    this.connectedPlayers.set(roomId, players);
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
