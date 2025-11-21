import { TrendingUp, Users, Leaf, TreePine, Recycle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

interface EcoCounterProps {
  title: string;
  value: number;
  unit?: string;
  icon: 'waste' | 'users' | 'projects' | 'trees';
  trend?: number;
  color: 'green' | 'blue' | 'purple';
  description?: string;
}

export default function EcoCounter({ 
  title, 
  value, 
  unit = '', 
  icon, 
  trend, 
  color,
  description 
}: EcoCounterProps) {
  const { t } = useTranslation();

  const getIcon = () => {
    switch (icon) {
      case 'waste': return <Recycle className="h-5 w-5" />;
      case 'users': return <Users className="h-5 w-5" />;
      case 'projects': return <Leaf className="h-5 w-5" />;
      case 'trees': return <TreePine className="h-5 w-5" />;
      default: return <Leaf className="h-5 w-5" />;
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'green': return 'text-green-600 bg-green-50';
      case 'blue': return 'text-blue-600 bg-blue-50';
      case 'purple': return 'text-purple-600 bg-purple-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const formatValue = (val: number) => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    } else if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`;
    }
    return val.toLocaleString();
  };

  return (
    <Card className="eco-card-hover h-full">
      <CardContent className="p-3 h-full flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <div className={`p-1.5 rounded-lg ${getColorClasses()}`}>
            {getIcon()}
          </div>
          {trend && (
            <div className="flex items-center text-green-600 text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{trend}%
            </div>
          )}
        </div>
        
        <div className="space-y-1 flex-1 flex flex-col">
          <p className="text-xl font-bold text-gray-900 leading-tight">
            {formatValue(value)}{unit}
          </p>
          <p className="text-xs font-medium text-gray-700 leading-tight break-words hyphens-auto">
            {title}
          </p>
          {description && (
            <p className="text-xs text-gray-500 leading-relaxed break-words hyphens-auto mt-auto">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}