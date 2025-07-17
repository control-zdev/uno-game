import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ParticleSystem } from "@/components/game/particle-system";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Room } from "@shared/schema";
import { Play, Plus, Users, Lock } from "lucide-react";

export default function Lobby() {
  const [, setLocation] = useLocation();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check if user is logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      setLocation("/");
      return;
    }
    
    fetchRooms();
  }, [setLocation]);

  const fetchRooms = async () => {
    try {
      const response = await apiRequest("GET", "/api/rooms");
      const data = await response.json();
      setRooms(data.rooms);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch rooms",
        variant: "destructive",
      });
    }
  };

  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName) {
      toast({
        title: "Error",
        description: "Please enter a room name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/rooms", {
        name: roomName,
        password: roomPassword || null,
        maxPlayers,
        settings: {
          tournamentMode: true,
          tournamentTarget: 6,
        }
      });
      const data = await response.json();
      
      toast({
        title: "Success",
        description: "Room created successfully!",
      });
      
      setLocation(`/game/${data.room.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create room",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = async (roomId: string, password?: string) => {
    // For password-protected rooms, you might want to add a password input dialog
    setLocation(`/game/${roomId}`);
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="min-h-screen game-background p-4">
      <ParticleSystem />
      
      <div className="container mx-auto">
        {/* Header */}
        <Card className="mb-8 bg-bubble bg-opacity-90 backdrop-blur-sm border-4 border-spongebob shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-cartoon text-deepsea">
                  🍔 Bikini Bottom Lobby 🍔
                </CardTitle>
                <p className="text-deepsea">Welcome back, {user.username}!</p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-spongebob text-deepsea">
                  Level {user.level}
                </Badge>
                <Button
                  onClick={() => setShowCreateRoom(!showCreateRoom)}
                  className="bg-patrick hover:bg-red-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Room
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Room List */}
          <div className="lg:col-span-2">
            <Card className="bg-bubble bg-opacity-90 backdrop-blur-sm border-4 border-squidward shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-cartoon text-deepsea flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Active Game Rooms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rooms.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🏖️</div>
                      <p className="text-deepsea">No active rooms. Create one to get started!</p>
                    </div>
                  ) : (
                    rooms.map((room) => (
                      <div
                        key={room.id}
                        className="flex items-center justify-between p-4 bg-white bg-opacity-50 rounded-lg border-2 border-deepsea hover:border-spongebob transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">🎮</div>
                          <div>
                            <h3 className="font-semibold text-deepsea flex items-center">
                              {room.name}
                              {room.password && <Lock className="w-4 h-4 ml-2 text-krabs" />}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Max Players: {room.maxPlayers} • Created: {new Date(room.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => joinRoom(room.id)}
                          className="bg-squidward hover:bg-green-600 text-white"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Join
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Create Room Form */}
            {showCreateRoom && (
              <Card className="bg-bubble bg-opacity-90 backdrop-blur-sm border-4 border-patrick shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-cartoon text-deepsea">
                    Create New Room
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createRoom} className="space-y-4">
                    <div>
                      <Label htmlFor="roomName" className="text-deepsea">Room Name</Label>
                      <Input
                        id="roomName"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="Enter room name"
                        className="border-2 border-deepsea focus:border-spongebob"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="roomPassword" className="text-deepsea">Password (Optional)</Label>
                      <Input
                        id="roomPassword"
                        type="password"
                        value={roomPassword}
                        onChange={(e) => setRoomPassword(e.target.value)}
                        placeholder="Leave empty for public room"
                        className="border-2 border-deepsea focus:border-spongebob"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="maxPlayers" className="text-deepsea">Max Players</Label>
                      <select
                        id="maxPlayers"
                        value={maxPlayers}
                        onChange={(e) => setMaxPlayers(Number(e.target.value))}
                        className="w-full p-2 border-2 border-deepsea rounded-md focus:border-spongebob"
                      >
                        <option value={2}>2 Players</option>
                        <option value={3}>3 Players</option>
                        <option value={4}>4 Players</option>
                      </select>
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-spongebob hover:bg-yellow-600 text-deepsea font-bold"
                    >
                      {isLoading ? "Creating..." : "Create Room"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Player Stats */}
            <Card className="bg-bubble bg-opacity-90 backdrop-blur-sm border-4 border-krabs shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-cartoon text-deepsea">
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-deepsea">Level:</span>
                    <Badge className="bg-spongebob text-deepsea">{user.level}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-deepsea">Wins:</span>
                    <span className="font-bold text-squidward">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-deepsea">Games:</span>
                    <span className="font-bold text-krabs">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-deepsea">Win Rate:</span>
                    <span className="font-bold text-patrick">0%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="bg-bubble bg-opacity-90 backdrop-blur-sm border-4 border-sandy shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-cartoon text-deepsea">
                  🎯 Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-deepsea">
                  <div className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Remember to say "UNO" when you have one card left!</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Wild cards can change the game - use them wisely</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>First to win 6 rounds wins the tournament!</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Each AI has a unique personality and playing style</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
