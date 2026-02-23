import React from 'react';
import { Trophy, X, Sparkles } from 'lucide-react';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ isOpen, onClose, newLevel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Content */}
      <div className="relative bg-white w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl border-4 border-amber-100 animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Trophy className="w-10 h-10 text-amber-500" />
        </div>

        <h2 className="text-3xl font-serif text-stone-800 mb-2">Novo Nível!</h2>
        <div className="flex items-center justify-center gap-2 text-rose-500 font-bold uppercase tracking-widest text-sm mb-6">
          <Sparkles className="w-4 h-4" />
          <span>Arquiteta Nível {newLevel}</span>
          <Sparkles className="w-4 h-4" />
        </div>

        <p className="text-stone-500 mb-8 leading-relaxed">
          Sua dedicação está construindo algo grandioso. A estrutura da sua casa dos sonhos acaba de ficar mais forte.
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-stone-800 text-white font-bold hover:bg-stone-700 shadow-lg transition-transform active:scale-95"
        >
          Continuar Construindo
        </button>
      </div>
    </div>
  );
};
