import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: LucideIcon;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'indigo';
  onClick?: () => void;
  loading?: boolean;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color,
  onClick,
  loading = false,
  subtitle
}) => {
  const getColorClasses = () => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        icon: 'text-blue-600',
        iconBg: 'bg-blue-100'
      },
      green: {
        bg: 'bg-green-50',
        icon: 'text-green-600',
        iconBg: 'bg-green-100'
      },
      orange: {
        bg: 'bg-orange-50',
        icon: 'text-orange-600',
        iconBg: 'bg-orange-100'
      },
      purple: {
        bg: 'bg-purple-50',
        icon: 'text-purple-600',
        iconBg: 'bg-purple-100'
      },
      red: {
        bg: 'bg-red-50',
        icon: 'text-red-600',
        iconBg: 'bg-red-100'
      },
      indigo: {
        bg: 'bg-indigo-50',
        icon: 'text-indigo-600',
        iconBg: 'bg-indigo-100'
      }
    };
    return colors[color];
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-4 w-4" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600 bg-green-50';
      case 'decrease':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const colorClasses = getColorClasses();

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`
        bg-white rounded-xl p-6 shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md
        ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {value}
          </p>
          
          {subtitle && (
            <p className="text-xs text-gray-500 mb-2">
              {subtitle}
            </p>
          )}
          
          {change !== undefined && (
            <div className={`
              inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
              ${getChangeColor()}
            `}>
              {getChangeIcon()}
              <span className="ml-1">
                {changeType === 'increase' ? '+' : changeType === 'decrease' ? '-' : ''}
                {Math.abs(change)}%
              </span>
              <span className="ml-1 text-gray-500">vs mês anterior</span>
            </div>
          )}
        </div>
        
        <div className={`
          p-4 rounded-xl ${colorClasses.iconBg} transition-all duration-200
          ${onClick ? 'group-hover:scale-110' : ''}
        `}>
          <Icon className={`h-8 w-8 ${colorClasses.icon}`} />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;