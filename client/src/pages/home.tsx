import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParticleSystem } from "@/components/game/particle-system";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const response = await apiRequest("POST", endpoint, { username, password });
      const data = await response.json();

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(data.user));

      toast({
        title: "Success",
        description: isLogin ? "Logged in successfully!" : "Account created successfully!",
      });

      setLocation("/lobby");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Authentication failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen game-background flex items-center justify-center p-4">
      <ParticleSystem />
      
      <Card className="w-full max-w-md bg-bubble bg-opacity-90 backdrop-blur-sm border-4 border-spongebob shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-cartoon text-deepsea mb-2">
              🍔 UNO: Bikini Bottom 🍔
            </h1>
            <p className="text-lg text-deepsea">
              Join SpongeBob and friends for the ultimate card game!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-deepsea font-semibold">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="border-2 border-deepsea focus:border-spongebob"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-deepsea font-semibold">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="border-2 border-deepsea focus:border-spongebob"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-spongebob hover:bg-yellow-600 text-deepsea font-bold py-3 text-lg border-2 border-krabs"
            >
              {isLoading ? "Loading..." : isLogin ? "Login" : "Register"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-deepsea hover:text-krabs font-semibold"
              >
                {isLogin ? "Need an account? Register" : "Already have an account? Login"}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl mb-1">🧽</div>
                <div className="text-xs text-deepsea">SpongeBob</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">⭐</div>
                <div className="text-xs text-deepsea">Patrick</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🦀</div>
                <div className="text-xs text-deepsea">Mr. Krabs</div>
              </div>
            </div>
            <p className="text-xs text-deepsea">
              Play against iconic Bikini Bottom characters!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
