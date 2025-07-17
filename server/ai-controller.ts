import { GameState, Player, Card } from "@shared/schema";

export type AIAction = {
  type: 'play' | 'draw' | 'uno';
  cardId?: string;
  chosenColor?: string;
};

export type AIPersonality = {
  name: string;
  playStyle: 'aggressive' | 'defensive' | 'random' | 'strategic';
  riskTolerance: number; // 0-1
  wildCardUsage: number; // 0-1
  unoCallTiming: number; // 0-1
};

export class AIController {
  private personalities: { [key: string]: AIPersonality } = {
    spongebob: {
      name: 'SpongeBob',
      playStyle: 'random',
      riskTolerance: 0.8,
      wildCardUsage: 0.7,
      unoCallTiming: 0.9,
    },
    patrick: {
      name: 'Patrick',
      playStyle: 'random',
      riskTolerance: 0.9,
      wildCardUsage: 0.8,
      unoCallTiming: 0.3,
    },
    squidward: {
      name: 'Squidward',
      playStyle: 'defensive',
      riskTolerance: 0.2,
      wildCardUsage: 0.3,
      unoCallTiming: 0.95,
    },
    krabs: {
      name: 'Mr. Krabs',
      playStyle: 'aggressive',
      riskTolerance: 0.6,
      wildCardUsage: 0.5,
      unoCallTiming: 0.85,
    },
    sandy: {
      name: 'Sandy',
      playStyle: 'strategic',
      riskTolerance: 0.4,
      wildCardUsage: 0.6,
      unoCallTiming: 0.9,
    },
    plankton: {
      name: 'Plankton',
      playStyle: 'strategic',
      riskTolerance: 0.7,
      wildCardUsage: 0.9,
      unoCallTiming: 0.8,
    },
  };

  async getAction(gameState: GameState, playerId: string): Promise<AIAction> {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player || !player.isAI) {
      return { type: 'draw' };
    }

    const personality = this.personalities[player.aiPersonality || 'spongebob'];
    
    // Check if AI should say UNO
    if (player.hand.length === 1 && !player.saidUno && Math.random() < personality.unoCallTiming) {
      return { type: 'uno' };
    }

    // Find playable cards
    const playableCards = this.getPlayableCards(player.hand, gameState.currentCard);
    
    if (playableCards.length === 0) {
      return { type: 'draw' };
    }

    // Select card based on personality
    const selectedCard = this.selectCardByPersonality(playableCards, personality, gameState);
    
    let chosenColor: string | undefined;
    if (selectedCard.type === 'wild' || selectedCard.type === 'wild4') {
      chosenColor = this.chooseWildColor(player.hand, personality);
    }

    return {
      type: 'play',
      cardId: selectedCard.id,
      chosenColor,
    };
  }

  private getPlayableCards(hand: Card[], currentCard: Card): Card[] {
    return hand.filter(card => {
      if (card.type === 'wild' || card.type === 'wild4') {
        return true;
      }
      return card.color === currentCard.color || card.value === currentCard.value;
    });
  }

  private selectCardByPersonality(playableCards: Card[], personality: AIPersonality, gameState: GameState): Card {
    switch (personality.playStyle) {
      case 'aggressive':
        return this.selectAggressiveCard(playableCards, personality);
      case 'defensive':
        return this.selectDefensiveCard(playableCards, personality);
      case 'strategic':
        return this.selectStrategicCard(playableCards, personality, gameState);
      case 'random':
      default:
        return playableCards[Math.floor(Math.random() * playableCards.length)];
    }
  }

  private selectAggressiveCard(playableCards: Card[], personality: AIPersonality): Card {
    // Prioritize action cards and wild cards
    const actionCards = playableCards.filter(card => 
      ['skip', 'reverse', 'draw2', 'wild4'].includes(card.type)
    );
    
    if (actionCards.length > 0 && Math.random() < personality.riskTolerance) {
      return actionCards[Math.floor(Math.random() * actionCards.length)];
    }

    const wildCards = playableCards.filter(card => card.type === 'wild');
    if (wildCards.length > 0 && Math.random() < personality.wildCardUsage) {
      return wildCards[0];
    }

    return playableCards[Math.floor(Math.random() * playableCards.length)];
  }

  private selectDefensiveCard(playableCards: Card[], personality: AIPersonality): Card {
    // Prioritize number cards, avoid action cards unless necessary
    const numberCards = playableCards.filter(card => card.type === 'number');
    
    if (numberCards.length > 0) {
      return numberCards[Math.floor(Math.random() * numberCards.length)];
    }

    const nonWildCards = playableCards.filter(card => 
      card.type !== 'wild' && card.type !== 'wild4'
    );
    
    if (nonWildCards.length > 0) {
      return nonWildCards[Math.floor(Math.random() * nonWildCards.length)];
    }

    return playableCards[Math.floor(Math.random() * playableCards.length)];
  }

  private selectStrategicCard(playableCards: Card[], personality: AIPersonality, gameState: GameState): Card {
    // Analyze game state and make strategic decisions
    const nextPlayerIndex = (gameState.currentPlayer + gameState.direction + gameState.players.length) % gameState.players.length;
    const nextPlayer = gameState.players[nextPlayerIndex];
    
    // If next player has few cards, try to disrupt them
    if (nextPlayer.hand.length <= 2) {
      const disruptiveCards = playableCards.filter(card => 
        ['skip', 'reverse', 'draw2', 'wild4'].includes(card.type)
      );
      
      if (disruptiveCards.length > 0) {
        return disruptiveCards[Math.floor(Math.random() * disruptiveCards.length)];
      }
    }

    // Try to match colors we have more of
    const colorCounts = this.countCardsByColor(playableCards);
    const preferredColor = Object.keys(colorCounts).reduce((a, b) => 
      colorCounts[a] > colorCounts[b] ? a : b
    );

    const preferredColorCards = playableCards.filter(card => 
      card.color === preferredColor && card.type !== 'wild' && card.type !== 'wild4'
    );
    
    if (preferredColorCards.length > 0) {
      return preferredColorCards[Math.floor(Math.random() * preferredColorCards.length)];
    }

    return playableCards[Math.floor(Math.random() * playableCards.length)];
  }

  private chooseWildColor(hand: Card[], personality: AIPersonality): string {
    const colorCounts = this.countCardsByColor(hand);
    const colors = ['red', 'blue', 'green', 'yellow'];
    
    if (personality.playStyle === 'strategic') {
      // Choose color we have most of
      const bestColor = colors.reduce((a, b) => 
        (colorCounts[a] || 0) > (colorCounts[b] || 0) ? a : b
      );
      return bestColor;
    }
    
    // Random color for other personalities
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private countCardsByColor(cards: Card[]): { [color: string]: number } {
    const counts: { [color: string]: number } = {};
    
    cards.forEach(card => {
      if (card.color !== 'wild') {
        counts[card.color] = (counts[card.color] || 0) + 1;
      }
    });
    
    return counts;
  }

  getRandomPersonality(): string {
    const personalities = Object.keys(this.personalities);
    return personalities[Math.floor(Math.random() * personalities.length)];
  }

  getPersonalityDisplayName(personality: string): string {
    return this.personalities[personality]?.name || personality;
  }
}
