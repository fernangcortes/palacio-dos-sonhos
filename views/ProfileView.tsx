import React, { useState } from 'react';
import { UserProfile, AvatarConfig, Note } from '../types';
import { Trophy, Star, Medal, Crown, Settings, Pencil, Sparkles, Plus, Calendar, ArrowRight, Lightbulb } from 'lucide-react';
import { EditAvatarModal } from '../components/EditAvatarModal';
import { SettingsModal } from '../components/SettingsModal';

interface ProfileViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onViewAllNotes: () => void;
  onChatAboutNote: (note: Note) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  onUpdateProfile,
  onViewAllNotes,
  onChatAboutNote
}) => {
  const [newNoteInput, setNewNoteInput] = useState('');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userProfile.name);

  const handleSaveName = () => {
    if (nameInput.trim()) onUpdateProfile({ ...userProfile, name: nameInput.trim() });
    setIsEditingName(false);
  };

  const handleAddNote = () => {
    if (!newNoteInput.trim()) return;

    const newNote: Note = {
      id: Date.now().toString(),
      content: newNoteInput,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    onUpdateProfile({
      ...userProfile,
      notes: [newNote, ...userProfile.notes]
    });
    setNewNoteInput('');
  };

  const handleSaveAvatar = (newConfig: AvatarConfig) => {
    onUpdateProfile({
      ...userProfile,
      avatarConfig: newConfig
    });
    setIsAvatarModalOpen(false);
  };

  // Avatar URL — supports all source types
  const getAvatarUrl = (): string => {
    const c = userProfile.avatarConfig;
    if (!c) return `https://api.dicebear.com/9.x/miniavs/svg?seed=${encodeURIComponent(userProfile.name)}`;
    if ((c.sourceType === 'ai-generated' || c.sourceType === 'uploaded') && c.imageUrl) return c.imageUrl;
    if (c.sourceType === 'dicebear-8bit' || c.sourceType === '8bit') {
      return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(c.seed || userProfile.name)}`;
    }
    // Classic (seed-based) or default
    const seed = c.seed || userProfile.name;
    return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  };

  const avatarSrc = getAvatarUrl();

  // Mock Badges
  const badges = [
    { id: 1, name: 'Fundação', icon: Star, unlocked: true, color: 'text-amber-400' },
    { id: 2, name: 'Arquiteta', icon: Trophy, unlocked: userProfile.level >= 5, color: 'text-rose-400' },
    { id: 3, name: 'Mestra', icon: Medal, unlocked: userProfile.level >= 10, color: 'text-stone-600' },
    { id: 4, name: 'Rainha', icon: Crown, unlocked: userProfile.level >= 20, color: 'text-purple-400' },
  ];

  const recentNotes = userProfile.notes.slice(0, 3);

  return (
    <div className="min-h-screen bg-stone-50 pb-24 pt-8 px-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-stone-800">Seu Perfil</h1>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-full bg-white text-stone-400 shadow-sm border border-stone-100 hover:bg-stone-100 hover:text-stone-600 transition-colors"
          title="Configurações"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* User Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 mb-8 flex items-center gap-6">
        <div className="relative group">
          <div
            className="w-24 h-24 rounded-full bg-white border-4 border-amber-100 overflow-hidden shrink-0 cursor-pointer shadow-sm transition-transform hover:scale-105"
            onClick={() => setIsAvatarModalOpen(true)}
          >
            <img
              src={avatarSrc}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={() => setIsAvatarModalOpen(true)}
            className="absolute bottom-0 right-0 p-1.5 bg-stone-800 text-white rounded-full shadow-md border-2 border-white hover:bg-rose-500 transition-colors"
            title="Editar Avatar"
          >
            <Pencil className="w-3 h-3" />
          </button>
        </div>

        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <input
              autoFocus
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setIsEditingName(false); }}
              className="text-2xl font-serif text-stone-800 bg-transparent border-b-2 border-rose-300 focus:outline-none w-full mb-2"
            />
          ) : (
            <h2
              className="text-2xl font-serif text-stone-800 truncate cursor-pointer hover:text-rose-500 transition-colors flex items-center gap-2 group mb-2"
              onClick={() => { setNameInput(userProfile.name); setIsEditingName(true); }}
              title="Clique para editar seu nome"
            >
              {userProfile.name}
              <Pencil className="w-3.5 h-3.5 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </h2>
          )}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Nível {userProfile.level}
            </div>
            <span className="text-xs text-stone-400">{userProfile.xp} XP</span>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Badges Conquistados</h3>
        <div className="grid grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div key={badge.id} className="flex flex-col items-center gap-2">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${badge.unlocked
                ? 'bg-white shadow-md border border-stone-100'
                : 'bg-white opacity-50 grayscale'
                }`}>
                <badge.icon className={`w-6 h-6 ${badge.unlocked ? badge.color : 'text-stone-300'}`} />
              </div>
              <span className="text-[10px] font-bold text-stone-500 uppercase">{badge.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notes & Ideas Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Ideias & Rascunhos</h3>
          {userProfile.notes.length > 3 && (
            <button
              onClick={onViewAllNotes}
              className="text-xs font-bold text-rose-500 flex items-center gap-1 hover:underline"
            >
              Ver Todas <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Input for new idea */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 mb-4 flex gap-2">
          <div className="mt-1">
            <Lightbulb className="w-5 h-5 text-amber-400" />
          </div>
          <input
            type="text"
            value={newNoteInput}
            onChange={(e) => setNewNoteInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
            placeholder="Teve uma ideia? Escreva aqui..."
            className="flex-1 bg-transparent text-sm text-stone-700 outline-none placeholder:text-stone-300"
          />
          <button
            onClick={handleAddNote}
            disabled={!newNoteInput.trim()}
            className="p-1.5 bg-stone-800 text-white rounded-lg hover:bg-stone-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* List of recent notes */}
        <div className="space-y-3">
          {recentNotes.length === 0 ? (
            <div className="text-center py-8 text-stone-300 text-sm italic">
              Nenhuma anotação recente.
            </div>
          ) : (
            recentNotes.map((note) => (
              <div key={note.id} className="bg-white rounded-xl p-4 shadow-sm border border-stone-100 relative group">
                <p className="text-stone-600 font-serif text-sm line-clamp-2 pr-8">{note.content}</p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-stone-400">
                  <Calendar className="w-3 h-3" />
                  {new Date(note.createdAt).toLocaleDateString()}
                </div>

                {/* Chat Action */}
                <button
                  onClick={() => onChatAboutNote(note)}
                  className="absolute top-2 right-2 p-1.5 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                  title="Falar com a Arquiteta sobre isso"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Avatar Edit Modal */}
      <EditAvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSave={handleSaveAvatar}
        currentConfig={userProfile.avatarConfig}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={onUpdateProfile}
      />
    </div>
  );
};
