import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Home, Play } from "lucide-react";

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  winner: string;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

export function GameOverModal({ isOpen, onClose, winner, onPlayAgain, onBackToLobby }: GameOverModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-bubble border-4 border-spongebob shadow-2xl max-w-md w-full mx-4 rounded-3xl">
        <div className="text-center p-8">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          
          <h2 className="text-3xl font-cartoon text-deepsea mb-4">
            Game Over!
          </h2>
          
          <div className="mb-6">
            <p className="text-xl text-deepsea mb-2">
              Winner: <span className="font-bold text-spongebob">{winner}</span>
            </p>
            <p className="text-sm text-gray-600">
              What an amazing tournament!
            </p>
          </div>
          
          <div className="space-y-4">
            <Button
              onClick={onPlayAgain}
              className="w-full bg-spongebob hover:bg-yellow-600 text-deepsea py-3 rounded-full font-bold transition-colors"
            >
              <Play className="w-5 h-5 mr-2" />
              Play Again
            </Button>
            
            <Button
              onClick={onBackToLobby}
              className="w-full bg-patrick hover:bg-red-600 text-white py-3 rounded-full font-bold transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Lobby
            </Button>
          </div>
          
          <div className="mt-6 flex justify-center space-x-4 text-4xl">
            <span className="animate-bounce" style={{ animationDelay: '0s' }}>🧽</span>
            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>⭐</span>
            <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>🦀</span>
            <span className="animate-bounce" style={{ animationDelay: '0.6s' }}>🐿️</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
