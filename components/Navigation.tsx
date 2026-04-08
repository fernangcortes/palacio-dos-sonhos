import React from 'react';
import { LayoutGrid, ListTodo, Armchair, User, BarChart3, Trophy } from 'lucide-react';
import { AppView } from '../types';

interface NavigationProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: AppView.HABITS, icon: LayoutGrid, label: 'HÁBITOS' },
    { id: AppView.TASKS, icon: ListTodo, label: 'TAREFAS' },
    { id: AppView.ANALYTICS, icon: BarChart3, label: 'STATS' },
    { id: AppView.ACHIEVEMENTS, icon: Trophy, label: 'CONQUISTAS' },
    { id: AppView.OFFICE, icon: Armchair, label: 'SALA' },
    { id: AppView.PROFILE, icon: User, label: 'PERFIL' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-stone-50 border-t border-rose-100 pb-safe pt-2 px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-between items-center max-w-md mx-auto h-16">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center justify-center w-16 transition-all duration-300 ${isActive ? 'text-stone-800 -translate-y-1' : 'text-stone-400 hover:text-rose-400'
                }`}
            >
              <item.icon
                className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`}
              />
              <span className={`text-[9px] uppercase tracking-widest font-bold ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
