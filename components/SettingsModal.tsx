import React, { useState, useRef, useEffect } from 'react';
import { X, Key, User, Trash2, Check, AlertTriangle, ChevronRight } from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userProfile: UserProfile;
    onUpdateProfile: (profile: UserProfile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, userProfile, onUpdateProfile }) => {
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
    const [nameInput, setNameInput] = useState(userProfile.name);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [apiKeySaved, setApiKeySaved] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setNameInput(userProfile.name);
            setApiKey(localStorage.getItem('gemini_api_key') || '');
            setShowResetConfirm(false);
            setApiKeySaved(false);
        }
    }, [isOpen, userProfile.name]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) onClose();
        };
        if (isOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSaveApiKey = () => {
        localStorage.setItem('gemini_api_key', apiKey.trim());
        (window as any).__geminiKeyUpdated = true;
        setApiKeySaved(true);
        setTimeout(() => setApiKeySaved(false), 2000);
    };

    const handleSaveName = () => {
        if (nameInput.trim()) {
            onUpdateProfile({ ...userProfile, name: nameInput.trim() });
        }
    };

    const handleResetData = () => {
        localStorage.removeItem('dreamPalace_habits');
        localStorage.removeItem('dreamPalace_tasks');
        localStorage.removeItem('dreamPalace_profile');
        window.location.reload();
    };

    const hasApiKey = !!localStorage.getItem('gemini_api_key');

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onClose} />

            <div ref={containerRef} className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-stone-100">
                    <h2 className="font-serif text-xl text-stone-800 font-bold">Configurações</h2>
                    <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-stone-400" />
                    </button>
                </div>

                <div className="p-5 space-y-6 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

                    {/* Name */}
                    <section>
                        <label className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                            <User className="w-3.5 h-3.5" />
                            Seu Nome
                        </label>
                        <div className="flex gap-2">
                            <input
                                value={nameInput}
                                onChange={e => setNameInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-700 font-bold focus:outline-none focus:ring-2 focus:ring-rose-200"
                                placeholder="Seu nome..."
                            />
                            <button
                                onClick={handleSaveName}
                                disabled={!nameInput.trim() || nameInput === userProfile.name}
                                className="px-4 py-2.5 rounded-xl bg-stone-800 text-white text-sm font-bold disabled:opacity-40 hover:bg-stone-700 transition-colors flex items-center gap-1"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                        </div>
                    </section>

                    {/* Gemini API Key */}
                    <section>
                        <label className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
                            <Key className="w-3.5 h-3.5" />
                            Chave API Gemini
                        </label>
                        <p className="text-xs text-stone-400 mb-2">
                            Necessária para geração de casa, ícones e avatares por IA.
                            {hasApiKey ? (
                                <span className="ml-1 text-emerald-500 font-bold">● Configurada</span>
                            ) : (
                                <span className="ml-1 text-red-400 font-bold">● Não configurada</span>
                            )}
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSaveApiKey()}
                                placeholder="AIza..."
                                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-700 font-mono focus:outline-none focus:ring-2 focus:ring-rose-200"
                            />
                            <button
                                onClick={handleSaveApiKey}
                                disabled={!apiKey.trim()}
                                className={`px-4 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-40 transition-colors flex items-center gap-1 ${apiKeySaved ? 'bg-emerald-500' : 'bg-stone-800 hover:bg-stone-700'
                                    }`}
                            >
                                {apiKeySaved ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                        </div>
                        <a
                            href="https://aistudio.google.com/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-rose-400 hover:underline mt-2 block"
                        >
                            → Obter chave grátis no Google AI Studio
                        </a>
                    </section>

                    {/* Danger Zone */}
                    <section className="border-t border-stone-100 pt-5">
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Zona de Perigo</p>
                        {!showResetConfirm ? (
                            <button
                                onClick={() => setShowResetConfirm(true)}
                                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 transition-colors text-sm font-bold"
                            >
                                <Trash2 className="w-4 h-4" />
                                Resetar todos os dados
                            </button>
                        ) : (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <div className="flex items-start gap-2 mb-3">
                                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-600 font-bold">Isso apaga TUDO — hábitos, XP, tarefas, perfil. Sem volta.</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2 rounded-xl border border-stone-200 text-stone-500 text-sm font-bold hover:bg-stone-100 transition-colors">
                                        Cancelar
                                    </button>
                                    <button onClick={handleResetData} className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors">
                                        Confirmar Reset
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};
