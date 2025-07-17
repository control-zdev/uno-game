import { Player } from "@shared/schema";
import { Card } from "./card";
import { Badge } from "@/components/ui/badge";

interface OpponentDisplayProps {
  player: Player;
  isCurrentTurn: boolean;
}

export function OpponentDisplay({ player, isCurrentTurn }: OpponentDisplayProps) {
  const getAvatarEmoji = (aiPersonality?: string) => {
    switch (aiPersonality) {
      case 'spongebob': return '🧽';
      case 'patrick': return '⭐';
      case 'squidward': return '🎵';
      case 'krabs': return '🦀';
      case 'sandy': return '🐿️';
      case 'plankton': return '🦠';
      default: return '👤';
    }
  };

  const getBackgroundColor = (aiPersonality?: string) => {
    switch (aiPersonality) {
      case 'spongebob': return 'bg-spongebob';
      case 'patrick': return 'bg-patrick';
      case 'squidward': return 'bg-squidward';
      case 'krabs': return 'bg-krabs';
      case 'sandy': return 'bg-sandy';
      case 'plankton': return 'bg-green-600';
      default: return 'bg-ocean';
    }
  };

  const getBorderColor = (aiPersonality?: string) => {
    switch (aiPersonality) {
      case 'spongebob': return 'border-krabs';
      case 'patrick': return 'border-spongebob';
      case 'squidward': return 'border-patrick';
      case 'krabs': return 'border-sandy';
      case 'sandy': return 'border-squidward';
      case 'plankton': return 'border-krabs';
      default: return 'border-deepsea';
    }
  };

  return (
    <div className="text-center">
      <div className={`${getBackgroundColor(player.aiPersonality)} bg-opacity-90 backdrop-blur-sm rounded-2xl p-4 border-4 ${getBorderColor(player.aiPersonality)} shadow-xl transition-all duration-300 ${isCurrentTurn ? 'ring-4 ring-spongebob animate-pulse' : ''}`}>
        <div className="text-4xl mb-2 animate-bounce">
          {getAvatarEmoji(player.aiPersonality)}
        </div>
        <h4 className="text-white font-cartoon text-sm mb-2 truncate">{player.username}</h4>
        
        {/* Overlapping cards display */}
        <div className="opponent-cards mb-2">
          {Array.from({ length: Math.min(player.hand.length, 5) }).map((_, index) => (
            <div 
              key={index}
              className={`opponent-card card-back opacity-90 transform transition-all duration-300`}
              style={{
                transform: `rotate(${-15 + (index * 7.5)}deg)`,
                zIndex: 5 - index,
                marginLeft: index > 0 ? '-40px' : '0'
              }}
            />
          ))}
        </div>
        
        <div className="text-white text-xs mb-2">{player.hand.length} cards</div>
        
        {player.hand.length === 1 && player.saidUno && (
          <Badge className="bg-yellow-400 text-deepsea text-xs px-2 py-1 rounded-full animate-pulse">
            UNO!
          </Badge>
        )}
        
        {isCurrentTurn && (
          <div className="mt-2">
            <Badge className="bg-white text-deepsea text-xs px-2 py-1 rounded-full animate-bounce">
              Thinking...
            </Badge>
          </div>
        )}
        
        {!player.isConnected && (
          <div className="mt-2">
            <Badge variant="destructive" className="text-xs px-2 py-1 rounded-full">
              Disconnected
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
