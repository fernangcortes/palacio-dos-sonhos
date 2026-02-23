import React, { useState } from 'react';
import { Task, Habit } from '../types';
import {
  ChevronLeft, ChevronRight, Plus, Trash2,
  Clock, CheckCircle2, Circle, AlertCircle, ShieldCheck, ChevronDown
} from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  habits: Habit[];
  onOpenTaskModal: () => void;
  onAddTaskForDate: (date: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

// Map tailwind bg class to a hex for the calendar dot
const COLOR_DOT_MAP: Record<string, string> = {
  'bg-rose-400': '#fb7185',
  'bg-amber-400': '#fbbf24',
  'bg-emerald-400': '#34d399',
  'bg-blue-400': '#60a5fa',
  'bg-violet-400': '#a78bfa',
  'bg-pink-400': '#f472b6',
  'bg-cyan-400': '#22d3ee',
  'bg-rose-500': '#f43f5e',
  'bg-amber-500': '#f59e0b',
  'bg-emerald-500': '#10b981',
  'bg-blue-500': '#3b82f6',
  'bg-violet-500': '#7c3aed',
};
const DEFAULT_TASK_DOT = '#a8a29e'; // stone-400

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  habits,
  onOpenTaskModal,
  onAddTaskForDate,
  onToggleTask,
  onDeleteTask
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  // Calendar math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysCount = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();
  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysCount; d++) calendarDays.push(new Date(year, month, d));

  // Helpers
  const toDateStr = (d: Date) => d.toISOString().split('T')[0];
  const todayStr = toDateStr(new Date());

  const getTasksForDate = (date: Date) => tasks.filter(t => t.date === toDateStr(date));

  const getHabitDotsForDate = (date: Date) => {
    const dStr = toDateStr(date);
    const successes = habits.filter(h => h.records?.[dStr]?.action === 'success').length;
    const fails = habits.filter(h => h.records?.[dStr]?.action === 'fail').length;
    return { successes, fails };
  };



  const isToday = (date: Date) => toDateStr(date) === todayStr;
  const isSelected = (date: Date) => toDateStr(date) === toDateStr(selectedDate);

  // Task color dot
  const getTaskDotColors = (date: Date): string[] => {
    const dayTasks = getTasksForDate(date);
    if (dayTasks.length === 0) return [];
    return dayTasks.slice(0, 3).map(t => (t.color && COLOR_DOT_MAP[t.color]) || DEFAULT_TASK_DOT);
  };

  // Urgency
  const getUrgency = (task: Task) => {
    if (task.completed || !task.date) return 'none';
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(task.date + 'T00:00:00');
    if (due < today) return 'overdue';
    if (due.getTime() === today.getTime()) return 'today';
    return 'none';
  };

  // Upcoming tasks (future, not today)
  const upcomingTasks = tasks
    .filter(t => t.date && t.date > todayStr && !t.completed)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  const UPCOMING_LIMIT = 4;
  const visibleUpcoming = showAllUpcoming ? upcomingTasks : upcomingTasks.slice(0, UPCOMING_LIMIT);

  // Selected day tasks sorted
  const selectedTasks = [...getTasksForDate(selectedDate)].sort((a, b) => a.completed === b.completed ? 0 : a.completed ? 1 : -1);

  // --- Compact task card with swipe gestures ---
  const TaskCard = ({ task, compact }: { task: Task; compact?: boolean; key?: string }) => {
    const urgency = getUrgency(task);
    const dotColor = (task.color && COLOR_DOT_MAP[task.color]) || DEFAULT_TASK_DOT;

    const [swipeX, setSwipeX] = useState(0);
    const [swiping, setSwiping] = useState(false);
    const touchRef = React.useRef<{ startX: number; startY: number; locked: boolean }>({ startX: 0, startY: 0, locked: false });

    const THRESHOLD = 80;

    const handleTouchStart = (e: React.TouchEvent) => {
      touchRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, locked: false };
      setSwiping(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      const dx = e.touches[0].clientX - touchRef.current.startX;
      const dy = e.touches[0].clientY - touchRef.current.startY;

      // Lock direction on first significant movement
      if (!touchRef.current.locked) {
        if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
          // Vertical scroll — abort swipe
          setSwiping(false);
          setSwipeX(0);
          return;
        }
        if (Math.abs(dx) > 10) {
          touchRef.current.locked = true;
        }
      }

      if (touchRef.current.locked) {
        e.preventDefault(); // Prevent scroll while swiping horizontally
        setSwipeX(dx);
      }
    };

    const handleTouchEnd = () => {
      setSwiping(false);
      if (swipeX > THRESHOLD) {
        // Swipe right → toggle complete
        setSwipeX(300); // animate out
        setTimeout(() => onToggleTask(task.id), 250);
      } else if (swipeX < -THRESHOLD) {
        // Swipe left → delete
        setSwipeX(-300); // animate out
        setTimeout(() => onDeleteTask(task.id), 250);
      } else {
        setSwipeX(0);
      }
    };

    return (
      <div className="relative overflow-hidden rounded-2xl">
        {/* Reveal backgrounds */}
        <div className="absolute inset-0 flex items-center justify-between px-5 rounded-2xl">
          <div className={`flex items-center gap-2 transition-opacity ${swipeX > 30 ? 'opacity-100' : 'opacity-0'}`}>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Feito!</span>
          </div>
          <div className={`flex items-center gap-2 transition-opacity ${swipeX < -30 ? 'opacity-100' : 'opacity-0'}`}>
            <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Excluir</span>
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
        </div>

        {/* Swipeable card */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: `translateX(${swipeX}px)`,
            transition: swiping ? 'none' : 'transform 0.3s ease-out',
          }}
          className={`group relative rounded-2xl shadow-sm border flex items-center gap-3 ${compact ? 'p-2.5' : 'p-3.5'
            } ${task.completed
              ? 'bg-stone-50 border-stone-100 opacity-50'
              : urgency === 'overdue'
                ? 'bg-white border-red-200 ring-1 ring-red-100'
                : urgency === 'today'
                  ? 'bg-white border-amber-200 shadow-amber-50 shadow-md'
                  : 'bg-white border-stone-100'
            }`}
        >
          {/* Color dot */}
          <div className="w-2 h-full min-h-[24px] rounded-full shrink-0" style={{ backgroundColor: dotColor }} />

          <button
            onClick={() => onToggleTask(task.id)}
            className={`shrink-0 transition-colors ${task.completed ? 'text-rose-300' : 'text-stone-300 hover:text-stone-400'}`}
          >
            {task.completed ? <CheckCircle2 className={compact ? 'w-4 h-4' : 'w-5 h-5'} /> : <Circle className={compact ? 'w-4 h-4' : 'w-5 h-5'} />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`leading-tight truncate transition-all ${compact ? 'text-xs' : 'text-sm font-medium'
                } ${task.completed ? 'line-through text-stone-400' : 'text-stone-700'}`}>
                {task.text}
              </span>
              {urgency === 'overdue' && (
                <span className="text-[8px] font-bold uppercase text-red-500 bg-red-50 px-1 py-0.5 rounded shrink-0 flex items-center gap-0.5">
                  <AlertCircle className="w-2 h-2" /> Atrasada
                </span>
              )}
            </div>
            {!compact && task.time && (
              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-stone-400">
                <Clock className="w-2.5 h-2.5" /> {task.time}
              </div>
            )}
          </div>

          {compact && task.date && (
            <span className="text-[9px] text-stone-300 font-mono shrink-0">
              {new Date(task.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
            </span>
          )}

          <button
            onClick={() => onDeleteTask(task.id)}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-300 hover:text-red-400 hover:bg-red-50 rounded-full transition-all shrink-0"
          >
            <Trash2 className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24 pt-6 px-4">

      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-xl font-serif text-stone-800 capitalize">{monthName}</h1>
          <p className="text-stone-400 text-[10px] mt-0.5">Navegue pelas suas conquistas</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1.5 hover:bg-stone-200 rounded-full transition-colors">
            <ChevronLeft className="w-4 h-4 text-stone-500" />
          </button>
          <button onClick={nextMonth} className="p-1.5 hover:bg-stone-200 rounded-full transition-colors">
            <ChevronRight className="w-4 h-4 text-stone-500" />
          </button>
        </div>
      </div>

      {/* Monthly Grid */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-stone-100 mb-5">
        <div className="grid grid-cols-7 gap-0.5 mb-1.5">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
            <div key={i} className="text-center text-[9px] font-bold text-stone-300 py-0.5">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {calendarDays.map((date, idx) => {
            if (!date) return <div key={`pad-${idx}`} className="aspect-square" />;

            const { successes, fails } = getHabitDotsForDate(date);
            const taskDots = getTaskDotColors(date);

            return (
              <button
                key={toDateStr(date)}
                onClick={() => {
                  if (isSelected(date)) {
                    onAddTaskForDate(toDateStr(date));
                  } else {
                    setSelectedDate(date);
                  }
                }}
                className={`aspect-square relative flex flex-col items-center justify-center rounded-xl transition-all ${isSelected(date)
                  ? 'bg-stone-800 text-white shadow-lg scale-105 z-10'
                  : isToday(date)
                    ? 'bg-rose-50 text-rose-500 border border-rose-100'
                    : taskDots.length > 0
                      ? 'bg-stone-50 hover:bg-stone-100 text-stone-600'
                      : 'hover:bg-stone-100 text-stone-500'
                  }`}
              >
                <span className="text-[11px] font-bold z-10">{date.getDate()}</span>

                {/* Mini dot row */}
                <div className="absolute bottom-[3px] flex gap-[3px] z-10">
                  {/* Habit dots */}
                  {Array.from({ length: Math.min(2, successes) }).map((_, i) => (
                    <div key={`s-${i}`} className={`w-1.5 h-1.5 rounded-full ${isSelected(date) ? 'bg-emerald-300' : 'bg-emerald-400'}`} />
                  ))}
                  {Array.from({ length: Math.min(1, fails) }).map((_, i) => (
                    <div key={`f-${i}`} className={`w-1.5 h-1.5 rounded-full ${isSelected(date) ? 'bg-rose-300' : 'bg-rose-400'}`} />
                  ))}
                  {/* Task color dots */}
                  {taskDots.slice(0, 2).map((color, i) => (
                    <div key={`t-${i}`} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isSelected(date) ? '#fcd34d' : color }} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      <div className="mb-5">
        <div className="flex justify-between items-center px-1 mb-3">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
            {isToday(selectedDate) ? 'Hoje' : selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
            <button
              onClick={() => onAddTaskForDate(toDateStr(selectedDate))}
              className="p-1 hover:bg-stone-100 rounded-full transition-colors"
              title="Adicionar tarefa para este dia"
            >
              <Plus className="w-3.5 h-3.5 text-rose-400" />
            </button>
          </h2>
          {getHabitDotsForDate(selectedDate).successes > 0 && (
            <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
              <ShieldCheck className="w-2.5 h-2.5" /> Obra em dia
            </div>
          )}
        </div>

        <div className="space-y-2">
          {selectedTasks.length > 0 ? (
            <>
              {selectedTasks.map(task => <TaskCard key={task.id} task={task} />)}
            </>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-stone-200 rounded-2xl bg-white/30">
              <p className="text-stone-400 font-serif text-sm mb-0.5">Terreno Limpo</p>
              <p className="text-[10px] text-stone-300">Nada agendado para este dia.</p>
            </div>
          )}
        </div>
      </div>

      {/* Próximos Dias */}
      {upcomingTasks.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest px-1 mb-3">
            Próximos Dias
          </h2>
          <div className="space-y-1.5">
            {visibleUpcoming.map(task => <TaskCard key={task.id} task={task} compact />)}
          </div>

          {upcomingTasks.length > UPCOMING_LIMIT && (
            <button
              onClick={() => setShowAllUpcoming(!showAllUpcoming)}
              className="w-full mt-3 py-2 text-[11px] font-bold text-stone-400 hover:text-stone-600 flex items-center justify-center gap-1 transition-colors"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllUpcoming ? 'rotate-180' : ''}`} />
              {showAllUpcoming ? 'Mostrar menos' : `Mostrar mais (${upcomingTasks.length - UPCOMING_LIMIT})`}
            </button>
          )}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={onOpenTaskModal}
        className="fixed bottom-24 right-6 w-14 h-14 bg-stone-800 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-stone-700 hover:scale-105 active:scale-95 transition-all z-40"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};
