import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@shared/schema";
import { MessageCircle, Send } from "lucide-react";

interface ChatSystemProps {
  roomId: string;
  currentUser: any;
  onSendMessage: (message: string, type?: string) => void;
}

export function ChatSystem({ roomId, currentUser, onSendMessage }: ChatSystemProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  const sendEmoji = (emoji: string) => {
    onSendMessage(emoji, "emoji");
  };

  const getMessageBackground = (message: ChatMessage) => {
    if (message.type === "system") return "bg-deepsea bg-opacity-20";
    if (message.playerId === currentUser.id.toString()) return "bg-spongebob bg-opacity-20";
    
    // Different colors for different players
    const colors = [
      "bg-patrick bg-opacity-20",
      "bg-squidward bg-opacity-20", 
      "bg-krabs bg-opacity-20",
      "bg-sandy bg-opacity-20"
    ];
    
    const hash = message.playerId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  const spongeBobEmojis = [
    { emoji: "🍔", label: "Krabby Patty" },
    { emoji: "⭐", label: "Patrick" },
    { emoji: "🎵", label: "Squidward" },
    { emoji: "💰", label: "Mr. Krabs" },
    { emoji: "🦀", label: "Crab" },
    { emoji: "🐿️", label: "Sandy" },
    { emoji: "🧽", label: "SpongeBob" },
    { emoji: "🌊", label: "Ocean" },
    { emoji: "🏖️", label: "Beach" },
    { emoji: "🦠", label: "Plankton" },
    { emoji: "🎮", label: "Game" },
    { emoji: "🏆", label: "Trophy" }
  ];

  return (
    <Card className="bg-bubble bg-opacity-90 backdrop-blur-sm border-4 border-patrick shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-cartoon text-deepsea flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <ScrollArea className="h-64 mb-4 pr-4">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-2xl mb-2">💬</div>
                <p className="text-sm text-deepsea">No messages yet. Say hello!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`${getMessageBackground(message)} rounded-lg p-3 transition-all duration-300 hover:bg-opacity-30`}
                >
                  <div className="text-xs text-deepsea font-bold mb-1">
                    {message.type === "system" ? "🤖 System" : message.username}
                    <span className="ml-2 text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className={`text-sm ${message.type === "system" ? "font-medium italic" : ""}`}>
                    {message.type === "emoji" ? (
                      <span className="text-2xl">{message.message}</span>
                    ) : (
                      <span className="text-deepsea">{message.message}</span>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="flex space-x-2 mb-3">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border-2 border-deepsea focus:border-spongebob"
            maxLength={200}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-spongebob hover:bg-yellow-600 text-deepsea px-4 py-2"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

        {/* SpongeBob themed emoji panel */}
        <div className="grid grid-cols-6 gap-2">
          {spongeBobEmojis.map((item) => (
            <Button
              key={item.emoji}
              onClick={() => sendEmoji(item.emoji)}
              variant="ghost"
              className="text-2xl hover:scale-125 hover:bg-bubble transition-all duration-200 p-2 h-auto"
              title={item.label}
            >
              {item.emoji}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
