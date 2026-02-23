import React, { useState } from 'react';
import { UserProfile, Note } from '../types';
import { ArrowLeft, ArrowUp, ArrowDown, Trash2, Edit2, Check, Sparkles, Calendar, XCircle, AlertTriangle } from 'lucide-react';

interface NotesViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onBack: () => void;
  onChatAboutNote: (note: Note) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({ 
  userProfile, 
  onUpdateProfile, 
  onBack,
  onChatAboutNote 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const notes = userProfile.notes;

  const handleDeleteConfirm = (id: string) => {
    // Perform deletion
    const updatedNotes = notes.filter(n => n.id !== id);
    // Important: Create a deep copy or ensure reference changes if needed, but filter returns new array
    onUpdateProfile({ ...userProfile, notes: updatedNotes });
    setDeletingId(null);
  };

  const initiateEdit = (note: Note) => {
    setEditingId(note.id);
    setEditText(note.content);
    setDeletingId(null); // Cancel any delete action
  };

  const saveEdit = (id: string) => {
    if (!editText.trim()) return;
    const updatedNotes = notes.map(n => 
      n.id === id ? { ...n, content: editText, updatedAt: Date.now() } : n
    );
    onUpdateProfile({ ...userProfile, notes: updatedNotes });
    setEditingId(null);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === notes.length - 1) return;

    const newNotes = [...notes];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newNotes[index], newNotes[targetIndex]] = [newNotes[targetIndex], newNotes[index]];
    
    onUpdateProfile({ ...userProfile, notes: newNotes });
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24 pt-8 px-6">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 rounded-full bg-white text-stone-500 shadow-sm border border-stone-100 hover:bg-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-serif text-stone-800">Todas as Ideias</h1>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p>Sua mente está tranquila e vazia.</p>
          <p className="text-xs mt-2">Adicione notas na tela de Perfil.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note, index) => (
            <div 
              key={note.id} 
              className={`bg-white rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md overflow-hidden ${
                deletingId === note.id ? 'border-red-200 bg-red-50' : 'border-stone-100'
              }`}
            >
              {/* EDIT MODE */}
              {editingId === note.id ? (
                <div className="flex gap-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1 bg-stone-50 rounded-xl p-3 text-sm text-stone-700 outline-none border border-rose-200 focus:ring-2 focus:ring-rose-100 resize-none"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => saveEdit(note.id)}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setEditingId(null)}
                      className="p-2 bg-white text-stone-500 rounded-lg hover:bg-stone-200"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* VIEW MODE */
                <>
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <p className="text-stone-700 font-serif leading-relaxed whitespace-pre-wrap">{note.content}</p>
                    
                    {/* Reordering */}
                    {deletingId !== note.id && (
                      <div className="flex flex-col gap-1 shrink-0">
                        <button 
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-stone-300 hover:text-stone-600 disabled:opacity-0"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === notes.length - 1}
                          className="p-1 text-stone-300 hover:text-stone-600 disabled:opacity-0"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-stone-100 pt-3 mt-2">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs text-stone-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {deletingId === note.id ? (
                         /* DELETE CONFIRMATION */
                         <div className="flex items-center gap-2 bg-white rounded-full p-1 border border-red-100 shadow-sm animate-in slide-in-from-right-4 duration-200">
                           <span className="text-[10px] text-red-500 font-bold uppercase pl-2 flex items-center gap-1">
                             <AlertTriangle className="w-3 h-3" />
                             Apagar?
                           </span>
                           <button 
                            onClick={() => handleDeleteConfirm(note.id)}
                            className="w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm"
                            title="Sim, apagar"
                           >
                            <Check className="w-3 h-3" />
                           </button>
                           <button 
                            onClick={() => setDeletingId(null)}
                            className="w-6 h-6 flex items-center justify-center bg-stone-200 text-stone-500 rounded-full hover:bg-stone-300"
                            title="Cancelar"
                           >
                            <XCircle className="w-3 h-3" />
                           </button>
                         </div>
                      ) : (
                         /* STANDARD ACTIONS */
                        <>
                          <button 
                            onClick={() => initiateEdit(note)}
                            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-white rounded-full transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setDeletingId(note.id)}
                            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => onChatAboutNote(note)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-100 transition-colors text-xs font-bold"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Conversar</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
