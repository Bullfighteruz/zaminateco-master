import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LeaderboardEntry } from '@/types';

interface LeaderBoardProps {
  entries: LeaderboardEntry[];
  title?: string;
  showChange?: boolean;
}

export default function LeaderBoard({ 
  entries, 
  title = "Top Eco Warriors", 
  showChange = true 
}: LeaderBoardProps) {
  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-400" />;
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-600 bg-yellow-100';
      case 2: return 'text-gray-600 bg-gray-100';
      case 3: return 'text-amber-600 bg-amber-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.user.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-3">
              <Badge className={getRankColor(entry.rank)}>
                #{entry.rank}
              </Badge>
              <Avatar className="h-10 w-10">
                <AvatarFallback>{entry.user.avatar || entry.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900">{entry.user.name}</p>
                <p className="text-sm text-gray-500">
                  Level {entry.user.level} • {entry.user.wasteCollected}kg collected
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">{entry.score.toLocaleString()}</p>
              {showChange && (
                <div className="flex items-center justify-end">
                  {getTrendIcon(entry.change)}
                  <span className="text-xs ml-1 text-gray-500">
                    {entry.change !== 0 && (entry.change > 0 ? '+' : '')}{entry.change}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}