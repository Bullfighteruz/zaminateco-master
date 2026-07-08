import { Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { calculateLevel, LEVEL_CONFIG } from '@/lib/userData';
import { getLevelTitle } from '@/lib/gameSystem';

interface GameLevelProps {
  ecoPoints: number;
  showDetails?: boolean;
}

export default function GameLevel({ ecoPoints, showDetails = false }: GameLevelProps) {
  const level = calculateLevel(ecoPoints);
  const title = getLevelTitle(level);
  const maxLevel = LEVEL_CONFIG.maxLevel;

  // Progress within the current level (1000 pts per level)
  const pointsInCurrentLevel = ecoPoints % LEVEL_CONFIG.pointsPerLevel;
  const progress = (pointsInCurrentLevel / LEVEL_CONFIG.pointsPerLevel) * 100;
  const pointsToNext = LEVEL_CONFIG.pointsPerLevel - pointsInCurrentLevel;
  
  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="bg-white/20 rounded-full p-2 mr-3 flex items-center justify-center">
            <img 
              src="/images/level.webp" 
              alt="Level" 
              className="h-5 w-5 object-contain"
              loading="lazy"
            />
          </div>
          <div>
            <p className="text-sm opacity-90">Level {level}</p>
            <p className="font-semibold">{title}</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
          {ecoPoints.toLocaleString()} pts
        </Badge>
      </div>
      
      {showDetails && level < maxLevel && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm opacity-90">
            <span>Progress to Level {level + 1}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/20" />
          <p className="text-xs opacity-75">
            {pointsToNext} points to next level
          </p>
        </div>
      )}
      
      {level >= maxLevel && showDetails && (
        <div className="flex items-center justify-center mt-2">
          <Star className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">Maximum Level Reached!</span>
        </div>
      )}
    </div>
  );
}