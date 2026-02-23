import React from 'react';
import { Habit, UserProfile } from '../types';
// @ts-ignore - Vite will bundle this image correctly
import defaultHouseImage from '../media/palacio-medieval/palacio-medieval-v01.png';
import { Loader2, Sparkles, AlertTriangle, ShieldCheck, Trash2, Check, Plus, Lock, icons } from 'lucide-react';

interface ConstructionSiteProps {
  habits: Habit[];
  userProfile: UserProfile;
  onAddHabit: () => void;
  onHabitAction: (id: string, action: 'success' | 'fail', date: string) => void;
  onDeleteHabit: (id: string) => void;
  onEvolveHouse: () => void;
  onPrestige: () => void;
  isEvolving: boolean;
}

export const ConstructionSite: React.FC<ConstructionSiteProps> = ({
  habits,
  userProfile,
  onAddHabit,
  onHabitAction,
  onDeleteHabit,
  onEvolveHouse,
  onPrestige,
  isEvolving
}) => {

  // Default fallback if no AI image exists yet
  const displayImage = userProfile.houseImageUrl || defaultHouseImage;
  const isNegativeBalance = userProfile.xp < 0;
  const isFinished = userProfile.xp >= 1000;
  const xpPercentage = Math.max(0, Math.min(100, (userProfile.xp / 1000) * 100));

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-stone-50">
      {/* Gamification Header */}
      <div className="relative h-72 w-full overflow-hidden group">
        <div className="absolute inset-0 bg-stone-900/20 z-10 transition-colors group-hover:bg-stone-900/10"></div>

        {/* House Image */}
        <div className="w-full h-full relative">
          <img
            src={displayImage}
            alt="Current House State"
            className={`w-full h-full object-cover transition-transform duration-1000 ${isEvolving ? 'scale-105 blur-sm' : 'hover:scale-105'} ${isNegativeBalance ? 'grayscale-[0.5] contrast-125' : ''}`}
          />
          {isEvolving && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-stone-900/60 backdrop-blur-sm">
              <Loader2 className="w-10 h-10 text-amber-300 animate-spin mb-2" />
              <p className="text-white font-serif text-sm tracking-wider">Erguendo Tijolos (8-bit)...</p>
            </div>
          )}

          {isFinished && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-1000">
              <Sparkles className="w-16 h-16 text-amber-400 mb-4 animate-pulse" />
              <h2 className="text-3xl font-serif text-white mb-6 drop-shadow-lg text-center px-4">Obra Concluída!</h2>
              <button
                onClick={onPrestige}
                className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-white font-bold rounded-full shadow-[0_0_20px_rgba(251,191,36,0.5)] hover:scale-105 transition-transform"
              >
                Arquivar Palácio & Iniciar Nova Obra
              </button>
            </div>
          )}
        </div>

        {/* Evolve Button - Visible if no custom image OR user wants to update */}
        <button
          onClick={onEvolveHouse}
          disabled={isEvolving}
          className={`absolute top-4 right-4 z-40 backdrop-blur-md border rounded-full p-2 transition-all shadow-lg active:scale-95 ${isNegativeBalance
            ? 'bg-red-900/40 border-red-400/50 text-red-200 hover:bg-red-900/60'
            : 'bg-white/20 border-white/40 text-white hover:bg-white/30'
            }`}
          title="Materializar Progresso (ou Ruína)"
        >
          {isNegativeBalance ? <AlertTriangle className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-stone-900/90 via-stone-900/50 to-transparent text-white">
          <div className="flex justify-between items-end">
            <div>
              <p className={`text-xs uppercase tracking-widest mb-1 font-bold ${isNegativeBalance ? 'text-red-400' : 'text-amber-300'}`}>
                {isNegativeBalance ? 'Estrutura Comprometida' : userProfile.architecturalStyle}
              </p>
              <h1 className="text-3xl font-serif italic drop-shadow-md">
                {userProfile.xp <= -100 ? "Ruínas" : userProfile.xp >= 1000 ? "Palácio dos Sonhos" : `Fase ${Math.floor(xpPercentage)}%`}
              </h1>
            </div>
            <div className="text-right">
              <span className={`text-3xl font-bold font-serif ${isNegativeBalance ? 'text-red-300' : 'text-white'}`}>
                {userProfile.xp}
              </span>
              <span className="text-xs uppercase ml-1 opacity-80 tracking-wider">/ 1000 XP</span>
            </div>
          </div>

          {/* XP Bar */}
          <div className={`mt-4 h-1.5 w-full rounded-full overflow-hidden backdrop-blur-sm border ${isNegativeBalance ? 'bg-stone-800 border-red-900/50' : 'bg-stone-700/50 border-stone-600/30'}`}>
            <div
              className={`h-full transition-all duration-500 ease-out ${isNegativeBalance
                ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]'
                : 'bg-gradient-to-r from-rose-300 via-rose-400 to-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                }`}
              style={{ width: `${isNegativeBalance ? 100 : xpPercentage}%` }}
            />
          </div>
          {isNegativeBalance && (
            <p className="text-[10px] text-red-300 mt-2 font-mono text-right">
              Integridade: {userProfile.xp} / -100 (Crítico)
            </p>
          )}
        </div>
      </div>

      {/* Habits List */}
      <div className="flex-1 px-6 -mt-6 relative z-30">
        <div className="bg-stone-50 rounded-t-3xl min-h-[500px] pt-8 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif text-stone-800">Seus Pilares</h2>
            <button
              onClick={onAddHabit}
              className="group flex items-center justify-center w-10 h-10 rounded-full bg-stone-800 text-white hover:bg-stone-700 transition-all shadow-md active:scale-95"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          {habits.length === 0 ? (
            <div className="text-center py-12 px-8 border-2 border-dashed border-stone-200 rounded-2xl bg-white/50">
              <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center mb-4 shadow-sm">
                <Lock className="w-6 h-6 text-stone-300" />
              </div>
              <p className="text-stone-500 font-serif mb-2 text-lg">O terreno está vazio.</p>
              <p className="text-sm text-stone-400">Toque no + para iniciar a fundação do seu primeiro hábito.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {habits.map((habit) => {
                const today = new Date().toISOString().split('T')[0];
                const todayRecord = habit.records?.[today];
                const isNegative = habit.goalType === 'negative';

                const isGain = todayRecord && todayRecord.xpDiff > 0;
                const isLoss = todayRecord && (todayRecord.xpDiff < 0 || todayRecord.shieldConsumed);

                let cardBgClass = isNegative
                  ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  : 'bg-white border-stone-100 hover:border-rose-100';

                if (isGain) {
                  cardBgClass = 'bg-emerald-100/60 border-emerald-200 hover:border-emerald-300';
                } else if (isLoss) {
                  cardBgClass = 'bg-rose-100/60 border-rose-200 hover:border-rose-300';
                }

                // Dynamically resolve icon, with fallback to nothing if optional
                const IconComponent = habit.icon && (icons as any)[habit.icon] ? (icons as any)[habit.icon] : null;

                return (
                  <div
                    key={habit.id}
                    className={`group relative rounded-2xl p-4 shadow-sm border flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5
                      ${cardBgClass}`}
                  >
                    {/* Icon Container */}
                    <div className={`w-16 h-16 rounded-xl overflow-hidden border shrink-0 relative flex items-center justify-center shadow-inner
                      ${habit.color || 'bg-rose-500'} ${isNegative && !isGain ? 'grayscale-[0.5] opacity-80' : ''}
                    `}>
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10"></div>
                      {IconComponent && <IconComponent className={`w-8 h-8 text-white z-20 drop-shadow-sm group-hover:scale-110 transition-transform duration-500 ${isNegative ? 'opacity-70' : ''}`} />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col items-start justify-center">
                      <span className={`text-[12px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full truncate max-w-full
                        ${isNegative
                          ? 'bg-slate-200 text-slate-600 shadow-sm'
                          : 'bg-white text-stone-700 shadow-sm'
                        }
                      `}>
                        {habit.title}
                      </span>
                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-xs text-stone-400 flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${habit.streak > 0 ? 'bg-green-400' : 'bg-stone-300'}`}></span>
                          {habit.streak} sequência
                        </p>
                        {!!habit.shieldDays && habit.shieldDays > 0 && (
                          <p className="text-xs text-blue-500 font-bold flex items-center gap-1" title={`${habit.shieldDays} dia(s) de escudo disponíveis`}>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {habit.shieldDays}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {/* Delete Button (Visible on Hover/Touch) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteHabit(habit.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 text-stone-300 hover:text-red-400 hover:bg-red-50 rounded-full transition-all"
                        title="Demolir hábito"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Dual Action Buttons */}
                      <div className="flex items-center gap-1 bg-white rounded-full p-1 border border-stone-200 shadow-inner">
                        <button
                          onClick={() => onHabitAction(habit.id, isNegative ? 'success' : 'fail', today)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all ${todayRecord?.action === (isNegative ? 'success' : 'fail')
                            ? isNegative
                              ? 'bg-emerald-500 text-white shadow-md'
                              : 'bg-rose-500 text-white shadow-md'
                            : 'text-stone-400 hover:bg-white hover:text-stone-600 shadow-sm'
                            }`}
                          title="Não fiz hoje"
                        >
                          -
                        </button>

                        <button
                          onClick={() => onHabitAction(habit.id, isNegative ? 'fail' : 'success', today)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all ${todayRecord?.action === (isNegative ? 'fail' : 'success')
                            ? isNegative
                              ? 'bg-rose-500 text-white shadow-md'
                              : 'bg-emerald-500 text-white shadow-md'
                            : 'text-stone-400 hover:bg-white hover:text-stone-600 shadow-sm'
                            }`}
                          title="Fiz hoje"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
