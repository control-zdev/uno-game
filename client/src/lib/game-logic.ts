import { Card } from "@shared/schema";

export function canPlayCard(card: Card, currentCard: Card): boolean {
  // Wild cards can always be played
  if (card.type === 'wild' || card.type === 'wild4') {
    return true;
  }
  
  // Must match color or value
  return card.color === currentCard.color || card.value === currentCard.value;
}

export function getCardDisplayName(card: Card): string {
  switch (card.type) {
    case 'skip':
      return 'Skip';
    case 'reverse':
      return 'Reverse';
    case 'draw2':
      return 'Draw 2';
    case 'wild':
      return 'Wild';
    case 'wild4':
      return 'Wild Draw 4';
    default:
      return card.value.toString();
  }
}

export function getCardPoints(card: Card): number {
  switch (card.type) {
    case 'number':
      return typeof card.value === 'number' ? card.value : 0;
    case 'skip':
    case 'reverse':
    case 'draw2':
      return 20;
    case 'wild':
    case 'wild4':
      return 50;
    default:
      return 0;
  }
}

export function calculateHandScore(hand: Card[]): number {
  return hand.reduce((total, card) => total + getCardPoints(card), 0);
}

export function isActionCard(card: Card): boolean {
  return ['skip', 'reverse', 'draw2', 'wild', 'wild4'].includes(card.type);
}

export function isWildCard(card: Card): boolean {
  return card.type === 'wild' || card.type === 'wild4';
}

export function getPlayableCards(hand: Card[], currentCard: Card): Card[] {
  return hand.filter(card => canPlayCard(card, currentCard));
}

export function shouldSayUno(hand: Card[]): boolean {
  return hand.length === 1;
}

export function getNextPlayerIndex(currentIndex: number, direction: number, playerCount: number): number {
  return (currentIndex + direction + playerCount) % playerCount;
}

export function getCardColor(card: Card): string {
  if (card.color === 'wild') {
    return 'multicolor';
  }
  return card.color;
}

export function getCardIcon(card: Card): string {
  switch (card.type) {
    case 'skip':
      return '⊘';
    case 'reverse':
      return '↻';
    case 'draw2':
      return '+2';
    case 'wild':
      return '🌈';
    case 'wild4':
      return '🌈+4';
    default:
      return card.value.toString();
  }
}

export function formatGameTime(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function isGameWon(tournamentWins: { [playerId: string]: number }, target: number): boolean {
  return Object.values(tournamentWins).some(wins => wins >= target);
}

export function getWinner(tournamentWins: { [playerId: string]: number }, target: number): string | null {
  const winnerEntry = Object.entries(tournamentWins).find(([, wins]) => wins >= target);
  return winnerEntry ? winnerEntry[0] : null;
}
