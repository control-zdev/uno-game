import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, AlertTriangle } from "lucide-react";
import { ChatMessage } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface ChatSystemProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, type?: string) => void;
  currentUsername: string;
}

export function ChatSystem({ messages, onSendMessage, currentUsername }: ChatSystemProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [messageFilter, setMessageFilter] = useState<"all" | "game" | "chat">("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Basic client-side validation
    if (inputMessage.length > 200) {
      toast({
        title: "Message Too Long",
        description: "Messages must be 200 characters or less",
        variant: "destructive",
      });
      return;
    }

    // Check for excessive caps
    const capsCount = (inputMessage.match(/[A-Z]/g) || []).length;
    if (capsCount > inputMessage.length * 0.5 && inputMessage.length > 10) {
      toast({
        title: "Message Rejected",
        description: "Please avoid excessive caps lock",
        variant: "destructive",
      });
      return;
    }

    // Check for spam patterns
    const repeatedPattern = /(.)\1{4,}/;
    if (repeatedPattern.test(inputMessage)) {
      toast({
        title: "Message Rejected",
        description: "Please avoid repeating characters",
        variant: "destructive",
      });
      return;
    }

    onSendMessage(inputMessage.trim());
    setInputMessage("");
  };

  const filteredMessages = messages.filter(msg => {
    if (messageFilter === "all") return true;
    if (messageFilter === "game") return msg.type === "game" || msg.type === "system";
    if (messageFilter === "chat") return msg.type === "message";
    return true;
  });

  const getMessageStyle = (message: ChatMessage) => {
    if (message.type === "system") return "bg-krabs text-white";
    if (message.type === "game") return "bg-squidward text-white";
    if (message.username === currentUsername) return "bg-spongebob text-deepsea ml-auto";
    return "bg-bubble text-deepsea";
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "system": return "🔧";
      case "game": return "🎮";
      default: return "💬";
    }
  };

  return (
    <Card className="bg-bubble bg-opacity-90 backdrop-blur-sm border-4 border-patrick shadow-xl h-full flex flex-col">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-cartoon text-deepsea flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Bikini Bottom Chat
          </CardTitle>
          <div className="flex space-x-1">
            <Button
              variant={messageFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setMessageFilter("all")}
              className="text-xs"
            >
              All
            </Button>
            <Button
              variant={messageFilter === "game" ? "default" : "outline"}
              size="sm"
              onClick={() => setMessageFilter("game")}
              className="text-xs"
            >
              Game
            </Button>
            <Button
              variant={messageFilter === "chat" ? "default" : "outline"}
              size="sm"
              onClick={() => setMessageFilter("chat")}
              className="text-xs"
            >
              Chat
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 mb-4 max-h-64">
          <div className="space-y-3">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🐠</div>
                <p className="text-deepsea">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg max-w-xs ${getMessageStyle(message)}`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm">{getMessageIcon(message.type)}</span>
                    <span className="font-semibold text-sm">{message.username}</span>
                    <span className="text-xs opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <p className="text-sm break-words">{message.message}</p>
                  {message.type === "system" && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      System
                    </Badge>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message... (family-friendly only)"
            className="flex-1 border-2 border-deepsea focus:border-spongebob"
            maxLength={200}
          />
          <Button 
            type="submit" 
            disabled={!inputMessage.trim()}
            className="bg-squidward hover:bg-green-600 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        
        {/* Chat Rules */}
        <div className="mt-2 p-2 bg-sandy bg-opacity-20 rounded border border-sandy">
          <div className="flex items-center space-x-2 text-xs text-deepsea">
            <AlertTriangle className="w-3 h-3" />
            <span>Keep it friendly! Inappropriate messages will be filtered.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}