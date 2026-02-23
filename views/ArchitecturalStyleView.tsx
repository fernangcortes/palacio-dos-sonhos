import React, { useState } from 'react';
import { Home, Sparkles, Wand2 } from 'lucide-react';
import { UserProfile } from '../types';

interface ArchitecturalStyleViewProps {
    userProfile: UserProfile;
    onStyleSelected: (style: string) => void;
}

const STYLES = [
    { id: 'Medieval Fantasy', label: 'Fantasia Medieval', desc: 'Pedras rústicas, madeira escura e bandeiras vermelhas.' },
    { id: 'Victorian', label: 'Vitoriano Clássico', desc: 'Tijolos escuros, telhados pontiagudos e janelas altas.' },
    { id: 'Cyberpunk Pixel', label: 'Retrô Cyberpunk', desc: 'Luzes neon pink/dourado, cabos e metal escuro.' },
    { id: 'Modern Minimalist', label: 'Minimalista Moderno', desc: 'Concreto branco, fadas de luxo e grandes vidraças.' },
    { id: 'Elven Forest', label: 'Bosque Élfico', desc: 'Casas na árvore, mármore branco e vinhas douradas.' }
];

export const ArchitecturalStyleView: React.FC<ArchitecturalStyleViewProps> = ({ userProfile, onStyleSelected }) => {
    const [selected, setSelected] = useState<string>('');

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-stone-800">
            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">

                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-100 text-rose-500 mb-4">
                        <Home className="w-10 h-10" />
                    </div>
                    <h1 className="font-serif text-3xl font-bold">A Planta do Palácio</h1>
                    <p className="text-stone-500">
                        {userProfile.completedHouses > 0
                            ? `Bem-vindo de volta! Você já construiu ${userProfile.completedHouses} palácios. Onde começaremos a nova obra?`
                            : 'Todo grande sonho precisa de um projeto. Qual será o estilo do seu palácio?'}
                    </p>
                </div>

                <div className="space-y-4">
                    {STYLES.map(style => (
                        <button
                            key={style.id}
                            onClick={() => setSelected(style.id)}
                            className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${selected === style.id
                                    ? 'border-amber-400 bg-amber-50/50 shadow-md ring-4 ring-amber-100'
                                    : 'border-stone-200 hover:border-amber-200 hover:bg-white/50'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold text-lg">{style.label}</h3>
                                {selected === style.id && <Sparkles className="w-5 h-5 text-amber-500" />}
                            </div>
                            <p className="text-sm text-stone-500">{style.desc}</p>
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => onStyleSelected(selected)}
                    disabled={!selected}
                    className="w-full py-4 rounded-xl bg-stone-800 text-white font-bold flex items-center justify-center gap-2 hover:bg-stone-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Wand2 className="w-5 h-5 text-amber-300" />
                    <span>Iniciar Obra (8-Bit Magic)</span>
                </button>

            </div>
        </div>
    );
};
