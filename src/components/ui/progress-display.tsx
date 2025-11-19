import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Award, Users } from 'lucide-react';

interface ProgressItem {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  icon?: React.ReactNode;
}

interface ProgressDisplayProps {
  title: string;
  items: ProgressItem[];
  showAnimation?: boolean;
  updateInterval?: number;
}

export const ProgressDisplay: React.FC<ProgressDisplayProps> = ({
  title,
  items,
  showAnimation = true,
  updateInterval = 2000
}) => {
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});

  useEffect(() => {
    // Initialize animated values
    const initialValues: Record<string, number> = {};
    items.forEach(item => {
      initialValues[item.id] = showAnimation ? 0 : item.current;
    });
    setAnimatedValues(initialValues);

    if (showAnimation) {
      // Animate to actual values
      const timer = setTimeout(() => {
        const targetValues: Record<string, number> = {};
        items.forEach(item => {
          targetValues[item.id] = item.current;
        });
        setAnimatedValues(targetValues);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [items, showAnimation]);

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 100) return { text: 'Completed', variant: 'default' as const };
    if (percentage >= 75) return { text: 'On Track', variant: 'secondary' as const };
    if (percentage >= 50) return { text: 'In Progress', variant: 'outline' as const };
    return { text: 'Needs Attention', variant: 'destructive' as const };
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-green-800">
          <TrendingUp className="h-6 w-6" />
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {items.map((item, index) => {
          const animatedValue = animatedValues[item.id] || 0;
          const percentage = getProgressPercentage(animatedValue, item.target);
          const statusBadge = getStatusBadge(percentage);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.icon || <Target className="h-5 w-5 text-green-600" />}
                  <h4 className="font-medium text-gray-800">{item.label}</h4>
                </div>
                <Badge variant={statusBadge.variant} className="text-xs">
                  {statusBadge.text}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Progress: {Math.round(percentage)}%
                  </span>
                  <span className={`font-semibold ${getStatusColor(percentage)}`}>
                    <motion.span
                      key={animatedValue}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {Math.round(animatedValue).toLocaleString()}
                    </motion.span>
                    {' / '}
                    {item.target.toLocaleString()} {item.unit}
                  </span>
                </div>

                <div className="relative">
                  <Progress 
                    value={percentage} 
                    className="h-3"
                    style={{ 
                      background: `linear-gradient(to right, ${item.color}20, ${item.color}40)` 
                    }}
                  />
                  
                  {percentage >= 100 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      <Award className="h-4 w-4 text-yellow-500" />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Real-time indicator */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                />
                <span>Live updates</span>
              </div>
            </motion.div>
          );
        })}

        {/* Summary statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: items.length * 0.1 }}
          className="mt-6 pt-4 border-t border-gray-200"
        >
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">
                {items.filter(item => getProgressPercentage(animatedValues[item.id] || 0, item.target) >= 100).length}
              </div>
              <div className="text-xs text-gray-500">Completed Goals</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(
                  items.reduce((acc, item) => 
                    acc + getProgressPercentage(animatedValues[item.id] || 0, item.target), 0
                  ) / items.length
                )}%
              </div>
              <div className="text-xs text-gray-500">Overall Progress</div>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

// Real-time progress hook for live updates
export const useRealTimeProgress = (initialItems: ProgressItem[], updateInterval: number = 5000) => {
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems(currentItems => 
        currentItems.map(item => ({
          ...item,
          current: Math.min(
            item.current + Math.random() * (item.target * 0.02), // Random increment up to 2% of target
            item.target
          )
        }))
      );
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  return items;
};