import React, { useEffect } from 'react';
import { Achievement } from '../types';

interface AchievementModalProps {
  achievement: Achievement;
  xpEarned: number;
  onClose: () => void;
}

export const AchievementModal: React.FC<AchievementModalProps> = ({
  achievement,
  xpEarned,
  onClose
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getRarityGradient = () => {
    switch (achievement.rarity) {
      case 'legendary': return 'from-yellow-400 via-orange-500 to-red-500';
      case 'epic': return 'from-purple-400 via-pink-500 to-rose-500';
      case 'rare': return 'from-blue-400 via-cyan-500 to-teal-500';
      case 'uncommon': return 'from-green-400 via-emerald-500 to-teal-500';
      case 'common': default: return 'from-gray-400 via-slate-500 to-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className={`relative w-full max-w-md bg-gradient-to-br ${getRarityGradient()} rounded-3xl p-1 shadow-2xl animate-bounce-in`}>
        <div className="bg-gray-900/95 rounded-[22px] p-8 text-center relative overflow-hidden">
          {/* Background effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-shimmer" />
          
          {/* Content */}
          <div className="relative z-10">
            <div className="text-6xl mb-4 animate-pulse">{achievement.icon}</div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              🏆 Conquista Desbloqueada!
            </h2>
            
            <h3 className={`text-xl font-bold bg-gradient-to-r ${getRarityGradient()} bg-clip-text text-transparent mb-3`}>
              {achievement.title}
            </h3>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              {achievement.description}
            </p>
            
            <div className="flex items-center justify-center gap-2 bg-yellow-500/20 rounded-full px-4 py-2 inline-block">
              <span className="text-yellow-400 font-bold">+{xpEarned} XP</span>
              <span className="text-yellow-500">⚡</span>
            </div>
            
            <div className="mt-6 flex justify-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getRarityGradient()} text-white`}>
                {achievement.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-700 text-gray-300 capitalize">
                {achievement.rarity}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default AchievementModal;
