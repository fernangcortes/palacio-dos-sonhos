import React, { useState } from 'react';
import { Achievement, AchievementCategory, AchievementState, UserProfile, Habit, Task } from '../types';
import { ACHIEVEMENT_CATALOG, getAchievementsByCategory } from '../data/achievements';
import { getAchievementCompletionPercentage } from '../services/achievementService';
import AchievementBadge from './AchievementBadge';

interface AchievementsViewProps {
  userProfile: UserProfile;
  habits: Habit[];
  tasks: Task[];
  onBack: () => void;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ userProfile, habits, tasks, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  
  const categories: Array<{ id: AchievementCategory | 'all'; label: string; icon: string }> = [
    { id: 'all', label: 'Todas', icon: '🏆' },
    { id: 'Construtor', label: 'Construtor', icon: '🏗️' },
    { id: 'Arquiteto', label: 'Arquiteto', icon: '🏛️' },
    { id: 'Visionário', label: 'Visionário', icon: '🔮' },
    { id: 'Mestre', label: 'Mestre', icon: '🎯' },
    { id: 'Social', label: 'Social', icon: '🤝' }
  ];

  // Ensure achievement state is initialized
  const achievementState = userProfile.achievementState || { 
    achievements: ACHIEVEMENT_CATALOG.map(a => ({ ...a })), 
    achievementPoints: 0 
  };
  const allAchievements = achievementState.achievements;
  const unlockedCount = allAchievements.filter(a => a.unlocked).length;
  const totalCount = allAchievements.length;
  const completionPercentage = getAchievementCompletionPercentage(achievementState);

  // Filter by category
  const filteredAchievements = selectedCategory === 'all'
    ? allAchievements
    : achievementState.achievements.filter(a => a.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-amber-200 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-stone-100 rounded-full transition-colors"
            >
              ←
            </button>
            <h1 className="text-2xl font-serif text-stone-800">🏆 Conquistas</h1>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white rounded-xl p-3 shadow-sm border border-amber-100">
              <div className="text-2xl font-bold text-amber-600">{achievementState.achievementPoints}</div>
              <div className="text-xs text-stone-500">Pontos de Conquista</div>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-amber-100">
              <div className="text-2xl font-bold text-stone-700">{completionPercentage}%</div>
              <div className="text-xs text-stone-500">Completo</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-stone-600 mb-1">
              <span>Progresso Geral</span>
              <span>{unlockedCount}/{totalCount}</span>
            </div>
            <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-stone-800 text-white shadow-md'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="max-w-md mx-auto px-4 py-6">
        {filteredAchievements.length === 0 ? (
          <div className="text-center py-12 text-stone-500">
            <p className="text-lg">Nenhuma conquista nesta categoria</p>
            <p className="text-sm mt-2">Continue construindo seus hábitos!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredAchievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                onClick={() => setSelectedAchievement(achievement)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedAchievement && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedAchievement(null)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center text-4xl ${
                selectedAchievement.unlocked 
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500' 
                  : 'bg-stone-200'
              }`}>
                {selectedAchievement.unlocked ? '✨' : '🔒'}
              </div>
              
              <h3 className="text-xl font-bold text-stone-800 mb-2">
                {selectedAchievement.title}
              </h3>
              
              <p className="text-stone-600 text-sm mb-4">
                {selectedAchievement.description}
              </p>
              
              <div className="flex justify-center gap-4 text-xs mb-4">
                <div className="text-center">
                  <div className="font-bold text-amber-600">{selectedAchievement.rewardXP} XP</div>
                  <div className="text-stone-500">Recompensa</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-stone-700 capitalize">{selectedAchievement.rarity}</div>
                  <div className="text-stone-500">Raridade</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-stone-700">{selectedAchievement.category}</div>
                  <div className="text-stone-500">Categoria</div>
                </div>
              </div>
              
              {!selectedAchievement.unlocked && (
                <div className="mb-4">
                  <div className="text-xs text-stone-500 mb-1">Progresso</div>
                  <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-stone-400 transition-all duration-500"
                      style={{ width: `${Math.min(100, (selectedAchievement.progress / selectedAchievement.condition.target) * 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    {selectedAchievement.progress} / {selectedAchievement.condition.target}
                  </div>
                </div>
              )}
              
              {selectedAchievement.unlocked && selectedAchievement.unlockedAt && (
                <div className="text-xs text-green-600 mb-4">
                  Desbloqueada em {new Date(selectedAchievement.unlockedAt).toLocaleDateString('pt-BR')}
                </div>
              )}
              
              <button
                onClick={() => setSelectedAchievement(null)}
                className="w-full py-2.5 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementsView;
