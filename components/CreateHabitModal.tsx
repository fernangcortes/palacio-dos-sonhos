import React, { useState } from 'react';
import {
  X, Target, Zap, Clock, Palette, Image as ImageIcon, Plus, icons
} from 'lucide-react';
import { Habit, HabitDifficulty } from '../types';

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Habit) => void;
}

const POPULAR_ICONS = [
  'Activity', 'AlarmClock', 'AlertCircle', 'AlertTriangle', 'AlignLeft', 'Anchor', 'Aperture', 'Archive', 'ArrowRight', 'AtSign', 'Award', 'Battery', 'Bell', 'Bluetooth', 'Book', 'Bookmark', 'Box', 'Briefcase', 'Calendar', 'Camera', 'Cast', 'Check', 'CheckCircle', 'ChevronRight', 'Clipboard', 'Clock', 'Cloud', 'Code', 'Coffee', 'Compass', 'Crosshair', 'Database', 'Download', 'Droplet', 'Edit', 'Eye', 'Feather', 'FileText', 'Film', 'Filter', 'Flag', 'Folder', 'Gift', 'Globe', 'Headphones', 'Heart', 'Home', 'Image', 'Inbox', 'Info', 'Key', 'Layers', 'Layout', 'LifeBuoy', 'Link', 'List', 'Lock', 'Map', 'MapPin', 'MessageCircle', 'MessageSquare', 'Mic', 'Monitor', 'Moon', 'Music', 'Navigation', 'Package', 'Paperclip', 'PenTool', 'Percent', 'Phone', 'PieChart', 'Play', 'Power', 'Printer', 'Radio', 'RefreshCw', 'Repeat', 'Save', 'Scissors', 'Search', 'Send', 'Settings', 'Share2', 'Shield', 'ShoppingBag', 'ShoppingCart', 'Shuffle', 'Sliders', 'Smartphone', 'Smile', 'Speaker', 'Star', 'Sun', 'Sunrise', 'Sunset', 'Tablet', 'Tag', 'Target', 'Terminal', 'ThumbsUp', 'Tool', 'Trash2', 'TrendingUp', 'Truck', 'Tv', 'Type', 'Umbrella', 'Unlock', 'Upload', 'User', 'UserCheck', 'UserPlus', 'Users', 'Video', 'Volume2', 'Watch', 'Wifi', 'Wind', 'Zap', 'ZoomIn', 'Dumbbell', 'Gamepad2', 'Coins', 'Brush', 'Utensils', 'Brain', 'Palette'
];

const PRESET_COLORS = [
  'bg-rose-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-blue-500',
  'bg-violet-500',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-stone-600'
];

export const CreateHabitModal: React.FC<CreateHabitModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalType, setGoalType] = useState<'positive' | 'negative'>('positive');
  const [difficulty, setDifficulty] = useState<HabitDifficulty>('Medium');
  const [frequency, setFrequency] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [selectedIcon, setSelectedIcon] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-rose-500');
  const [showIconPicker, setShowIconPicker] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;

    const newHabit: Habit = {
      id: Date.now().toString(),
      title: title.trim(),
      category: goalType === 'positive' ? 'Construção' : 'Atenção',
      description: description.trim(),
      icon: selectedIcon,
      color: selectedColor,
      frequency: frequency,
      difficulty: difficulty,
      streak: 0,
      completedDates: [],
      goalType: goalType
    };

    onSave(newHabit);
    resetState();
    onClose();
  };

  const resetState = () => {
    setTitle('');
    setDescription('');
    setGoalType('positive');
    setDifficulty('Medium');
    setFrequency('Daily');
    setSelectedIcon('');
    setSelectedColor('bg-rose-500');
    setShowIconPicker(false);
  };

  const difficultyLevels: { level: HabitDifficulty; label: string; xp: string }[] = [
    { level: 'Trivial', label: 'Trivial', xp: '2 XP' },
    { level: 'Easy', label: 'Fácil', xp: '4 XP' },
    { level: 'Medium', label: 'Médio', xp: '6 XP' },
    { level: 'Hard', label: 'Difícil', xp: '10 XP' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={() => { resetState(); onClose(); }}></div>

      {/* Modal */}
      <div className="relative w-full max-w-md bg-stone-50 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="font-serif text-2xl text-stone-800 font-bold">Adicionar Hábito</h2>
          <button
            onClick={() => { resetState(); onClose(); }}
            className="p-2 hover:bg-stone-200 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-stone-400" />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar pb-safe space-y-6">

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider pl-1">Nome do Hábito</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Correr 5km, Beber Água"
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-lg font-serif text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all font-bold"
            />
          </div>

          {/* Icon & Color Selection */}
          <div className="p-4 bg-white border border-stone-100 rounded-2xl shadow-sm space-y-4">
            <div className="space-y-3">
              <label className="flex items-center gap-1.5 text-xs font-bold text-stone-400 uppercase tracking-wider">
                <Palette className="w-3.5 h-3.5" />
                Cor do Bloco
              </label>
              <div className="flex gap-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full transition-all ${color} ${selectedColor === color ? 'ring-4 ring-offset-2 ring-amber-200 scale-110 shadow-md' : 'hover:scale-105 opacity-80'}`}
                  />
                ))}
              </div>

              <div className="pt-2 border-t border-stone-100 flex flex-col items-start gap-2">
                <label className="flex items-center gap-1.5 text-xs font-bold text-stone-400 uppercase tracking-wider">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Ícone (Opcional)
                </label>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition-all ${selectedIcon
                      ? `${selectedColor} text-white shadow-md border-transparent font-bold`
                      : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-white font-medium'
                      }`}
                  >
                    {selectedIcon ? (
                      <>
                        {React.createElement((icons as any)[selectedIcon], { className: "w-5 h-5" })}
                        {selectedIcon}
                      </>
                    ) : (
                      "Escolher Ícone"
                    )}
                  </button>

                  {selectedIcon && (
                    <button
                      onClick={() => setSelectedIcon('')}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Remover Ícone"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {showIconPicker && (
                  <div className="mt-2 p-2 bg-stone-50 border border-stone-200 rounded-xl max-h-48 overflow-y-auto custom-scrollbar w-full">
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                      {POPULAR_ICONS.map((iconId) => {
                        const IconComponent = (icons as any)[iconId];
                        if (!IconComponent) return null;
                        return (
                          <button
                            key={iconId}
                            onClick={() => { setSelectedIcon(iconId); setShowIconPicker(false); }}
                            className={`aspect-square rounded-xl flex items-center justify-center transition-all ${selectedIcon === iconId
                              ? `${selectedColor} text-white shadow-md scale-110`
                              : 'bg-white text-stone-400 hover:bg-stone-200 border border-stone-100 hover:border-stone-300'
                              }`}
                            title={iconId}
                          >
                            <IconComponent className="w-5 h-5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider pl-1">Anotações (Opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Por que este hábito é importante para o seu palácio?"
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-600 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all resize-none h-16"
            />
          </div>

          {/* Goal Type (Positive / Negative) */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-stone-400 uppercase tracking-wider pl-1">
              <Target className="w-3.5 h-3.5" />
              Tipo de Hábito
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setGoalType('positive')}
                className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${goalType === 'positive'
                  ? 'border-amber-400 tracking-wide text-amber-600 bg-amber-50 shadow-md ring-2 ring-amber-100'
                  : 'border-stone-100 text-stone-400 bg-white hover:border-stone-200'
                  }`}
              >
                + Positivo
              </button>
              <button
                onClick={() => setGoalType('negative')}
                className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${goalType === 'negative'
                  ? 'border-slate-500 tracking-wide text-slate-700 bg-slate-50 shadow-md ring-2 ring-slate-200'
                  : 'border-stone-100 text-stone-400 bg-white hover:border-stone-200'
                  }`}
              >
                - Negativo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Difficulty */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-stone-400 uppercase tracking-wider pl-1">
                <Zap className="w-3.5 h-3.5" />
                Dificuldade
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-white border border-stone-200 rounded-xl px-3 py-3 text-sm text-stone-700 font-bold focus:outline-none focus:ring-2 focus:ring-amber-200"
              >
                {difficultyLevels.map(lvl => (
                  <option key={lvl.level} value={lvl.level}>{lvl.label} ({lvl.xp})</option>
                ))}
              </select>
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-stone-400 uppercase tracking-wider pl-1">
                <Clock className="w-3.5 h-3.5" />
                Repetição
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full bg-white border border-stone-200 rounded-xl px-3 py-3 text-sm text-stone-700 font-bold focus:outline-none focus:ring-2 focus:ring-amber-200"
              >
                <option value="Daily">Diário</option>
                <option value="Weekly">Semanal</option>
                <option value="Monthly">Mensal</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="w-full py-4 rounded-xl bg-stone-800 text-white font-bold flex items-center justify-center gap-2 hover:bg-stone-700 transition-colors shadow-[0_4px_14px_0_rgba(0,0,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              <Plus className="w-5 h-5 text-amber-300" />
              <span>Assentar Tijolo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
