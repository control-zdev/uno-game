import { Player } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target } from "lucide-react";

interface TournamentProgressProps {
  players: Player[];
  tournamentWins: { [playerId: string]: number };
  target: number;
}

export function TournamentProgress({ players, tournamentWins, target }: TournamentProgressProps) {
  const getPlayerColor = (player: Player) => {
    if (player.isAI) {
      switch (player.aiPersonality) {
        case 'spongebob': return 'bg-spongebob';
        case 'patrick': return 'bg-patrick';
        case 'squidward': return 'bg-squidward';
        case 'krabs': return 'bg-krabs';
        case 'sandy': return 'bg-sandy';
        case 'plankton': return 'bg-green-600';
        default: return 'bg-ocean';
      }
    }
    return 'bg-ocean';
  };

  const getProgressPercentage = (wins: number) => {
    return (wins / target) * 100;
  };

  const sortedPlayers = [...players].sort((a, b) => {
    const aWins = tournamentWins[a.id] || 0;
    const bWins = tournamentWins[b.id] || 0;
    return bWins - aWins;
  });

  return (
    <Card className="bg-bubble bg-opacity-90 backdrop-blur-sm border-4 border-krabs shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-cartoon text-deepsea flex items-center">
          <Trophy className="w-5 h-5 mr-2" />
          Tournament Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-4">
          {sortedPlayers.map((player) => {
            const wins = tournamentWins[player.id] || 0;
            const percentage = getProgressPercentage(wins);
            const isLeading = wins > 0 && wins === Math.max(...Object.values(tournamentWins));
            
            return (
              <div key={player.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full ${getPlayerColor(player)} border-2 border-white`} />
                    <span className={`text-sm text-deepsea font-medium ${isLeading ? 'text-spongebob font-bold' : ''}`}>
                      {player.username}
                    </span>
                    {isLeading && wins > 0 && (
                      <Trophy className="w-4 h-4 text-spongebob" />
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: target }).map((_, index) => (
                      <div
                        key={index}
                        className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-all duration-300 ${
                          index < wins 
                            ? `${getPlayerColor(player)} animate-pulse` 
                            : 'bg-gray-300'
                        }`}
                      >
                        {index < wins && (
                          <Trophy className="w-3 h-3 text-white" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="relative">
                  <Progress 
                    value={percentage} 
                    className="h-2 bg-gray-200"
                  />
                  <div 
                    className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ${getPlayerColor(player)}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{wins} wins</span>
                  <span>{target - wins} to go</span>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 text-center border-t border-deepsea pt-4">
          <div className="flex items-center justify-center space-x-2 text-sm text-deepsea">
            <Target className="w-4 h-4" />
            <span>First to {target} wins!</span>
          </div>
          
          {Object.values(tournamentWins).some(wins => wins >= target) && (
            <div className="mt-2 bg-spongebob text-deepsea px-4 py-2 rounded-full font-bold animate-bounce">
              🏆 Tournament Complete! 🏆
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
