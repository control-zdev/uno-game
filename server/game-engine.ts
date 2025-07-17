import { GameState, Player, Card, GameSettings, ChatMessage } from "@shared/schema";
import { storage } from "./storage";
import { AIController } from "./ai-controller";

export class GameEngine {
  private aiController: AIController;

  constructor() {
    this.aiController = new AIController();
  }

  createDeck(): Card[] {
    const deck: Card[] = [];
    const colors = ['red', 'blue', 'green', 'yellow'] as const;
    
    // Number cards (0-9)
    colors.forEach(color => {
      // One 0 per color
      deck.push({ id: `${color}-0`, color, value: 0, type: 'number' });
      
      // Two of each number 1-9 per color
      for (let i = 1; i <= 9; i++) {
        deck.push({ id: `${color}-${i}-1`, color, value: i, type: 'number' });
        deck.push({ id: `${color}-${i}-2`, color, value: i, type: 'number' });
      }
      
      // Action cards (2 of each per color)
      deck.push({ id: `${color}-skip-1`, color, value: 'Skip', type: 'skip' });
      deck.push({ id: `${color}-skip-2`, color, value: 'Skip', type: 'skip' });
      deck.push({ id: `${color}-reverse-1`, color, value: 'Reverse', type: 'reverse' });
      deck.push({ id: `${color}-reverse-2`, color, value: 'Reverse', type: 'reverse' });
      deck.push({ id: `${color}-draw2-1`, color, value: 'Draw 2', type: 'draw2' });
      deck.push({ id: `${color}-draw2-2`, color, value: 'Draw 2', type: 'draw2' });
    });
    
    // Wild cards (4 of each)
    for (let i = 1; i <= 4; i++) {
      deck.push({ id: `wild-${i}`, color: 'wild', value: 'Wild', type: 'wild' });
      deck.push({ id: `wild4-${i}`, color: 'wild', value: 'Wild Draw 4', type: 'wild4' });
    }
    
    return this.shuffleDeck(deck);
  }

  shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  dealCards(deck: Card[], numCards: number): Card[] {
    return deck.splice(0, numCards);
  }

  async initializeGame(roomId: string, players: Player[], settings: GameSettings): Promise<GameState> {
    const deck = this.createDeck();
    const gameState: GameState = {
      id: roomId,
      players: players.map(p => ({
        ...p,
        hand: this.dealCards(deck, 7),
        saidUno: false,
        isConnected: true,
        stats: {
          cardsPlayed: 0,
          unoCalls: 0,
          wildCardsPlayed: 0,
          gamesWon: 0,
        }
      })),
      currentPlayer: 0,
      direction: 1,
      deck,
      discardPile: [],
      currentCard: this.dealCards(deck, 1)[0],
      gamePhase: 'playing',
      tournamentWins: {},
      settings
    };

    // Initialize tournament wins
    players.forEach(player => {
      gameState.tournamentWins[player.id] = 0;
    });

    await storage.setGameState(roomId, gameState);
    return gameState;
  }

  async playCard(roomId: string, playerId: string, cardId: string, chosenColor?: string): Promise<{ success: boolean; message: string; gameState?: GameState }> {
    const gameState = await storage.getGameState(roomId);
    if (!gameState) {
      return { success: false, message: "Game not found" };
    }

    const player = gameState.players.find(p => p.id === playerId);
    if (!player) {
      return { success: false, message: "Player not found" };
    }

    if (gameState.players[gameState.currentPlayer].id !== playerId) {
      return { success: false, message: "Not your turn" };
    }

    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      return { success: false, message: "Card not in hand" };
    }

    const card = player.hand[cardIndex];
    if (!this.canPlayCard(card, gameState.currentCard)) {
      return { success: false, message: "Cannot play this card" };
    }

    // Remove card from player's hand
    player.hand.splice(cardIndex, 1);
    
    // Update current card
    gameState.currentCard = { ...card };
    if (chosenColor && (card.type === 'wild' || card.type === 'wild4')) {
      gameState.currentCard.color = chosenColor as any;
    }
    
    // Add to discard pile
    gameState.discardPile.push(card);
    
    // Update player stats
    player.stats.cardsPlayed++;
    if (card.type === 'wild' || card.type === 'wild4') {
      player.stats.wildCardsPlayed++;
    }

    // Handle card effects
    await this.handleCardEffect(gameState, card, playerId);

    // Check for Uno
    if (player.hand.length === 1 && !player.saidUno) {
      // Penalty for not saying Uno
      const drawnCards = this.drawCards(gameState, 2);
      player.hand.push(...drawnCards);
      
      await this.addSystemMessage(roomId, `${player.username} forgot to say UNO! Drawing 2 cards.`);
    }

    // Check for win
    if (player.hand.length === 0) {
      await this.handleGameWin(gameState, playerId);
    } else {
      // Move to next player if no special effect changed the turn
      if (!this.wasPlayerSkipped(card)) {
        this.nextPlayer(gameState);
      }
    }

    await storage.setGameState(roomId, gameState);

    // Handle AI turns
    await this.processAITurns(roomId);

    return { success: true, message: "Card played successfully", gameState };
  }

  private canPlayCard(card: Card, currentCard: Card): boolean {
    if (card.type === 'wild' || card.type === 'wild4') {
      return true;
    }
    return card.color === currentCard.color || card.value === currentCard.value;
  }

  async drawCard(roomId: string, playerId: string): Promise<{ success: boolean; message: string; card?: Card; gameState?: GameState }> {
    const gameState = await storage.getGameState(roomId);
    if (!gameState) {
      return { success: false, message: "Game not found" };
    }

    const player = gameState.players.find(p => p.id === playerId);
    if (!player) {
      return { success: false, message: "Player not found" };
    }

    if (gameState.players[gameState.currentPlayer].id !== playerId) {
      return { success: false, message: "Not your turn" };
    }

    const drawnCards = this.drawCards(gameState, 1);
    if (drawnCards.length === 0) {
      return { success: false, message: "No cards left to draw" };
    }

    const drawnCard = drawnCards[0];
    player.hand.push(drawnCard);

    // Move to next player
    this.nextPlayer(gameState);

    await storage.setGameState(roomId, gameState);

    // Handle AI turns
    await this.processAITurns(roomId);

    return { success: true, message: "Card drawn", card: drawnCard, gameState };
  }

  async sayUno(roomId: string, playerId: string): Promise<{ success: boolean; message: string }> {
    const gameState = await storage.getGameState(roomId);
    if (!gameState) {
      return { success: false, message: "Game not found" };
    }

    const player = gameState.players.find(p => p.id === playerId);
    if (!player) {
      return { success: false, message: "Player not found" };
    }

    if (player.hand.length !== 1) {
      return { success: false, message: "Can only say UNO with 1 card" };
    }

    player.saidUno = true;
    player.stats.unoCalls++;

    await storage.setGameState(roomId, gameState);
    await this.addSystemMessage(roomId, `${player.username} said UNO!`);

    return { success: true, message: "UNO called successfully" };
  }

  private drawCards(gameState: GameState, count: number): Card[] {
    const drawnCards: Card[] = [];
    
    for (let i = 0; i < count; i++) {
      if (gameState.deck.length === 0) {
        // Reshuffle discard pile
        const currentCard = gameState.discardPile.pop();
        gameState.deck = this.shuffleDeck([...gameState.discardPile]);
        gameState.discardPile = currentCard ? [currentCard] : [];
      }
      
      if (gameState.deck.length > 0) {
        drawnCards.push(gameState.deck.pop()!);
      }
    }
    
    return drawnCards;
  }

  private async handleCardEffect(gameState: GameState, card: Card, playerId: string): Promise<void> {
    const currentPlayerIndex = gameState.currentPlayer;
    
    switch (card.type) {
      case 'skip':
        this.nextPlayer(gameState);
        await this.addSystemMessage(gameState.id, `${gameState.players[this.getNextPlayerIndex(gameState, currentPlayerIndex)].username} was skipped!`);
        break;
        
      case 'reverse':
        gameState.direction *= -1;
        if (gameState.players.length === 2) {
          // In 2-player game, reverse acts like skip
          this.nextPlayer(gameState);
        }
        await this.addSystemMessage(gameState.id, "Direction reversed!");
        break;
        
      case 'draw2':
        const nextPlayerIndex = this.getNextPlayerIndex(gameState, currentPlayerIndex);
        const nextPlayer = gameState.players[nextPlayerIndex];
        const drawnCards = this.drawCards(gameState, 2);
        nextPlayer.hand.push(...drawnCards);
        this.nextPlayer(gameState); // Skip the next player
        await this.addSystemMessage(gameState.id, `${nextPlayer.username} draws 2 cards and is skipped!`);
        break;
        
      case 'wild4':
        const wild4NextPlayerIndex = this.getNextPlayerIndex(gameState, currentPlayerIndex);
        const wild4NextPlayer = gameState.players[wild4NextPlayerIndex];
        const wild4DrawnCards = this.drawCards(gameState, 4);
        wild4NextPlayer.hand.push(...wild4DrawnCards);
        this.nextPlayer(gameState); // Skip the next player
        await this.addSystemMessage(gameState.id, `${wild4NextPlayer.username} draws 4 cards and is skipped!`);
        break;
    }
  }

  private wasPlayerSkipped(card: Card): boolean {
    return ['skip', 'draw2', 'wild4'].includes(card.type);
  }

  private nextPlayer(gameState: GameState): void {
    gameState.currentPlayer = this.getNextPlayerIndex(gameState, gameState.currentPlayer);
  }

  private getNextPlayerIndex(gameState: GameState, currentIndex: number): number {
    const playerCount = gameState.players.length;
    return (currentIndex + gameState.direction + playerCount) % playerCount;
  }

  private async handleGameWin(gameState: GameState, winnerId: string): Promise<void> {
    const winner = gameState.players.find(p => p.id === winnerId)!;
    winner.stats.gamesWon++;
    
    // Update tournament wins
    gameState.tournamentWins[winnerId] = (gameState.tournamentWins[winnerId] || 0) + 1;
    
    await this.addSystemMessage(gameState.id, `🎉 ${winner.username} wins the round!`);
    
    // Check for tournament win
    if (gameState.settings.tournamentMode && gameState.tournamentWins[winnerId] >= gameState.settings.tournamentTarget) {
      gameState.gamePhase = 'finished';
      await this.addSystemMessage(gameState.id, `🏆 ${winner.username} wins the tournament!`);
    } else {
      // Start new round
      await this.startNewRound(gameState);
    }
  }

  private async startNewRound(gameState: GameState): Promise<void> {
    // Reset hands and deal new cards
    const deck = this.createDeck();
    
    gameState.players.forEach(player => {
      player.hand = this.dealCards(deck, 7);
      player.saidUno = false;
    });
    
    gameState.deck = deck;
    gameState.discardPile = [];
    gameState.currentCard = this.dealCards(deck, 1)[0];
    gameState.currentPlayer = 0;
    gameState.direction = 1;
    
    await this.addSystemMessage(gameState.id, "New round started!");
  }

  private async processAITurns(roomId: string): Promise<void> {
    const gameState = await storage.getGameState(roomId);
    if (!gameState || gameState.gamePhase !== 'playing') return;

    const currentPlayer = gameState.players[gameState.currentPlayer];
    
    if (currentPlayer.isAI) {
      // Delay for realistic AI thinking time
      setTimeout(async () => {
        const action = await this.aiController.getAction(gameState, currentPlayer.id);
        
        if (action.type === 'play') {
          await this.playCard(roomId, currentPlayer.id, action.cardId, action.chosenColor);
        } else if (action.type === 'draw') {
          await this.drawCard(roomId, currentPlayer.id);
        } else if (action.type === 'uno') {
          await this.sayUno(roomId, currentPlayer.id);
        }
      }, 1000 + Math.random() * 2000); // 1-3 second delay
    }
  }

  private async addSystemMessage(roomId: string, message: string): Promise<void> {
    const systemMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 15),
      playerId: 'system',
      username: 'System',
      message,
      type: 'system',
      timestamp: new Date(),
    };
    
    await storage.addChatMessage(roomId, systemMessage);
  }

  async getGameState(roomId: string): Promise<GameState | undefined> {
    return await storage.getGameState(roomId);
  }

  async addPlayer(roomId: string, player: Player): Promise<boolean> {
    const gameState = await storage.getGameState(roomId);
    if (!gameState) return false;

    if (gameState.players.length >= gameState.settings.maxPlayers) {
      return false;
    }

    gameState.players.push(player);
    await storage.setGameState(roomId, gameState);
    
    await this.addSystemMessage(roomId, `${player.username} joined the game!`);
    return true;
  }

  async removePlayer(roomId: string, playerId: string): Promise<boolean> {
    const gameState = await storage.getGameState(roomId);
    if (!gameState) return false;

    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return false;

    const player = gameState.players[playerIndex];
    gameState.players.splice(playerIndex, 1);

    if (gameState.currentPlayer >= playerIndex && gameState.currentPlayer > 0) {
      gameState.currentPlayer--;
    }

    await storage.setGameState(roomId, gameState);
    await this.addSystemMessage(roomId, `${player.username} left the game.`);
    
    return true;
  }
}
