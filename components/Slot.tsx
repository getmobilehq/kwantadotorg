'use client';

interface SlotProps {
  isOccupied: boolean;
  playerInitials?: string;
  playerName?: string;
  onClick: () => void;
  teamColor: 'emerald' | 'blue';
  size?: 'sm' | 'md' | 'lg';
}

export default function Slot({ 
  isOccupied, 
  playerInitials, 
  playerName,
  onClick, 
  teamColor,
  size = 'md'
}: SlotProps) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  };

  const colorClasses = {
    emerald: isOccupied 
      ? 'bg-emerald-100 border-emerald-500 text-emerald-700' 
      : 'border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50',
    blue: isOccupied 
      ? 'bg-blue-100 border-blue-500 text-blue-700' 
      : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50'
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses[size]} 
        ${colorClasses[teamColor]}
        border-2 rounded-full 
        flex items-center justify-center 
        font-medium transition-all duration-200
        ${!isOccupied ? 'hover:scale-105' : ''}
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500
      `}
      title={isOccupied ? `${playerName} - Click to remove` : 'Click to claim this slot'}
    >
      {playerInitials}
    </button>
  );
}