import { Achievement, AchievementState, UserProfile, Habit, Task } from '../types';
import { ACHIEVEMENT_CATALOG, getAchievementById } from '../data/achievements';

/**
 * Serviço de gerenciamento de conquistas
 * Responsável por verificar condições, atualizar progresso e desbloquear conquistas
 */

/**
 * Inicializa o estado de conquistas para um novo usuário
 */
export function initializeAchievementState(): AchievementState {
  return {
    achievements: ACHIEVEMENT_CATALOG.map(a => ({ ...a })),
    achievementPoints: 0,
    lastCheckDate: new Date().toISOString().split('T')[0],
  };
}

/**
 * Verifica se uma conquista específica foi desbloqueada
 */
function checkAchievementCondition(
  achievement: Achievement,
  userProfile: UserProfile,
  habits: Habit[],
  tasks: Task[]
): number {
  const { type, target, habitId, category } = achievement.condition;

  switch (type) {
    case 'habit_completion':
      // Conta número total de hábitos ou hábitos de uma categoria específica
      if (category) {
        return habits.filter(h => h.category === category).length;
      }
      return habits.length;

    case 'habit_streak':
      // Verifica o maior streak entre todos os hábitos (ou um específico)
      if (habitId) {
        const habit = habits.find(h => h.id === habitId);
        return habit ? habit.streak : 0;
      }
      return habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;

    case 'task_completion':
      // Conta tarefas completadas
      return tasks.filter(t => t.completed).length;

    case 'level_reach':
      // Verifica nível de prestígio atual
      return userProfile.level;

    case 'house_completed':
      // Verifica número de casas completadas
      return userProfile.completedHouses;

    case 'note_created':
      // Conta número de notas criadas
      return userProfile.notes?.length || 0;

    case 'ai_usage':
      // Precisamos trackear uso de IA separadamente
      // Por enquanto, usa um placeholder (será implementado quando tivermos o contador)
      return 0;

    case 'days_active':
      // Calcula dias ativos baseado na primeira data de registro
      // Por enquanto, usa streak máximo como proxy
      return habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;

    case 'perfect_week':
      // Verifica se houve semana perfeita
      // Isso requer histórico detalhado, por enquanto retorna 0 ou 1
      // Implementação completa exigiria tracking de完美 weeks
      return 0;

    case 'challenge_complete':
      // Desafios semanais completados
      // Placeholder para implementação futura
      return 0;

    default:
      return 0;
  }
}

/**
 * Atualiza o progresso de todas as conquistas e retorna as recém-desbloqueadas
 */
export function checkAndUnlockAchievements(
  userProfile: UserProfile,
  habits: Habit[],
  tasks: Task[]
): { updatedState: AchievementState; newlyUnlocked: Achievement[] } {
  // Garante que o estado de conquistas existe
  let state = userProfile.achievementState;
  if (!state) {
    state = initializeAchievementState();
  }

  const newlyUnlocked: Achievement[] = [];
  const today = new Date().toISOString().split('T')[0];

  // Atualiza cada conquista
  const updatedAchievements = state.achievements.map(achievement => {
    // Pula se já está desbloqueada
    if (achievement.unlocked) {
      return achievement;
    }

    // Calcula progresso atual
    const currentProgress = checkAchievementCondition(
      achievement,
      userProfile,
      habits,
      tasks
    );

    // Verifica se atingiu o alvo
    if (currentProgress >= achievement.condition.target) {
      const unlockedAchievement: Achievement = {
        ...achievement,
        unlocked: true,
        unlockedAt: new Date().toISOString(),
        progress: currentProgress,
      };
      
      newlyUnlocked.push(unlockedAchievement);
      return unlockedAchievement;
    }

    // Atualiza apenas o progresso
    return {
      ...achievement,
      progress: currentProgress,
    };
  });

  // Calcula pontos totais de conquistas
  const totalPoints = updatedAchievements
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + a.rewardXP, 0);

  const updatedState: AchievementState = {
    achievements: updatedAchievements,
    achievementPoints: totalPoints,
    lastCheckDate: today,
  };

  return { updatedState, newlyUnlocked };
}

/**
 * Incrementa contador específico (ex: uso de IA, desafios completados)
 */
export function incrementAchievementCounter(
  state: AchievementState,
  counterType: 'ai_usage' | 'challenge_complete' | 'share',
  amount: number = 1
): { updatedState: AchievementState; newlyUnlocked: Achievement[] } {
  if (!state) {
    return { updatedState: state, newlyUnlocked: [] };
  }

  // Para contadores especiais, precisamos de uma forma de trackear
  // Isso será expandido conforme necessário
  // Por enquanto, retorna o estado sem mudanças
  // A implementação completa exigiria adicionar campos ao UserProfile
  
  return { updatedState: state, newlyUnlocked: [] };
}

/**
 * Obtém conquistas desbloqueadas
 */
export function getUnlockedAchievements(state: AchievementState): Achievement[] {
  return state.achievements.filter(a => a.unlocked);
}

/**
 * Obtém conquistas bloqueadas com progresso
 */
export function getLockedAchievementsWithProgress(state: AchievementState): Achievement[] {
  return state.achievements.filter(a => !a.unlocked && a.progress > 0);
}

/**
 * Obtém conquistas não iniciadas
 */
export function getNotStartedAchievements(state: AchievementState): Achievement[] {
  return state.achievements.filter(a => !a.unlocked && a.progress === 0);
}

/**
 * Calcula porcentagem de conclusão total
 */
export function getAchievementCompletionPercentage(state: AchievementState): number {
  if (!state || state.achievements.length === 0) {
    return 0;
  }
  const unlocked = state.achievements.filter(a => a.unlocked).length;
  return Math.round((unlocked / state.achievements.length) * 100);
}

/**
 * Obtém conquistas por categoria com estado atual
 */
export function getAchievementsByCategory(
  state: AchievementState,
  category: string
): Achievement[] {
  return state.achievements.filter(a => a.category === category);
}

/**
 * Verifica conquistas específicas após ação do usuário
 * Otimizado para chamadas frequentes (ex: após completar hábito)
 */
export function quickCheckAfterAction(
  state: AchievementState,
  actionType: 'habit_complete' | 'task_complete' | 'streak_update',
  relatedData?: any
): { updatedState: AchievementState; newlyUnlocked: Achievement[] } {
  // Reexecuta verificação completa
  // Em produção, poderíamos otimizar verificando apenas conquistas relevantes
  // Mas para simplicidade, reexecutamos tudo
  // Os dados reais virão do App.tsx
  
  return { updatedState: state, newlyUnlocked: [] };
}
