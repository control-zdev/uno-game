import { Achievement } from "@shared/schema";
import { cn } from "@/lib/utils";
import { 
  Trophy, 
  Crown, 
  Zap, 
  Target, 
  Medal, 
  Wand2, 
  MessageCircle, 
  TrendingUp, 
  Flame, 
  Clock, 
  Palette, 
  SkipForward, 
  RotateCcw, 
  Plus, 
  Star, 
  Timer, 
  Bot, 
  DoorOpen, 
  TrendingUp as ChartLine, 
  Lock,
  Cookie
} from "lucide-react";

interface AchievementBadgeProps {
  achievement: Achievement;
  onClick?: () => void;
  className?: string;
}

export function AchievementBadge({ achievement, onClick, className }: AchievementBadgeProps) {
  const getIcon = () => {
    switch (achievement.icon) {
      case "trophy": return <Trophy className="w-6 h-6" />;
      case "crown": return <Crown className="w-6 h-6" />;
      case "bolt": return <Zap className="w-6 h-6" />;
      case "target": return <Target className="w-6 h-6" />;
      case "medal": return <Medal className="w-6 h-6" />;
      case "magic": return <Wand2 className="w-6 h-6" />;
      case "comments": return <MessageCircle className="w-6 h-6" />;
      case "phoenix": return <TrendingUp className="w-6 h-6" />;
      case "fire": return <Flame className="w-6 h-6" />;
      case "hourglass": return <Clock className="w-6 h-6" />;
      case "palette": return <Palette className="w-6 h-6" />;
      case "forward": return <SkipForward className="w-6 h-6" />;
      case "undo": return <RotateCcw className="w-6 h-6" />;
      case "plus": return <Plus className="w-6 h-6" />;
      case "star": return <Star className="w-6 h-6" />;
      case "clock": return <Timer className="w-6 h-6" />;
      case "robot": return <Bot className="w-6 h-6" />;
      case "door-open": return <DoorOpen className="w-6 h-6" />;
      case "chart-line": return <ChartLine className="w-6 h-6" />;
      case "burger": return <Cookie className="w-6 h-6" />;
      case "cards-blank": return <div className="w-6 h-6 bg-white rounded border-2 border-deepsea" />;
      case "lock": 
      default: 
        return <Lock className="w-6 h-6" />;
    }
  };

  return (
    <div
      className={cn(
        "achievement-badge relative cursor-pointer transition-all duration-300 hover:scale-110",
        !achievement.unlocked && "opacity-50 grayscale",
        className
      )}
      onClick={onClick}
      title={`${achievement.name}: ${achievement.description}`}
    >
      <div className="relative z-10">
        {getIcon()}
      </div>
      
      {achievement.unlocked && (
        <div className="absolute inset-0 animate-shine" />
      )}
      
      {achievement.unlocked && achievement.unlockedAt && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-squidward rounded-full border-2 border-white flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
}
