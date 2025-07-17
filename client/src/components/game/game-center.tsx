import { GameState } from "@shared/schema";
import { Card } from "./card";
import { Button } from "@/components/ui/button";
import { Card as UICard, CardContent } from "@/components/ui/card";
import { RotateCcw, Hand, Volume2 } from "lucide-react";

interface GameCenterProps {
  gameState: GameState;
  onDrawCard: () => void;
  onSayUno: () => void;
  currentUserId: string;
}

export function GameCenter({ gameState, onDrawCard, onSayUno, currentUserId }: GameCenterProps) {
  const currentPlayer = gameState.players[gameState.currentPlayer];
  const isMyTurn = currentPlayer?.id === currentUserId;
  const myPlayer = gameState.players.find(p => p.id === currentUserId);

  const getDirectionIcon = () => {
    return gameState.direction === 1 ? "↻" : "↺";
  };

  const getGamePhaseText = () => {
    switch (gameState.gamePhase) {
      case 'waiting': return 'Waiting for players...';
      case 'playing': return isMyTurn ? 'Your Turn!' : `${currentPlayer?.username}'s Turn`;
      case 'finished': return 'Tournament Finished!';
      default: return 'Game in progress';
    }
  };

  return (
    <UICard className="bg-bubble bg-opacity-90 backdrop-blur-sm border-4 border-deepsea shadow-xl mb-8">
      <CardContent className="p-8">
        <div className="flex items-center justify-center space-x-12">
          {/* Draw Pile */}
          <div className="text-center">
            <h3 className="text-lg font-cartoon text-deepsea mb-4">Draw Pile</h3>
            <div className="relative">
              <Card 
                card={{ id: 'back', color: 'wild', value: '', type: 'number' }}
                showBack={true}
                onClick={isMyTurn ? onDrawCard : undefined}
                className="w-24 h-36 cursor-pointer hover:scale-105 transition-transform shadow-lg"
              />
              <div className="absolute top-1 left-1 opacity-80 -z-10">
                <Card 
                  card={{ id: 'back2', color: 'wild', value: '', type: 'number' }}
                  showBack={true}
                  className="w-24 h-36"
                />
              </div>
              <div className="absolute top-2 left-2 opacity-60 -z-20">
                <Card 
                  card={{ id: 'back3', color: 'wild', value: '', type: 'number' }}
                  showBack={true}
                  className="w-24 h-36"
                />
              </div>
            </div>
            <p className="text-sm text-deepsea mt-2">{gameState.deck.length} cards</p>
          </div>

          {/* Current Card */}
          <div className="text-center">
            <h3 className="text-lg font-cartoon text-deepsea mb-4">Current Card</h3>
            <div className="relative">
              <Card 
                card={gameState.currentCard}
                className="w-24 h-36 shadow-2xl"
              />
              {/* Particle effect for current card */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="particle animate-particle" style={{ left: '20%', top: '10%', animationDelay: '0s' }} />
                <div className="particle animate-particle" style={{ left: '80%', top: '20%', animationDelay: '0.5s' }} />
                <div className="particle animate-particle" style={{ left: '50%', top: '5%', animationDelay: '1s' }} />
              </div>
            </div>
            <p className="text-sm text-deepsea mt-2">Play on this</p>
          </div>

          {/* Game Status */}
          <div className="text-center">
            <h3 className="text-lg font-cartoon text-deepsea mb-4">Game Status</h3>
            <UICard className="bg-spongebob border-4 border-patrick shadow-lg">
              <CardContent className="p-4">
                <div className={`text-deepsea font-bold mb-2 ${isMyTurn ? 'animate-pulse text-lg' : ''}`}>
                  {getGamePhaseText()}
                </div>
                <div className="flex items-center justify-center space-x-4 text-sm text-deepsea mb-3">
                  <div className="flex items-center">
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Direction: {getDirectionIcon()}
                  </div>
                  <div>Round: {gameState.discardPile.length + 1}</div>
                </div>
                
                {myPlayer && myPlayer.hand.length === 1 && !myPlayer.saidUno && (
                  <Button 
                    onClick={onSayUno}
                    className="bg-patrick hover:bg-red-600 text-white px-4 py-2 rounded-full font-semibold transition-colors animate-bounce"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Say UNO!
                  </Button>
                )}
                
                {isMyTurn && (
                  <div className="mt-2 text-xs text-deepsea animate-pulse">
                    ⏰ Make your move!
                  </div>
                )}
              </CardContent>
            </UICard>
          </div>
        </div>
      </CardContent>
    </UICard>
  );
}
