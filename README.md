# 🏰 Palácio dos Sonhos

**Construa seus hábitos, conquiste XP e evolua seu palácio pessoal.**

Um app gamificado de hábitos e produtividade, feito como PWA para funcionar no celular como um app nativo.

---

## ✨ Features

### 🧱 Hábitos Gamificados
- Crie hábitos com **dificuldade** (Trivial → Hard) e **frequência** (Diário/Semanal/Mensal)
- Ações duplas: ✅ Sucesso / ❌ Falhou
- Sistema de **Streak** com escudos protetores
- **XP dinâmico** — ganhe mais por streaks longas, perca menos com escudos
- 120+ ícones e cores personalizáveis

### 📅 Calendário & Tarefas
- Grade mensal interativa com **dots coloridos** por hábito e tarefa
- Crie tarefas clicando no dia — só escolha horário e cor
- **Swipe** para direita = concluir, esquerda = excluir (mobile)
- Indicadores de urgência (atrasada/hoje)
- Seção "Próximos Dias" com toggle "Mostrar mais"

### 📊 Analytics
- **XP Total Histórico** e contagem de missões
- **Hábito Lendário** — destaque para seu melhor streak
- Gráfico de **Conclusão Semanal** (%) com cores dinâmicas
- **Fluxo de XP** — timeline de ganhos/perdas diários

### 🏠 Palácio Evolutivo
- Escolha um **estilo arquitetônico** no início
- O palácio **evolui visualmente** conforme você ganha XP
- Sistema de **Prestige** — reconstrua com bônus a cada 1000 XP
- Geração de fachadas via **Gemini AI** (opcional)

### 🤖 Escritório da Arquiteta (IA)
- Chat com IA integrada (Google Gemini)
- Análise inteligente dos seus hábitos
- Sugestões personalizadas de rotina

### 👤 Perfil & Personalização
- Sistema de **Avatar** (Classic, 8-Bit, AI Art, Upload)
- Notas pessoais com opção "Conversar sobre esta nota"
- Nível e progresso visual

### 📱 PWA & Mobile
- Instalável como app no celular (Add to Home Screen)
- Splash screen animado
- Safe-area para iPhones com notch
- Funciona offline (service worker com cache)

---

## 🚀 Como Usar

### Rodar localmente
```bash
git clone https://github.com/fernangcortes/palacio-dos-sonhos.git
cd palacio-dos-sonhos
npm install
npm run dev
```
Acesse `http://localhost:3000`

### Configurar IA (opcional)
1. Abra o app → **Perfil** → ⚙️ **Configurações**
2. Cole sua [Chave API Gemini](https://aistudio.google.com/apikey) (grátis)
3. Pronto — geração de casas, avatares e chat com IA funcionando

### Instalar no celular
1. Abra o link do app no **Chrome**
2. Toque em **"Adicionar à tela inicial"**
3. O app abre como nativo, com splash screen e tudo

---

## 🛠️ Stack

| Tecnologia | Uso |
|---|---|
| React 19 | UI |
| TypeScript | Tipagem |
| Tailwind CSS | Estilização |
| Vite | Build & Dev |
| Gemini AI | Chat, geração de imagens |
| localStorage | Persistência |
| PWA (Service Worker) | Offline & instalável |

---

## 📁 Estrutura

```
├── App.tsx                    # App principal + lógica de XP/hábitos
├── index.html                 # PWA meta tags + splash CSS
├── types.ts                   # Tipos TypeScript
├── components/
│   ├── CreateHabitModal.tsx    # Modal de criação de hábitos
│   ├── CreateTaskModal.tsx     # Modal de tarefas (com cor picker)
│   ├── EditAvatarModal.tsx     # Editor de avatar
│   ├── LevelUpModal.tsx        # Celebração de level up
│   ├── Navigation.tsx          # Barra de navegação (5 abas)
│   └── SettingsModal.tsx       # Configurações (nome, API key)
├── views/
│   ├── ConstructionSite.tsx    # Tela principal (hábitos + palácio)
│   ├── CalendarView.tsx        # Calendário + tarefas + swipe
│   ├── AnalyticsView.tsx       # Dashboard de estatísticas
│   ├── ArchitectOffice.tsx     # Chat com IA
│   ├── ProfileView.tsx         # Perfil + notas
│   └── NotesView.tsx           # Lista de notas
├── services/
│   └── geminiService.ts        # Integração Gemini AI
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker
│   └── icon-512.png            # Ícone do app
└── media/                      # Assets visuais
```

---

**Feito com 🏰 por [@fernangcortes](https://github.com/fernangcortes)**
