import React from 'react';
import { Achievement, AchievementRarity } from '../types';

interface AchievementBadgeProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress?: number;
  required?: number;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const getRarityColor = (rarity: AchievementRarity): string => {
  switch (rarity) {
    case 'legendary': return 'from-yellow-400 to-orange-500 shadow-yellow-500/50';
    case 'epic': return 'from-purple-400 to-pink-500 shadow-purple-500/50';
    case 'rare': return 'from-blue-400 to-cyan-500 shadow-blue-500/50';
    case 'uncommon': return 'from-green-400 to-emerald-500 shadow-green-500/50';
    case 'common': default: return 'from-gray-400 to-slate-500 shadow-gray-500/50';
  }
};

const getRarityBorder = (rarity: AchievementRarity): string => {
  switch (rarity) {
    case 'legendary': return 'border-yellow-500';
    case 'epic': return 'border-purple-500';
    case 'rare': return 'border-blue-500';
    case 'uncommon': return 'border-green-500';
    case 'common': default: return 'border-gray-500';
  }
};

const getSizeClasses = (size: 'sm' | 'md' | 'lg'): string => {
  switch (size) {
    case 'sm': return 'w-12 h-12 text-xs';
    case 'md': return 'w-16 h-16 text-sm';
    case 'lg': return 'w-24 h-24 text-base';
  }
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  isUnlocked,
  progress,
  required,
  onClick,
  size = 'md'
}) => {
  const baseClasses = `relative rounded-xl flex items-center justify-center font-bold transition-all duration-300 ${getSizeClasses(size)}`;
  
  if (isUnlocked) {
    const gradientClass = `bg-gradient-to-br ${getRarityColor(achievement.rarity)} shadow-lg`;
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${gradientClass} hover:scale-110 active:scale-95 border-2 ${getRarityBorder(achievement.rarity)}`}
        title={achievement.title}
      >
        <span className="text-white drop-shadow-md z-10">{achievement.icon}</span>
        <div className="absolute inset-0 bg-white opacity-0 hover:opacity-20 rounded-xl transition-opacity" />
      </button>
    );
  }

  // Locked state
  return (
    <div
      className={`${baseClasses} bg-gray-800 border-2 border-gray-700 opacity-60 cursor-not-allowed`}
      title={`Bloqueado: ${achievement.description}`}
    >
      <span className="text-gray-600 text-xl">🔒</span>
      {progress !== undefined && required && (
        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gray-500 transition-all duration-300"
            style={{ width: `${Math.min(100, (progress / required) * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default AchievementBadge;
