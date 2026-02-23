import React, { useState } from 'react';
import { X, Calendar, Clock, AlignLeft, Check, Palette } from 'lucide-react';
import { Task } from '../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
  initialDate?: string; // Optional: date pre-filled from calendar
}

const TASK_COLORS = [
  { value: '', label: 'Cinza', tw: 'bg-stone-300' },
  { value: 'bg-rose-400', label: 'Rosa', tw: 'bg-rose-400' },
  { value: 'bg-amber-400', label: 'Âmbar', tw: 'bg-amber-400' },
  { value: 'bg-emerald-400', label: 'Verde', tw: 'bg-emerald-400' },
  { value: 'bg-blue-400', label: 'Azul', tw: 'bg-blue-400' },
  { value: 'bg-violet-400', label: 'Violeta', tw: 'bg-violet-400' },
  { value: 'bg-pink-400', label: 'Pink', tw: 'bg-pink-400' },
  { value: 'bg-cyan-400', label: 'Cyan', tw: 'bg-cyan-400' },
];

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onSave, initialDate }) => {
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // Update date if initialDate changes (e.g. modal reused)
  React.useEffect(() => {
    if (isOpen) {
      setDate(initialDate || new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!text.trim()) return;

    onSave({
      text,
      description,
      date: date || undefined,
      time: time || undefined,
      color: selectedColor || undefined
    });

    setText('');
    setDescription('');
    setTime('');
    setDate(new Date().toISOString().split('T')[0]);
    setSelectedColor('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 duration-300">

        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-2xl text-stone-800">Nova Tarefa</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-stone-500" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto custom-scrollbar pb-safe">

          {/* Title */}
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="O que precisa ser feito?"
            className="w-full bg-transparent border-b-2 border-stone-200 focus:border-rose-300 py-2 text-xl font-serif text-stone-700 placeholder:text-stone-300 outline-none transition-colors"
            autoFocus
          />

          {/* Color Picker */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider">
              <Palette className="w-3 h-3" /> Cor
            </label>
            <div className="flex gap-2 flex-wrap">
              {TASK_COLORS.map(c => (
                <button
                  key={c.value || 'none'}
                  onClick={() => setSelectedColor(c.value)}
                  className={`w-7 h-7 rounded-full transition-all ${c.tw} ${selectedColor === c.value
                    ? 'ring-[3px] ring-offset-2 ring-stone-400 scale-110 shadow-md'
                    : 'hover:scale-105 opacity-80'
                    }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="flex gap-4">
            {!initialDate && (
              <div className="flex-1 space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider">
                  <Calendar className="w-3 h-3" /> Data
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-stone-50 rounded-xl px-4 py-3 text-stone-700 outline-none focus:ring-2 focus:ring-rose-100 border border-stone-100"
                />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider">
                <Clock className="w-3 h-3" /> Hora
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-stone-50 rounded-xl px-4 py-3 text-stone-700 outline-none focus:ring-2 focus:ring-rose-100 border border-stone-100"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider">
              <AlignLeft className="w-3 h-3" /> Detalhes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione notas, links ou detalhes..."
              rows={3}
              className="w-full bg-stone-50 rounded-xl px-4 py-3 text-stone-600 outline-none focus:ring-2 focus:ring-rose-100 border border-stone-100 resize-none text-sm"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="w-full py-4 rounded-xl bg-stone-800 text-white font-bold flex items-center justify-center gap-2 hover:bg-stone-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-5 h-5 text-green-400" />
              <span>Agendar Tarefa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
