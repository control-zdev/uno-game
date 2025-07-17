import { Card as UnoCard } from "@shared/schema";
import { cn } from "@/lib/utils";

interface CardProps {
  card: UnoCard;
  onClick?: () => void;
  className?: string;
  isPlayable?: boolean;
  isSelected?: boolean;
  showBack?: boolean;
}

export function Card({ card, onClick, className, isPlayable = true, isSelected = false, showBack = false }: CardProps) {
  if (showBack) {
    return (
      <div 
        className={cn(
          "card-back transition-all duration-300",
          className
        )}
        onClick={onClick}
      />
    );
  }

  const getCardColor = () => {
    switch (card.color) {
      case 'red': return 'from-red-500 to-red-600';
      case 'blue': return 'from-blue-500 to-blue-600';
      case 'green': return 'from-green-500 to-green-600';
      case 'yellow': return 'from-yellow-400 to-yellow-500';
      case 'wild': return 'wild-card';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getCardIcon = () => {
    switch (card.type) {
      case 'skip': return '⊘';
      case 'reverse': return '↻';
      case 'draw2': return '+2';
      case 'wild': return '🌈';
      case 'wild4': return '🌈+4';
      default: return card.value;
    }
  };

  const getCardLabel = () => {
    switch (card.type) {
      case 'skip': return 'SKIP';
      case 'reverse': return 'REVERSE';
      case 'draw2': return 'DRAW 2';
      case 'wild': return 'WILD';
      case 'wild4': return 'WILD +4';
      default: return card.color.toUpperCase();
    }
  };

  return (
    <div 
      className={cn(
        "player-card card-hover rounded-2xl border-4 border-white shadow-lg flex items-center justify-center cursor-pointer transition-all duration-300",
        card.type === 'wild' || card.type === 'wild4' ? "wild-card" : `bg-gradient-to-br ${getCardColor()}`,
        isSelected && "scale-110 -translate-y-4",
        !isPlayable && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={isPlayable ? onClick : undefined}
    >
      <div className="text-center">
        <div className="text-3xl font-bold text-white mb-1">
          {getCardIcon()}
        </div>
        <div className="text-white text-xs">
          {getCardLabel()}
        </div>
      </div>
    </div>
  );
}
