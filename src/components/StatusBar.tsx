
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface StatusBarProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  maxValue?: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  maxValue = 100 
}) => {
  const isMobile = useIsMobile();
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  
  return (
    <div className="status-container group">
      <Icon 
        size={isMobile ? 14 : 16} 
        className={`text-${color} transition-transform group-hover:scale-110`} 
      />
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-center">
          <span className={`pixel-text ${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-300`}>{label}</span>
          <span className={`pixel-text ${isMobile ? 'text-[9px]' : 'text-xs'} text-gray-400`}>{Math.floor(value)}/{maxValue}</span>
        </div>
        <div className="h-2 w-full bg-gray-800 rounded-sm overflow-hidden mt-1">
          <div 
            className={`pixel-progress bg-${color}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
