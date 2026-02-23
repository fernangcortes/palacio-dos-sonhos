import React from 'react';
import { Habit, UserProfile, Task } from '../types';
import { BarChart3, TrendingUp, Zap, Trophy, Target, Star } from 'lucide-react';

interface AnalyticsViewProps {
    habits: Habit[];
    userProfile: UserProfile;
    tasks: Task[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ habits, userProfile, tasks }) => {
    // --- Calculations ---
    const totalLifetimeXp = (userProfile.completedHouses || 0) * 1000 + userProfile.xp;
    const completedTasksCount = tasks.filter(t => t.completed).length;

    // Strongest habit (highest current streak)
    const strongestHabit = [...habits].sort((a, b) => (b.streak || 0) - (a.streak || 0))[0];

    // Helper for last 7 days
    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().split('T')[0]);
        }
        return days;
    };

    const last7Days = getLast7Days();

    // Data for Habit Completion Chart
    const habitCompletionData = last7Days.map(dateStr => {
        const activeHabits = habits.filter(h => h.goalType === 'positive');
        if (activeHabits.length === 0) return 0;

        const completedCount = activeHabits.filter(h =>
            h.records?.[dateStr]?.action === 'success'
        ).length;

        return (completedCount / activeHabits.length) * 100;
    });

    // Data for XP Timeline Chart
    const xpTimelineData = last7Days.map(dateStr => {
        let dailyXp = 0;
        habits.forEach(h => {
            if (h.records?.[dateStr]) {
                dailyXp += h.records[dateStr].xpDiff || 0;
            }
        });
        return dailyXp;
    });

    const maxDailyXp = Math.max(...xpTimelineData, 100);

    return (
        <div className="min-h-screen bg-stone-50 pb-24 pt-8 px-6 overflow-y-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-serif text-stone-800">Estatísticas</h1>
                <p className="text-stone-400 text-sm mt-1">Sua jornada de evolução</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm flex flex-col justify-between">
                    <div className="bg-amber-50 w-10 h-10 rounded-2xl flex items-center justify-center mb-3">
                        <Zap className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-stone-800">{totalLifetimeXp}</p>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">XP Total</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm flex flex-col justify-between">
                    <div className="bg-blue-50 w-10 h-10 rounded-2xl flex items-center justify-center mb-3">
                        <Target className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-stone-800">{completedTasksCount}</p>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Missões</p>
                    </div>
                </div>
            </div>

            {/* Strongest Habit Card */}
            {strongestHabit && (
                <div className="bg-stone-800 p-5 rounded-3xl shadow-xl mb-8 relative overflow-hidden">
                    <Star className="absolute -right-4 -top-4 w-24 h-24 text-white/5 rotate-12" />
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-white/10 p-2 rounded-xl">
                            <Trophy className="w-5 h-5 text-amber-300" />
                        </div>
                        <span className="text-[10px] font-bold text-amber-200 uppercase tracking-widest">Hábito Lendário</span>
                    </div>
                    <h3 className="text-xl font-serif text-white mb-1">{strongestHabit.title}</h3>
                    <p className="text-stone-400 text-xs italic">Mantendo uma chama de {strongestHabit.streak} dias!</p>
                </div>
            )}

            {/* Habits Completion Chart */}
            <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Conclusão Semanal</h3>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="flex items-end justify-between h-32 gap-2">
                    {habitCompletionData.map((percent, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                            <div className="w-full relative h-full flex items-end">
                                <div
                                    className={`w-full rounded-t-lg transition-all duration-1000 ${percent > 70 ? 'bg-emerald-400' : percent > 30 ? 'bg-amber-400' : 'bg-rose-400'
                                        }`}
                                    style={{ height: `${Math.max(percent, 5)}%` }}
                                >
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-stone-800 text-white text-[9px] py-1 px-2 rounded-lg pointer-events-none">
                                        {Math.round(percent)}%
                                    </div>
                                </div>
                            </div>
                            <span className="text-[9px] font-bold text-stone-300 uppercase">
                                {new Date(last7Days[i] + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'narrow' })}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* XP Timeline Chart */}
            <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Fluxo de XP</h3>
                    <BarChart3 className="w-4 h-4 text-violet-400" />
                </div>

                <div className="flex items-end justify-between h-32 gap-3">
                    {xpTimelineData.map((xp, i) => {
                        const hPercent = (Math.abs(xp) / maxDailyXp) * 100;
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <div className="w-full relative h-full flex items-center justify-center">
                                    {/* Center Line */}
                                    <div className="absolute w-full h-[1px] bg-stone-100 left-0 top-1/2" />

                                    <div
                                        className={`w-2 sm:w-3 rounded-full transition-all duration-1000 ${xp >= 0 ? 'bg-violet-400' : 'bg-stone-300 opacity-50'
                                            }`}
                                        style={{
                                            height: `${Math.max(hPercent, 10)}%`,
                                            transform: xp < 0 ? 'translateY(25%)' : 'translateY(-25%)'
                                        }}
                                    >
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-stone-800 text-white text-[9px] py-1 px-2 rounded-lg pointer-events-none">
                                            {xp > 0 ? '+' : ''}{xp} XP
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[9px] font-bold text-stone-300 uppercase italic">
                                    {new Date(last7Days[i] + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit' })}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
