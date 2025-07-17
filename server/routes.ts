import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { GameEngine } from "./game-engine";
import { AIController } from "./ai-controller";
import { insertUserSchema, insertRoomSchema, Player, ChatMessage } from "@shared/schema";
import { z } from "zod";
import { isMessageAppropriate, filterProfanity } from "./profanity-filter";

const gameEngine = new GameEngine();
const aiController = new AIController();

// WebSocket connections by room
const roomConnections = new Map<string, Map<string, WebSocket>>();

// Track if players have already been announced as joined
const announcedJoins = new Map<string, Set<string>>();

export async function registerRoutes(app: Express): Promise<Server> {
  // User authentication
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.json({ user: { id: user.id, username: user.username, level: user.level } });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ user: { id: user.id, username: user.username, level: user.level } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Room management
  app.get("/api/rooms", async (req, res) => {
    try {
      const rooms = await storage.getRooms();
      res.json({ rooms });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });

  app.post("/api/rooms", async (req, res) => {
    try {
      const roomData = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(roomData);
      res.json({ room });
    } catch (error) {
      res.status(400).json({ message: "Invalid room data" });
    }
  });

  app.get("/api/rooms/:id", async (req, res) => {
    try {
      const room = await storage.getRoom(req.params.id);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json({ room });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch room" });
    }
  });

  app.delete("/api/rooms/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteRoom(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json({ message: "Room deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete room" });
    }
  });

  // Game state
  app.get("/api/game/:roomId", async (req, res) => {
    try {
      const gameState = await gameEngine.getGameState(req.params.roomId);
      if (!gameState) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json({ gameState });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game state" });
    }
  });

  // User stats and achievements
  app.get("/api/user/:id/stats", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      const stats = await storage.getGameStats(userId);
      const achievements = await storage.getUserAchievements(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ user, stats, achievements });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.get("/api/chat/:roomId", async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.roomId);
      res.json({ messages });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time game communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    let roomId: string | undefined;
    let playerId: string | undefined;

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'join_room':
            roomId = message.roomId;
            playerId = message.playerId;
            
            if (!roomId || !playerId) {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Missing roomId or playerId'
              }));
              break;
            }
            
            if (!roomConnections.has(roomId)) {
              roomConnections.set(roomId, new Map());
            }
            
            roomConnections.get(roomId)!.set(playerId, ws);
            await storage.addConnectedPlayer(roomId, playerId);
            
            // Initialize announced joins for room if not exists
            if (!announcedJoins.has(roomId)) {
              announcedJoins.set(roomId, new Set());
            }
            
            // Only broadcast join if player hasn't been announced before
            const roomAnnounced = announcedJoins.get(roomId)!;
            if (!roomAnnounced.has(playerId)) {
              roomAnnounced.add(playerId);
              broadcastToRoom(roomId, {
                type: 'player_joined',
                playerId,
                username: message.username,
              });
            }
            
            // Send current game state
            const gameState = await gameEngine.getGameState(roomId);
            if (gameState) {
              ws.send(JSON.stringify({
                type: 'game_state',
                gameState,
              }));
            }
            break;

          case 'start_game':
            if (roomId) {
              const room = await storage.getRoom(roomId);
              if (room) {
                const connectedPlayers = await storage.getConnectedPlayers(roomId);
                const players: Player[] = [];
                
                // Add human players
                for (const pId of connectedPlayers) {
                  const user = await storage.getUser(parseInt(pId));
                  if (user) {
                    players.push({
                      id: pId,
                      username: user.username,
                      hand: [],
                      isAI: false,
                      saidUno: false,
                      isConnected: true,
                      stats: {
                        cardsPlayed: 0,
                        unoCalls: 0,
                        wildCardsPlayed: 0,
                        gamesWon: 0,
                      }
                    });
                  }
                }
                
                // Fill with AI players if needed
                const aiPersonalities = ['spongebob', 'patrick', 'squidward', 'krabs', 'sandy', 'plankton'];
                while (players.length < (room.maxPlayers || 4)) {
                  const personality = aiController.getRandomPersonality();
                  const aiId = `ai_${Math.random().toString(36).substring(2, 15)}`;
                  
                  players.push({
                    id: aiId,
                    username: `${aiController.getPersonalityDisplayName(personality)} (AI)`,
                    hand: [],
                    isAI: true,
                    aiPersonality: personality,
                    saidUno: false,
                    isConnected: true,
                    stats: {
                      cardsPlayed: 0,
                      unoCalls: 0,
                      wildCardsPlayed: 0,
                      gamesWon: 0,
                    }
                  });
                }
                
                const gameSettings = {
                  maxPlayers: room.maxPlayers || 4,
                  tournamentMode: true,
                  tournamentTarget: 6,
                  aiDifficulty: 'medium' as const,
                  enableChat: true,
                  enableAchievements: true,
                  ...room.settings as any,
                };
                
                const gameState = await gameEngine.initializeGame(roomId, players, gameSettings);
                
                broadcastToRoom(roomId, {
                  type: 'game_started',
                  gameState,
                });
              }
            }
            break;

          case 'play_card':
            if (roomId && playerId) {
              const result = await gameEngine.playCard(
                roomId,
                playerId,
                message.cardId,
                message.chosenColor
              );
              
              if (result.success && result.gameState) {
                broadcastToRoom(roomId, {
                  type: 'game_state',
                  gameState: result.gameState,
                });
              }
              
              ws.send(JSON.stringify({
                type: 'play_card_result',
                success: result.success,
                message: result.message,
              }));
            }
            break;

          case 'draw_card':
            if (roomId && playerId) {
              const result = await gameEngine.drawCard(roomId, playerId);
              
              if (result.success && result.gameState) {
                broadcastToRoom(roomId, {
                  type: 'game_state',
                  gameState: result.gameState,
                });
              }
              
              ws.send(JSON.stringify({
                type: 'draw_card_result',
                success: result.success,
                message: result.message,
                card: result.card,
              }));
            }
            break;

          case 'say_uno':
            if (roomId && playerId) {
              const result = await gameEngine.sayUno(roomId, playerId);
              
              ws.send(JSON.stringify({
                type: 'uno_result',
                success: result.success,
                message: result.message,
              }));
              
              if (result.success) {
                broadcastToRoom(roomId, {
                  type: 'uno_called',
                  playerId,
                });
              }
            }
            break;

          case 'chat_message':
            if (roomId && playerId) {
              // Check if message is appropriate
              if (!isMessageAppropriate(message.message)) {
                ws.send(JSON.stringify({
                  type: 'chat_error',
                  message: 'Message contains inappropriate content and was not sent.',
                }));
                break;
              }

              const chatMessage: ChatMessage = {
                id: Math.random().toString(36).substring(2, 15),
                playerId,
                username: message.username,
                message: filterProfanity(message.message),
                type: message.messageType || 'message',
                timestamp: new Date(),
              };
              
              await storage.addChatMessage(roomId, chatMessage);
              
              broadcastToRoom(roomId, {
                type: 'new_chat_message',
                message: chatMessage,
              });
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
        }));
      }
    });

    ws.on('close', async () => {
      if (roomId && playerId) {
        await storage.removeConnectedPlayer(roomId, playerId);
        
        const roomConnections_map = roomConnections.get(roomId);
        if (roomConnections_map) {
          roomConnections_map.delete(playerId);
          
          if (roomConnections_map.size === 0) {
            roomConnections.delete(roomId);
          }
        }
        
        broadcastToRoom(roomId, {
          type: 'player_left',
          playerId,
        });
      }
    });
  });

  function broadcastToRoom(roomId: string, message: any) {
    const connections = roomConnections.get(roomId);
    if (connections) {
      const messageStr = JSON.stringify(message);
      connections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(messageStr);
        }
      });
    }
  }

  return httpServer;
}
