import React, { useState, useEffect, useRef } from 'react';
import { Navigation } from './components/Navigation';
import { ConstructionSite } from './views/ConstructionSite';
import { CalendarView } from './views/CalendarView'; // Serves as Tasks View
import { ArchitectOffice } from './views/ArchitectOffice';
import { ProfileView } from './views/ProfileView';
import { NotesView } from './views/NotesView'; // New View
import { AnalyticsView } from './views/AnalyticsView'; // New View
import { AchievementsView } from './components/AchievementsView';
import { AchievementModal } from './components/AchievementModal';
import { ArchitecturalStyleView } from './views/ArchitecturalStyleView';
import { CreateHabitModal } from './components/CreateHabitModal';
import { CreateTaskModal } from './components/CreateTaskModal';
import { LevelUpModal } from './components/LevelUpModal';
import { generateHouseView } from './services/geminiService';
import { checkAndUnlockAchievements, initializeAchievementState } from './services/achievementService';
import { AppView, Habit, UserProfile, ChatMessage, Task, Note, HabitDifficulty, HabitRecord, Achievement } from './types';

const INITIAL_USER: UserProfile = {
  name: "Arquiteta",
  level: 1, // Lifetime level / Prestige level
  xp: 0,
  architecturalStyle: "", // Empty so it triggers the style selection
  completedHouses: 0,
  notes: [],
};

// Initial welcome message from AI
const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'model',
    content: "Olá! Sou sua Arquiteta dos Sonhos. Vamos projetar uma rotina elegante hoje? Me conte o que está sentindo ou o que deseja mudar.",
    timestamp: Date.now()
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HABITS);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);

  // Specific state to handle "Chat about this note" redirection
  const [chatInitialInput, setChatInitialInput] = useState<string | undefined>(undefined);

  // Modals state
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalDate, setTaskModalDate] = useState<string | undefined>(undefined);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [isEvolving, setIsEvolving] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  
  // Achievements state
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<Achievement[]>([]);

  // Splash screen timer
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  // Load from local storage on mount
  useEffect(() => {
    const storedHabits = localStorage.getItem('dreamPalace_habits');
    if (storedHabits) {
      setHabits(JSON.parse(storedHabits));
    }

    const storedTasks = localStorage.getItem('dreamPalace_tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }

    const storedProfile = localStorage.getItem('dreamPalace_profile');
    if (storedProfile) {
      let profile = JSON.parse(storedProfile);

      // --- MIGRATION: Convert old string notes to Array ---
      if (typeof profile.notes === 'string') {
        if (profile.notes.length > 0) {
          const legacyNote: Note = {
            id: 'legacy-note',
            content: profile.notes,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          profile.notes = [legacyNote];
        } else {
          profile.notes = [];
        }
      } else if (!profile.notes) {
        profile.notes = [];
      }

      // --- MIGRATION: Initialize achievement state if missing ---
      if (!profile.achievementState) {
        profile.achievementState = initializeAchievementState();
      }

      // --- OLD DAILY TAX LOGIC OMITTED ---
      // The user now has a 1-week grace period to report manually.
      // We only update lastProcessedDate for potential future features.
      const today = new Date().toISOString().split('T')[0];
      const lastDate = profile.lastProcessedDate;

      if (!lastDate) {
        profile.lastProcessedDate = today;
      }

      setUserProfile(profile as UserProfile);
    }
  }, []);

  // Save to local storage on change
  const habitsRef = useRef(habits);
  useEffect(() => {
    localStorage.setItem('dreamPalace_habits', JSON.stringify(habits));
    habitsRef.current = habits;
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('dreamPalace_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('dreamPalace_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Handle auto-generation of the house every 50 XP.
  const previousXpRef = useRef(userProfile.xp);
  useEffect(() => {
    if (userProfile.xp > previousXpRef.current) {
      const currentMilestone = Math.floor(userProfile.xp / 50);
      const previousMilestone = Math.floor(previousXpRef.current / 50);

      // Trigger generation only when crossing a 50XP threshold (and we have a style)
      if (currentMilestone > previousMilestone && currentMilestone > 0 && userProfile.architecturalStyle) {
        handleEvolveHouse();
      }
    }
    previousXpRef.current = userProfile.xp;
  }, [userProfile.xp, userProfile.architecturalStyle]);

  // Check for Level Up (Used as an aesthetic flair or legacy mechanic, but XP caps at 1000 for prestige)
  useEffect(() => {
    // We can keep LevelUp modal for every 100XP if needed, or remove it.
    // For now, let's just cap the visual XP at 1000.
  }, [userProfile.xp]);

  const handleStyleSelected = (style: string) => {
    setUserProfile(prev => ({
      ...prev,
      architecturalStyle: style,
      xp: 0, // Start fresh
      houseImageUrl: undefined // Clear the image
    }));
  };

  const handlePrestige = () => {
    if (window.confirm("Seu palácio está concluído! Você agora o enviará para os anais da história e começará um novo lote. Deseja prosseguir?")) {
      setUserProfile(prev => ({
        ...prev,
        level: prev.level + 1, // Lifetime level increases
        completedHouses: prev.completedHouses + 1,
        xp: 0,
        architecturalStyle: '', // Force style selection again
        houseImageUrl: undefined
      }));
    }
  };

  const getXpMultipler = (difficulty: HabitDifficulty): number => {
    switch (difficulty) {
      case 'Trivial': return 2;
      case 'Easy': return 4;
      case 'Medium': return 6;
      case 'Hard': return 10;
      default: return 4;
    }
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
  };

  // --- HABIT HANDLERS ---
  const handleAddHabit = (habit: Habit) => {
    setHabits(prev => [habit, ...prev]);
  };

  const handleDeleteHabit = (id: string) => {
    if (window.confirm("Tem certeza que deseja demolir este hábito?")) {
      const h = habits.find((hb) => hb.id === id);
      if (h && h.records) {
        let totalXpContributed = 0;
        Object.values(h.records).forEach(record => {
          totalXpContributed += (record as HabitRecord).xpDiff;
        });
        setUserProfile(u => ({ ...u, xp: u.xp - totalXpContributed }));
      }
      setHabits(prev => prev.filter(hb => hb.id !== id));
    }
  };

  const handleHabitAction = (id: string, action: 'success' | 'fail', date: string) => {
    const h = habitsRef.current.find((hb) => hb.id === id);
    if (!h) return;

    const records = h.records || {};
    const existingRecord = records[date];

    const xpAmount = getXpMultipler(h.difficulty);
    const penaltyAmount = Math.max(1, Math.floor(xpAmount / 2));

    let netXpChange = 0;

    // Revert previous action if it exists
    if (existingRecord) {
      if (existingRecord.action === action) {
        // User clicked the exact same button - undo it
        let newRecords = { ...records };
        delete newRecords[date];

        netXpChange -= existingRecord.xpDiff;

        const updatedHabit = {
          ...h,
          records: newRecords,
          streak: Math.max(0, h.streak - (existingRecord.action === 'success' ? 1 : 0)),
          shieldDays: Math.max(0, (h.shieldDays || 0) - (existingRecord.shieldEarned || 0) + (existingRecord.shieldConsumed ? 1 : 0))
        };

        setHabits(prev => prev.map(hb => hb.id === id ? updatedHabit : hb));
        setUserProfile(u => ({ ...u, xp: u.xp + netXpChange }));
        return;
      } else {
        // The user changed from success to fail or vice-versa.
        netXpChange -= existingRecord.xpDiff;
      }
    }

    // Determine new effects
    let xpDiff = 0;
    let newStreak = h.streak || 0;
    let shieldConsumed = false;
    let shieldEarned = 0;
    let newShieldDays = h.shieldDays || 0;

    // Reverse streak & shield logic of the existingRecord if modifying
    if (existingRecord) {
      if (existingRecord.action === 'success') {
        newStreak = Math.max(0, newStreak - 1);
      }
      newShieldDays = Math.max(0, newShieldDays - (existingRecord.shieldEarned || 0) + (existingRecord.shieldConsumed ? 1 : 0));
    }

    if (action === 'success') {
      xpDiff = xpAmount;
      newStreak += 1;

      // 7-day shield logic
      if (newStreak > 0 && newStreak % 7 === 0) {
        shieldEarned = 2;
        newShieldDays += 2;
      }
    } else if (action === 'fail') {
      if (newShieldDays > 0) {
        newShieldDays -= 1;
        shieldConsumed = true;
        xpDiff = 0; // Shield prevented point loss
      } else {
        xpDiff = -penaltyAmount;
      }
      newStreak = 0; // Break streak
    }

    netXpChange += xpDiff;

    const updatedHabit = {
      ...h,
      streak: newStreak,
      shieldDays: newShieldDays,
      records: {
        ...h.records,
        [date]: {
          action,
          xpDiff,
          shieldConsumed,
          shieldEarned
        }
      }
    };

    setHabits(prev => prev.map(hb => hb.id === id ? updatedHabit : hb));
    setUserProfile(u => ({ ...u, xp: u.xp + netXpChange }));
    
    // Check achievements after habit action
    setTimeout(() => {
      const currentHabits = habitsRef.current;
      const currentTasks = tasks;
      const { updatedState, newlyUnlocked } = checkAndUnlockAchievements(
        { ...userProfile, achievementState: userProfile.achievementState || initializeAchievementState() },
        currentHabits,
        currentTasks
      );
      
      if (newlyUnlocked.length > 0) {
        setUserProfile(u => ({ ...u, achievementState: updatedState }));
        setNewlyUnlockedAchievements(newlyUnlocked);
      }
    }, 0);
  };

  const handleAddTaskForDate = (date: string) => {
    setTaskModalDate(date);
    setIsTaskModalOpen(true);
  };

  // --- TASK HANDLERS (Updated) ---
  const handleAddTask = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      ...taskData,
      completed: false,
      createdAt: Date.now()
    };
    // Sort: Non-completed first, then by date/time
    setTasks(prev => [newTask, ...prev]);
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
    
    // Check achievements after task toggle
    setTimeout(() => {
      const currentHabits = habits;
      const updatedTasks = tasks.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );
      const { updatedState, newlyUnlocked } = checkAndUnlockAchievements(
        { ...userProfile, achievementState: userProfile.achievementState || initializeAchievementState() },
        currentHabits,
        updatedTasks
      );
      
      if (newlyUnlocked.length > 0) {
        setUserProfile(u => ({ ...u, achievementState: updatedState }));
        setNewlyUnlockedAchievements(newlyUnlocked);
      }
    }, 0);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // --- OFFICE/AI HANDLERS ---
  const handleAddMessage = (msg: ChatMessage) => {
    setMessages(prev => [...prev, msg]);
  };

  const handleChatAboutNote = (note: Note) => {
    setChatInitialInput(`Vamos conversar sobre esta ideia: "${note.content}"`);
    setCurrentView(AppView.OFFICE);
  };

  const handleEvolveHouse = async () => {
    setIsEvolving(true);
    try {
      const newHouseUrl = await generateHouseView(userProfile.xp, userProfile.architecturalStyle, habits);
      setUserProfile(prev => ({
        ...prev,
        houseImageUrl: newHouseUrl
      }));
    } catch (error) {
      console.error("Failed to evolve house", error);
      alert("Não foi possível gerar a nova fachada agora. Os arquitetos estão ocupados.");
    } finally {
      setIsEvolving(false);
    }
  };

  // Splash screen
  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-stone-800 flex flex-col items-center justify-center z-[100]">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center mb-6 animate-pulse-glow">
          <span className="text-3xl">🏰</span>
        </div>
        <h1 className="text-2xl font-serif text-white animate-fade-up">Palácio dos Sonhos</h1>
        <p className="text-stone-400 text-xs mt-2 animate-fade-up" style={{ animationDelay: '0.2s', opacity: 0 }}>Construa sua melhor versão</p>
      </div>
    );
  }

  // If no style is selected, intercept everything and force style selection
  if (!userProfile.architecturalStyle) {
    return <ArchitecturalStyleView userProfile={userProfile} onStyleSelected={handleStyleSelected} />;
  }

  return (
    <div className="bg-stone-50 min-h-screen text-stone-800">

      {/* Main Content Area */}
      <main className="pb-16">
        {currentView === AppView.HABITS && (
          <ConstructionSite
            habits={habits}
            userProfile={userProfile}
            onAddHabit={() => setIsHabitModalOpen(true)}
            onHabitAction={handleHabitAction}
            onDeleteHabit={handleDeleteHabit}
            onEvolveHouse={handleEvolveHouse}
            isEvolving={isEvolving}
          />
        )}
        {currentView === AppView.TASKS && (
          <CalendarView
            tasks={tasks}
            habits={habits}
            onOpenTaskModal={() => {
              setTaskModalDate(undefined);
              setIsTaskModalOpen(true);
            }}
            onAddTaskForDate={handleAddTaskForDate}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
        {currentView === AppView.ANALYTICS && (
          <AnalyticsView
            habits={habits}
            userProfile={userProfile}
            tasks={tasks}
          />
        )}
        {currentView === AppView.OFFICE && (
          <ArchitectOffice
            messages={messages}
            addMessage={handleAddMessage}
            habits={habits}
            notes={userProfile.notes}
            initialInput={chatInitialInput}
            onClearInitialInput={() => setChatInitialInput(undefined)}
          />
        )}
        {currentView === AppView.PROFILE && (
          <ProfileView
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            onViewAllNotes={() => setCurrentView(AppView.ALL_NOTES)}
            onChatAboutNote={handleChatAboutNote}
          />
        )}
        {currentView === AppView.ALL_NOTES && (
          <NotesView
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            onBack={() => setCurrentView(AppView.PROFILE)}
            onChatAboutNote={handleChatAboutNote}
          />
        )}
        {currentView === AppView.ACHIEVEMENTS && (
          <AchievementsView
            userProfile={userProfile}
            habits={habits}
            tasks={tasks}
            onBack={() => setCurrentView(AppView.HABITS)}
          />
        )}
      </main>

      {/* Modals & Overlays */}
      <CreateHabitModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        onSave={handleAddHabit}
      />

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        initialDate={taskModalDate}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskModalDate(undefined);
        }}
        onSave={handleAddTask}
      />

      <LevelUpModal
        isOpen={showLevelUp}
        onClose={() => setShowLevelUp(false)}
        newLevel={userProfile.level}
      />

      {/* Achievement Unlock Modal */}
      {newlyUnlockedAchievements.length > 0 && (
        <AchievementModal
          achievement={newlyUnlockedAchievements[0]}
          onClose={() => setNewlyUnlockedAchievements(prev => prev.slice(1))}
        />
      )}

      {/* Bottom Navigation */}
      <Navigation currentView={currentView === AppView.ALL_NOTES ? AppView.PROFILE : currentView} setView={setCurrentView} />
    </div>
  );
}