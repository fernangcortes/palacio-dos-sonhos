export type HabitDifficulty = 'Trivial' | 'Easy' | 'Medium' | 'Hard';

export interface HabitRecord {
  action: 'success' | 'fail';
  xpDiff: number; // The exact XP added or subtracted
  shieldConsumed: boolean; // Did we consume a shield day on a fail?
  shieldEarned: number; // Did we earn shield days (+2) on this success?
}

export interface Habit {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string; // e.g. 'book', 'dumbbell'
  color: string; // e.g. 'bg-blue-500'
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  difficulty: HabitDifficulty;
  streak: number;
  completedDates: string[]; // ISO date strings
  records?: Record<string, HabitRecord>; // Store daily outcomes
  shieldDays?: number; // Accumulated shield days to prevent point loss
  goalType: 'positive' | 'negative';
  // Legacy fields below can also be optional for migration support:
  iconUrl?: string;
}

export interface Task {
  id: string;
  text: string;
  description?: string; // Optional details
  date?: string; // YYYY-MM-DD
  time?: string; // HH:MM
  color?: string; // e.g. 'bg-rose-500', defaults to gray
  completed: boolean;
  createdAt: number;
}

export interface Note {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface AvatarConfig {
  sourceType?: 'classic' | 'dicebear-8bit' | '8bit' | 'ai-generated' | 'uploaded';
  seed?: string;
  imageUrl?: string;

  // Legacy fields below
  skinColor?: string;
  topType?: string; // Cabelo/Chapéu
  hairColor?: string;
  facialHairType?: string;
  facialHairColor?: string;
  clotheType?: string;
  clotheColor?: string;
  eyeType?: string;
  eyebrowType?: string;
  mouthType?: string; // Batom/Boca
  accessoriesType?: string;
}

export interface UserProfile {
  level: number; // Still kept for "Prestige Level" or lifetime level
  xp: number; // 0 to 1000
  name: string;
  architecturalStyle: string; // e.g. "Modern", "Victorian", "Fantasy"
  completedHouses: number; // Number of times reached 1000 XP
  houseImageUrl?: string; // The AI generated house state
  lastProcessedDate?: string; // YYYY-MM-DD to track daily tax application
  notes: Note[]; // Changed from string to Note array
  avatarConfig?: AvatarConfig; // New avatar configuration
  theme?: 'light' | 'dark' | '8bit' | 'auto';
}

export enum AppView {
  HABITS = 'HABITS',
  TASKS = 'TASKS',
  OFFICE = 'OFFICE',
  PROFILE = 'PROFILE',
  ALL_NOTES = 'ALL_NOTES', // New View
  ANALYTICS = 'ANALYTICS', // New View
}

export interface GeminiAnalysisResult {
  title: string;
  category: string;
  visualPrompt: string;
  motivationalTip: string;
  goalType: 'positive' | 'negative';
}