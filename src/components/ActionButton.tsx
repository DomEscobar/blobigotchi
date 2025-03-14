
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ActionButtonProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon: Icon,
  onClick,
  disabled = false,
  className,
}) => {
  const isMobile = useIsMobile();
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "pixel-button group relative overflow-hidden",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:animate-pixel-pop",
        className
      )}
    >
      <div className="flex flex-col items-center gap-1">
        <Icon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-blob-secondary group-hover:text-blob-primary transition-colors`} />
        <span className={`pixel-text ${isMobile ? 'text-[8px]' : 'text-xs'} text-white whitespace-nowrap`}>{label}</span>
      </div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blob-primary/0 via-blob-secondary/0 to-blob-tertiary/0 group-hover:from-blob-primary/10 group-hover:via-blob-secondary/10 group-hover:to-blob-tertiary/10 transition-opacity"></div>
    </button>
  );
};

export default ActionButton;
