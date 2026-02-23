<div align="center">
  <h1>Palácio dos Sonhos 🏰✨</h1>
  <p><strong>Construa sua vida, tijolo por tijolo.</strong></p>
</div>

**Palácio dos Sonhos** não é apenas um rastreador de hábitos; é a materialização visual da sua disciplina. Neste aplicativo gamificado, a construção de uma rotina saudável e produtiva se traduz literalmente na evolução arquitetônica de um palácio majestoso, acompanhado por uma Inteligência Artificial conselheira: A Arquiteta dos Sonhos.

---

## 📋 Visão e Conceito (V2.0)

A maioria dos habit trackers aposta na temática de RPG (Matar monstros, ganhar ouro). O *Palácio dos Sonhos* aposta na **Contemplação, Construção e Estética**.

Você começa num canteiro de obras desorganizado. Ao concluir hábitos difíceis, evitar ações negativas e gerenciar bem o seu tempo, você acumula Experiência (XP). Em marcos de desenvolvimento, a IA projeta uma nova fachada para a sua vida — sua casa evolui lado a lado com sua mente. Mas cuidado: negligenciar a rotina traz ruínas ao seu palácio.

### Análise de Forças & Fraquezas (Roadmap to Greatness)

**Pontos Fortes da Arquitetura Atual:**
- **Inovação Temática:** Foco em construção civil e arquitetura traz uma paz visual.
- **Integração IA Orgânica:** A Geração Procedural de ícones de hábitos e do estado da casa pela IA (Google Gemini) torna a experiência mágica e imprevisível.
- **Arquiteta dos Sonhos:** Uma conselheira IA consciente dos seus hábitos e anotações.

**Gargalos a Superar (Foco da Refatoração):**
- O sistema de pontuação atual é uniforme. Precisamos de um peso real para a **Dificuldade** do hábito.
- A criação de hábitos precisa de mais controle manual (Tipo, Dificuldade, Frequência) para ser útil a longo prazo, em vez de depender apenas da adivinhação da IA.
- O Calendário precisa sair do isolamento e sincronizar com ferramentas do mundo real (ex: Google Calendar).

---

## � Funcionalidades Core

### 1. O Canteiro de Obras (Hábitos Estruturados) 🏗️
Gerenciamento de hábitos de alta precisão inspirado nas melhores UX mobile:
- **Dificuldade Ajustável:** Hábitos Triviais, Fáceis, Médios e Difíceis. O ganho e a penalidade de XP escalam com o esforço.
- **Tipos de Hábito:** `+ Positivos` (Faça para ganhar XP) e `- Negativos` (Evite para não tomar dano de XP).
- **Frequência Dinâmica:** Reset diário, semanal ou mensal (Roadmap).

### 2. O Escritório da Arquiteta (Chat IA Agêntico) 👩‍🎨
Uma persona IA alimentada pelo **Gemini 3.0 Flash**, desenhada para ser sua mentora.
- Ela analisa o seu progresso diário invisivelmente.
- Ela lê suas Notas (Diário de Bordo) para ter contexto emocional durante as conversas.

### 3. Palácio Dinâmico (Recompensa Visual) 🏡
Seu nível dita o escopo da obra, e sua dedicação dita a conservação.
A Inteligência Artificial (`gemini-2.5-flash-image`) renderiza proceduralmente sua fachada a cada Level Up!

---

## 🛠️ Stack Tecnológico

- **Framework:** React 19 + TypeScript + Vite (SSR/API TBD).
- **Estilização:** Tailwind CSS (Theme custom: Rose, Gold, Stone)
- **Persistência atual:** LocalStorage (Migration to Backend planned).
- **IA e LLMs:** Google GenAI API.

## 📦 Como Rodar Localmente

1. **Dependências:** Certifique-se de ter o Node.js instalado.
   ```bash
   npm install
   ```
2. **Setup da API:**
   Crie um arquivo `.env.local` na raiz do projeto e adicione sua chave de API do Google Gemini:
   ```
   GEMINI_API_KEY=sua_chave_aqui
   ```
3. **Iniciando os Trabalhos:**
   ```bash
   npm run dev
   ```

---

## 📅 Planners & Milestones Futuros

Este projeto está passando por uma reconstrução em fases.

*   **Fase 1 (Atual): Refatoração de Controle.** Reformular a UI de Criação de Hábitos para oferecer controle total sobre Dificuldade e Polaridade (Positivo/Negativo).
*   **Fase 2: Arquitetura do Esforço.** Implementar o novo algoritmo de XP ponderado baseado na dificuldade dos hábitos.
*   **Fase 3: Hub de Vida.** Integrar Notas, Tarefas e a Inteligência Artificial, permitindo que a "Arquiteta" crie eventos na sua agenda via System Prompt e Function Calling.
*   **Fase 4: Mundo Real.** Integração pesada com o Google Calendar API.

> "A grande obra da arquitetura é você mesmo."
