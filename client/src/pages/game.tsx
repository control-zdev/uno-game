import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { ParticleSystem } from "@/components/game/particle-system";
import { GameCenter } from "@/components/game/game-center";
import { PlayerHand } from "@/components/game/player-hand";
import { OpponentDisplay } from "@/components/game/opponent-display";
import { ChatSystem } from "@/components/game/chat-system";
import { TournamentProgress } from "@/components/game/tournament-progress";
import { AchievementBadge } from "@/components/game/achievement-badge";
import { ColorPickerModal } from "@/components/modals/color-picker-modal";
import { GameOverModal } from "@/components/modals/game-over-modal";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GameState, Player, Achievement } from "@shared/schema";
import { Settings, Menu } from "lucide-react";

export default function Game() {
  const [match, params] = useRoute("/game/:roomId");
  const [, setLocation] = useLocation();
  const roomId = params?.roomId;
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { toast } = useToast();

  const { sendMessage, lastMessage, connectionStatus } = useWebSocket(roomId || "");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      setLocation("/");
      return;
    }
    setCurrentUser(JSON.parse(user));
  }, [setLocation]);

  useEffect(() => {
    if (currentUser && roomId) {
      // Join the room
      sendMessage({
        type: "join_room",
        roomId,
        playerId: currentUser.id.toString(),
        username: currentUser.username,
      });
    }
  }, [currentUser, roomId, sendMessage]);

  useEffect(() => {
    if (lastMessage) {
      const message = JSON.parse(lastMessage.data);
      
      switch (message.type) {
        case "game_state":
          setGameState(message.gameState);
          break;
          
        case "game_started":
          setGameState(message.gameState);
          toast({
            title: "Game Started!",
            description: "The tournament begins now!",
          });
          break;
          
        case "play_card_result":
          if (!message.success) {
            toast({
              title: "Invalid Move",
              description: message.message,
              variant: "destructive",
            });
          }
          break;
          
        case "uno_called":
          toast({
            title: "UNO!",
            description: "A player called UNO!",
          });
          break;
          
        case "player_joined":
          toast({
            title: "Player Joined",
            description: `${message.username} joined the game!`,
          });
          break;
          
        case "player_left":
          toast({
            title: "Player Left",
            description: "A player left the game",
          });
          break;
      }
    }
  }, [lastMessage, toast]);

  const startGame = () => {
    sendMessage({ type: "start_game" });
  };

  const playCard = (cardId: string, chosenColor?: string) => {
    sendMessage({
      type: "play_card",
      cardId,
      chosenColor,
    });
    setSelectedCard(null);
    setShowColorPicker(false);
  };

  const drawCard = () => {
    sendMessage({ type: "draw_card" });
  };

  const sayUno = () => {
    sendMessage({ type: "say_uno" });
  };

  const sendChatMessage = (message: string, messageType: string = "message") => {
    if (currentUser) {
      sendMessage({
        type: "chat_message",
        message,
        messageType,
        username: currentUser.username,
      });
    }
  };

  const handleCardClick = (cardId: string) => {
    if (!gameState || !currentUser) return;
    
    const currentPlayerIndex = gameState.currentPlayer;
    const currentPlayerId = gameState.players[currentPlayerIndex]?.id;
    
    if (currentPlayerId !== currentUser.id.toString()) {
      toast({
        title: "Not Your Turn",
        description: "Wait for your turn to play",
        variant: "destructive",
      });
      return;
    }

    const player = gameState.players.find(p => p.id === currentUser.id.toString());
    const card = player?.hand.find(c => c.id === cardId);
    
    if (card && (card.type === "wild" || card.type === "wild4")) {
      setSelectedCard(cardId);
      setShowColorPicker(true);
    } else {
      playCard(cardId);
    }
  };

  const handleColorChoice = (color: string) => {
    if (selectedCard) {
      playCard(selectedCard, color);
    }
  };

  if (!match || !roomId) {
    return <div>Room not found</div>;
  }

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const currentPlayer = gameState?.players.find(p => p.id === currentUser.id.toString());
  const isCurrentTurn = gameState && gameState.players[gameState.currentPlayer]?.id === currentUser.id.toString();

  return (
    <div className="min-h-screen game-background">
      <ParticleSystem />
      
      {/* Game Header */}
      <header className="bg-spongebob bg-opacity-90 backdrop-blur-sm border-b-4 border-krabs shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-cartoon text-deepsea">
                🎮 UNO: Bikini Bottom
              </h1>
              <div className="bg-bubble rounded-full px-4 py-2 border-2 border-patrick">
                <span className="text-deepsea font-semibold">Room: #{roomId}</span>
              </div>
              <Badge 
                variant={connectionStatus === "Connected" ? "default" : "destructive"}
                className={connectionStatus === "Connected" ? "bg-squidward" : ""}
              >
                {connectionStatus}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              {gameState && (
                <div className="bg-squidward rounded-full px-4 py-2 text-white font-semibold">
                  🏆 Tournament: {gameState.tournamentWins[currentUser.id.toString()] || 0}/6 Wins
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm"
                className="bg-krabs hover:bg-red-600 text-white border-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Player Stats & Achievements */}
          <div className="lg:col-span-1 space-y-4">
            {/* Player Profile */}
            <Card className="bg-bubble bg-opacity-90 backdrop-blur-sm border-4 border-spongebob shadow-xl">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-patrick bg-spongebob flex items-center justify-center text-2xl animate-bounce">
                    🧽
                  </div>
                  <h3 className="text-xl font-cartoon text-deepsea">{currentUser.username}</h3>
                  <p className="text-sm text-gray-600">Level {currentUser.level} - Fry Cook</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-deepsea">Cards:</span>
                    <span className="font-bold text-squidward">{currentPlayer?.hand.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-deepsea">Games Won:</span>
                    <span className="font-bold text-krabs">{currentPlayer?.stats.gamesWon || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-deepsea">Cards Played:</span>
                    <span className="font-bold text-patrick">{currentPlayer?.stats.cardsPlayed || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-bubble bg-opacity-90 backdrop-blur-sm border-4 border-patrick shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-cartoon text-deepsea mb-4">
                  ⭐ Recent Achievements
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <AchievementBadge 
                    achievement={{ id: "first_win", name: "First Win", description: "Win your first game", icon: "trophy", unlocked: true }}
                  />
                  <AchievementBadge 
                    achievement={{ id: "card_master", name: "Card Master", description: "Play 100 cards", icon: "cards-blank", unlocked: true }}
                  />
                  <AchievementBadge 
                    achievement={{ id: "speed_player", name: "Speed Player", description: "Win in under 5 minutes", icon: "bolt", unlocked: false }}
                  />
                  <AchievementBadge 
                    achievement={{ id: "uno_master", name: "Uno Master", description: "Call UNO 50 times", icon: "crown", unlocked: false }}
                  />
                  <AchievementBadge 
                    achievement={{ id: "locked1", name: "Locked", description: "Locked achievement", icon: "lock", unlocked: false }}
                  />
                  <AchievementBadge 
                    achievement={{ id: "locked2", name: "Locked", description: "Locked achievement", icon: "lock", unlocked: false }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Game Board */}
          <div className="lg:col-span-2">
            {/* Opponent Players */}
            {gameState && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {gameState.players
                  .filter(p => p.id !== currentUser.id.toString())
                  .slice(0, 3)
                  .map((player, index) => (
                    <OpponentDisplay 
                      key={player.id} 
                      player={player} 
                      isCurrentTurn={gameState.players[gameState.currentPlayer]?.id === player.id}
                    />
                  ))}
              </div>
            )}

            {/* Game Center Area */}
            {gameState ? (
              <GameCenter 
                gameState={gameState}
                onDrawCard={drawCard}
                onSayUno={sayUno}
                currentUserId={currentUser.id.toString()}
              />
            ) : (
              <Card className="bg-bubble bg-opacity-90 backdrop-blur-sm border-4 border-deepsea shadow-xl mb-8">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">🎮</div>
                  <h2 className="text-2xl font-cartoon text-deepsea mb-4">Ready to Start?</h2>
                  <p className="text-deepsea mb-6">Waiting for players to join...</p>
                  <Button 
                    onClick={startGame}
                    className="bg-spongebob hover:bg-yellow-600 text-deepsea font-bold px-8 py-3"
                  >
                    Start Tournament!
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Player's Hand */}
            {currentPlayer && (
              <PlayerHand 
                hand={currentPlayer.hand}
                onCardClick={handleCardClick}
                isMyTurn={isCurrentTurn}
                currentCard={gameState?.currentCard}
              />
            )}
          </div>

          {/* Right Sidebar - Chat & Tournament */}
          <div className="lg:col-span-1 space-y-4">
            <ChatSystem 
              roomId={roomId}
              currentUser={currentUser}
              onSendMessage={sendChatMessage}
            />
            
            {gameState && (
              <TournamentProgress 
                players={gameState.players}
                tournamentWins={gameState.tournamentWins}
                target={gameState.settings.tournamentTarget}
              />
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-4 right-4 flex space-x-2">
        {isCurrentTurn && (
          <>
            <Button 
              onClick={drawCard}
              className="bg-spongebob hover:bg-yellow-600 text-deepsea px-6 py-3 rounded-full font-bold shadow-lg animate-bounce"
            >
              ✋ Draw Card
            </Button>
            {currentPlayer && currentPlayer.hand.length === 1 && !currentPlayer.saidUno && (
              <Button 
                onClick={sayUno}
                className="bg-patrick hover:bg-red-600 text-white px-6 py-3 rounded-full font-bold shadow-lg animate-pulse"
              >
                📢 Say UNO!
              </Button>
            )}
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="fixed bottom-4 left-4 lg:hidden">
        <Button 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="bg-bubble border-4 border-spongebob text-deepsea p-4 rounded-full shadow-lg"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      {/* Modals */}
      <ColorPickerModal 
        isOpen={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        onColorSelect={handleColorChoice}
      />
      
      <GameOverModal 
        isOpen={showGameOver}
        onClose={() => setShowGameOver(false)}
        winner="SpongeBob123"
        onPlayAgain={startGame}
        onBackToLobby={() => setLocation("/lobby")}
      />
    </div>
  );
}
