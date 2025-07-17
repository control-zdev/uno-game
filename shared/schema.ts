import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  wins: integer("wins").default(0),
  games: integer("games").default(0),
  level: integer("level").default(1),
  experience: integer("experience").default(0),
  achievements: jsonb("achievements").default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rooms = pgTable("rooms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  password: text("password"),
  maxPlayers: integer("max_players").default(4),
  isActive: boolean("is_active").default(true),
  settings: jsonb("settings").default({}),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gameStats = pgTable("game_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  roomId: text("room_id").references(() => rooms.id),
  cardsPlayed: integer("cards_played").default(0),
  unoCalls: integer("uno_calls").default(0),
  wildCardsPlayed: integer("wild_cards_played").default(0),
  gamesWon: integer("games_won").default(0),
  tournamentWins: integer("tournament_wins").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Card = {
  id: string;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'wild';
  value: string | number;
  type: 'number' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4';
};

export type GameState = {
  id: string;
  players: Player[];
  currentPlayer: number;
  direction: 1 | -1;
  deck: Card[];
  discardPile: Card[];
  currentCard: Card;
  gamePhase: 'waiting' | 'playing' | 'finished';
  tournamentWins: { [playerId: string]: number };
  settings: GameSettings;
};

export type Player = {
  id: string;
  username: string;
  hand: Card[];
  isAI: boolean;
  aiPersonality?: string;
  saidUno: boolean;
  isConnected: boolean;
  stats: PlayerStats;
};

export type PlayerStats = {
  cardsPlayed: number;
  unoCalls: number;
  wildCardsPlayed: number;
  gamesWon: number;
};

export type GameSettings = {
  maxPlayers: number;
  tournamentMode: boolean;
  tournamentTarget: number;
  aiDifficulty: 'easy' | 'medium' | 'hard';
  enableChat: boolean;
  enableAchievements: boolean;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
};

export type ChatMessage = {
  id: string;
  playerId: string;
  username: string;
  message: string;
  type: 'message' | 'system' | 'emoji';
  timestamp: Date;
};

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertRoomSchema = createInsertSchema(rooms).pick({
  name: true,
  password: true,
  maxPlayers: true,
  settings: true,
});

export const insertGameStatsSchema = createInsertSchema(gameStats).pick({
  userId: true,
  roomId: true,
  cardsPlayed: true,
  unoCalls: true,
  wildCardsPlayed: true,
  gamesWon: true,
  tournamentWins: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;
export type InsertGameStats = z.infer<typeof insertGameStatsSchema>;
export type GameStatsType = typeof gameStats.$inferSelect;
