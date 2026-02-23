import React, { useState, useEffect, useRef } from 'react';
import { X, Check, RefreshCw, User, Gamepad2, Sparkles, Upload, Loader2 } from 'lucide-react';
import { AvatarConfig } from '../types';
import { generateAvatarImage } from '../services/geminiService';

interface EditAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig?: AvatarConfig;
  onSave: (config: AvatarConfig) => void;
}

// --- Classic (Avataaars) preset seeds ---
const CLASSIC_SEEDS = [
  'Aurora', 'Beatriz', 'Cecília', 'Diana', 'Elena',
  'Flávia', 'Gabriela', 'Helena', 'Isabela', 'Juliana',
  'Larissa', 'Mariana', 'Nathalia', 'Olivia', 'Paula',
  'Rafaela', 'Sofia', 'Tatiana', 'Valentina', 'Yasmin',
];

// --- 8-Bit (DiceBear pixel-art) preset seeds ---
const EIGHTBIT_SEEDS = [
  'Palácio', 'Sonho', 'Construtora', 'Arquiteta', 'Visionária',
  'Opus', 'Fundação', 'Desejo', 'Pilar', 'Aurora',
  'Luxo', 'Cristal', 'Torre', 'Diamante', 'Ouro',
  'Bravo', 'Luna', 'Cosmo', 'Zen', 'Phoenix',
];

type AvatarMode = 'classic' | '8bit' | 'ai' | 'upload';

const DEFAULT_CONFIG: AvatarConfig = {
  sourceType: 'classic',
  seed: 'Aurora',
};

export const EditAvatarModal: React.FC<EditAvatarModalProps> = ({ isOpen, onClose, currentConfig, onSave }) => {
  const [mode, setMode] = useState<AvatarMode>('classic');

  // Classic state
  const [classicSeed, setClassicSeed] = useState('Aurora');
  const [classicCustom, setClassicCustom] = useState('');
  const [classicApplied, setClassicApplied] = useState('Aurora'); // only updates on blur/Enter

  // 8-bit state
  const [eightSeed, setEightSeed] = useState('Palácio');
  const [eightCustom, setEightCustom] = useState('');
  const [eightApplied, setEightApplied] = useState('Palácio'); // only updates on blur/Enter

  // AI state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Upload state
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const src = currentConfig?.sourceType;
    if (src === 'dicebear-8bit' || src === '8bit') {
      setMode('8bit');
      const seed = currentConfig?.seed || 'Palácio';
      setEightSeed(seed); setEightApplied(seed); setEightCustom('');
    } else if (src === 'ai-generated') {
      setMode('ai');
      setAiImageUrl(currentConfig?.imageUrl || null);
    } else if (src === 'uploaded') {
      setMode('upload');
      setUploadedUrl(currentConfig?.imageUrl || null);
    } else {
      setMode('classic');
      const seed = currentConfig?.seed || 'Aurora';
      setClassicSeed(seed); setClassicApplied(seed); setClassicCustom('');
    }
  }, [isOpen, currentConfig]);

  if (!isOpen) return null;

  // --- URL helpers ---
  const getClassicUrl = (seed: string) =>
    `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}&size=128`;

  const get8BitUrl = (seed: string) =>
    `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(seed)}&size=128`;

  // --- Classic: apply custom seed on blur or Enter ---
  const applyClassicCustom = () => {
    const val = classicCustom.trim();
    if (val) { setClassicApplied(val); setClassicSeed(''); }
    else if (!classicSeed) setClassicApplied('Aurora');
  };

  // --- 8-bit: apply custom seed on blur or Enter ---
  const applyEightCustom = () => {
    const val = eightCustom.trim();
    if (val) { setEightApplied(val); setEightSeed(''); }
    else if (!eightSeed) setEightApplied('Palácio');
  };

  // --- AI: generate ---
  const handleGenerateAI = async () => {
    setAiLoading(true); setAiError(null);
    try {
      const url = await generateAvatarImage(aiPrompt);
      setAiImageUrl(url);
    } catch {
      setAiError('Falha na geração. Tente um prompt diferente.');
    } finally {
      setAiLoading(false);
    }
  };

  // --- Upload ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // --- Save ---
  const handleSave = () => {
    if (mode === 'classic') {
      onSave({ sourceType: 'classic', seed: classicApplied });
    } else if (mode === '8bit') {
      onSave({ sourceType: 'dicebear-8bit', seed: eightApplied });
    } else if (mode === 'ai' && aiImageUrl) {
      onSave({ sourceType: 'ai-generated', imageUrl: aiImageUrl });
    } else if (mode === 'upload' && uploadedUrl) {
      onSave({ sourceType: 'uploaded', imageUrl: uploadedUrl });
    }
    onClose();
  };

  const canSave = mode === 'classic' || mode === '8bit' || (mode === 'ai' && !!aiImageUrl) || (mode === 'upload' && !!uploadedUrl);

  // --- Reusable seed gallery (no name input — editing name is done in Profile) ---
  const SeedGallery = ({
    seeds, selectedSeed, applied, urlFn, pixelated,
    onSelectSeed
  }: {
    seeds: string[]; selectedSeed: string; applied: string;
    urlFn: (s: string) => string; pixelated?: boolean;
    onSelectSeed: (s: string) => void;
  }) => (
    <div className="p-5">
      {/* Preview */}
      <div className="flex justify-center mb-5">
        <div className="w-28 h-28 rounded-2xl bg-stone-50 border-2 border-stone-200 flex items-center justify-center overflow-hidden shadow-inner">
          <img src={urlFn(applied)} alt="Preview" className="w-full h-full"
            style={pixelated ? { imageRendering: 'pixelated' } : {}} />
        </div>
      </div>

      {/* Preset grid */}
      <div className="grid grid-cols-4 gap-2">
        {seeds.map(seed => (
          <button key={seed} onClick={() => onSelectSeed(seed)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${applied === seed ? 'border-rose-400 bg-rose-50' : 'border-stone-100 hover:border-stone-300 bg-white'
              }`}>
            <img src={urlFn(seed)} alt={seed} className="w-10 h-10"
              style={pixelated ? { imageRendering: 'pixelated' } : {}} />
            <span className="text-[9px] font-bold text-stone-500 leading-tight text-center">{seed}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-stone-100 shrink-0">
          <h2 className="font-serif text-xl text-stone-800 font-bold">Editar Aparência</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex shrink-0 border-b border-stone-100 bg-stone-50">
          {([
            { id: 'classic', label: 'Clássico', Icon: User },
            { id: '8bit', label: '8-Bit', Icon: Gamepad2 },
            { id: 'ai', label: 'Arte IA', Icon: Sparkles },
            { id: 'upload', label: 'Upload', Icon: Upload },
          ] as { id: AvatarMode; label: string; Icon: any }[]).map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setMode(id)}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-colors ${mode === id ? 'border-rose-400 text-rose-500 bg-white' : 'border-transparent text-stone-400 hover:text-stone-600'
                }`}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarWidth: 'none' }}>

          {mode === 'classic' && (
            <SeedGallery
              seeds={CLASSIC_SEEDS}
              selectedSeed={classicSeed}
              applied={classicApplied}
              urlFn={getClassicUrl}
              onSelectSeed={(s) => { setClassicSeed(s); setClassicApplied(s); }}
            />
          )}

          {mode === '8bit' && (
            <SeedGallery
              seeds={EIGHTBIT_SEEDS}
              selectedSeed={eightSeed}
              applied={eightApplied}
              urlFn={get8BitUrl}
              pixelated
              onSelectSeed={(s) => { setEightSeed(s); setEightApplied(s); }}
            />
          )}

          {mode === 'ai' && (
            <div className="p-5">
              <p className="text-sm text-stone-500 mb-4">Descreva como quer ser retratada e a IA cria uma arte única.</p>
              {aiLoading ? (
                <div className="flex justify-center mb-4">
                  <div className="w-36 h-36 rounded-2xl bg-rose-50 border-2 border-rose-100 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
                    <span className="text-xs text-rose-400 font-bold">Gerando...</span>
                  </div>
                </div>
              ) : aiImageUrl ? (
                <div className="flex justify-center mb-4">
                  <img src={aiImageUrl} alt="AI Avatar" className="w-36 h-36 rounded-2xl object-cover shadow-lg border-4 border-rose-100" />
                </div>
              ) : (
                <div className="flex justify-center mb-4">
                  <div className="w-36 h-36 rounded-2xl bg-stone-50 border-2 border-dashed border-stone-200 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-stone-200" />
                  </div>
                </div>
              )}
              <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                placeholder="Ex: Uma arquiteta elegante com olhos claros, estilo renascentista..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-rose-200 resize-none h-20 mb-3" />
              {aiError && <p className="text-xs text-red-500 mb-3">{aiError}</p>}
              <button onClick={handleGenerateAI} disabled={aiLoading || !aiPrompt.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-400 to-amber-400 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {aiImageUrl ? 'Gerar Novamente' : 'Gerar Avatar'}
              </button>
            </div>
          )}

          {mode === 'upload' && (
            <div className="p-5">
              <p className="text-sm text-stone-500 mb-4">Envie uma foto ou imagem para usar como avatar.</p>
              {uploadedUrl ? (
                <div className="flex flex-col items-center gap-3 mb-4">
                  <img src={uploadedUrl} alt="Uploaded" className="w-36 h-36 rounded-full object-cover shadow-lg border-4 border-rose-100" />
                  <button onClick={() => setUploadedUrl(null)} className="text-xs text-stone-400 hover:text-red-500 transition-colors flex items-center gap-1">
                    <X className="w-3 h-3" /> Remover
                  </button>
                </div>
              ) : (
                <div className="flex justify-center mb-4">
                  <div className="w-36 h-36 rounded-full bg-stone-50 border-2 border-dashed border-stone-200 flex items-center justify-center">
                    <Upload className="w-10 h-10 text-stone-200" />
                  </div>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 rounded-xl border-2 border-stone-200 text-stone-600 font-bold flex items-center justify-center gap-2 hover:border-rose-300 hover:text-rose-500 transition-all">
                <Upload className="w-4 h-4" />
                {uploadedUrl ? 'Trocar Foto' : 'Selecionar Arquivo'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-white shrink-0">
          <button onClick={handleSave} disabled={!canSave}
            className="w-full py-3 rounded-xl bg-stone-800 text-white font-bold flex items-center justify-center gap-2 hover:bg-stone-700 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <Check className="w-5 h-5" /> Salvar Visual
          </button>
        </div>
      </div>
    </div>
  );
};
