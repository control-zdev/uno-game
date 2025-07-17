import { Card as UnoCard } from "@shared/schema";
import { Card } from "./card";
import { CardContent, Card as UICard } from "@/components/ui/card";
import { canPlayCard } from "@/lib/game-logic";

interface PlayerHandProps {
  hand: UnoCard[];
  onCardClick: (cardId: string) => void;
  isMyTurn: boolean;
  currentCard?: UnoCard;
}

export function PlayerHand({ hand, onCardClick, isMyTurn, currentCard }: PlayerHandProps) {
  return (
    <UICard className="bg-bubble bg-opacity-90 backdrop-blur-sm border-4 border-spongebob shadow-xl">
      <CardContent className="p-6">
        <h3 className="text-lg font-cartoon text-deepsea mb-4 text-center">Your Cards</h3>
        <div className="flex justify-center space-x-2 flex-wrap gap-2">
          {hand.map((card, index) => {
            const playable = currentCard ? canPlayCard(card, currentCard) : false;
            
            return (
              <Card 
                key={`${card.id}-${index}`}
                card={card}
                onClick={() => onCardClick(card.id)}
                isPlayable={isMyTurn && playable}
                className={cn(
                  "transform transition-all duration-300",
                  playable && isMyTurn ? "hover:scale-105 hover:-translate-y-2" : "",
                  !playable || !isMyTurn ? "opacity-60" : ""
                )}
              />
            );
          })}
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-deepsea">You have {hand.length} cards</p>
          {isMyTurn ? (
            <p className="text-xs text-squidward mt-1 font-semibold animate-pulse">Your turn! Click on a card to play it</p>
          ) : (
            <p className="text-xs text-gray-600 mt-1">Wait for your turn</p>
          )}
        </div>
      </CardContent>
    </UICard>
  );
}

function cn(...args: any[]) {
  return args.filter(Boolean).join(' ');
}
