import { GoogleGenAI, Type } from "@google/genai";
import { GeminiAnalysisResult, ChatMessage, Habit, Note } from "../types";

// Using Gemini 3.0 Flash for text/logic as requested and recommended
const TEXT_MODEL = "gemini-3-flash-preview";
// Using 2.5 Flash Image for icon generation
const IMAGE_MODEL = "gemini-2.5-flash-image";

let ai: GoogleGenAI | null = null;
let lastApiKey: string | null = null;

const getAI = () => {
  const storedKey = localStorage.getItem('gemini_api_key');
  const apiKey = storedKey || process.env.API_KEY;
  // Re-create client if key changed
  if (!ai || apiKey !== lastApiKey) {
    if (!apiKey) throw new Error('Nenhuma chave API Gemini configurada. Vá em Perfil → Configurações para adicionar sua chave.');
    ai = new GoogleGenAI({ apiKey });
    lastApiKey = apiKey;
  }
  return ai;
};

export const analyzeHabitInput = async (userInput: string): Promise<GeminiAnalysisResult> => {
  const client = getAI();

  const prompt = `
    O usuário definiu o NOME de um hábito: '${userInput}'.
    Sua tarefa é classificar e criar um prompt visual para este hábito.
    
    Retorne um JSON:
    1. category: Classifique em 'Saúde', 'Intelecto', 'Espiritual', 'Trabalho', 'Lazer' ou 'Detox'.
    2. visualPrompt: Um prompt visual DETALHADO em inglês para gerar um ícone plano (flat icon), vetor, minimalista, fundo branco, usando cores rosa pastel (#FFD1DC) e dourado (#FFD700). O ícone deve representar o hábito '${userInput}'.
    3. goalType: 'positive' (construir hábito) ou 'negative' (parar vício/hábito ruim).
    4. motivationalTip: Uma frase curta de 1 linha motivando a pessoa sobre este hábito específico.
    5. title: Apenas repita o texto '${userInput}' (o frontend vai usar o input original, mas preencha este campo para segurança).
  `;

  try {
    const response = await client.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            visualPrompt: { type: Type.STRING },
            motivationalTip: { type: Type.STRING },
            goalType: { type: Type.STRING, enum: ['positive', 'negative'] },
          },
          required: ["title", "category", "visualPrompt", "motivationalTip", "goalType"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result as GeminiAnalysisResult;
  } catch (error) {
    console.error("Error analyzing habit:", error);
    throw new Error("Falha ao analisar o hábito. Tente novamente.");
  }
};

export const generateHabitIcon = async (visualPrompt: string): Promise<string> => {
  const client = getAI();

  // Enforcing the style strictly in the system/prompt modification
  const styledPrompt = `
    Create a cute 8-bit pixel art icon, low resolution, retro game style.
    Style: Isometric view, minimalist, clean pixel lines.
    Colors: Pastel Pink, Gold, White background.
    Subject: ${visualPrompt}.
    No text, center the object, plenty of white space.
  `;

  try {
    const response = await client.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [
          { text: styledPrompt }
        ]
      },
      config: {
        // Image generation specific configs can go here if needed, 
        // essentially relying on the prompt for style.
      }
    });

    // Extract image from response
    let base64Image = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64Image) {
      throw new Error("No image generated");
    }

    return `data:image/png;base64,${base64Image}`;
  } catch (error) {
    console.error("Error generating icon:", error);
    return "https://picsum.photos/200?blur=2";
  }
};

export const generateAvatarImage = async (prompt: string, base64Photo?: string): Promise<string> => {
  const client = getAI();

  const avatarPrompt = `Create a beautiful, artistic portrait avatar.
    Style: Painterly illustration, vibrant colors, expressive.
    Subject: A person who is ${prompt || 'a dreamer building their dream palace'}.
    Format: Square portrait, centered face, artistic background.
    No text or watermarks.`;

  try {
    const parts: any[] = [{ text: avatarPrompt }];

    if (base64Photo) {
      parts.unshift({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Photo,
        }
      });
    }

    const response = await client.models.generateContent({
      model: IMAGE_MODEL,
      contents: { parts },
    });

    let base64Image = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64Image) throw new Error("No image generated");
    return `data:image/png;base64,${base64Image}`;
  } catch (error) {
    console.error("Error generating avatar:", error);
    throw error;
  }
};

export const generateHouseView = async (currentXp: number, architecturalStyle: string, habits: Habit[]): Promise<string> => {
  const client = getAI();

  // Calculate the percentage of construction out of 1000 XP
  // Cap XP at 1000 just in case. Ensure it doesn't drop below 0 for visuals.
  const visualXp = Math.max(0, Math.min(1000, currentXp));

  // Define phases based on the 1000 XP scale
  let phaseDescription = "A flat plot of land with pink marble foundations, golden measuring tools, and surveying equipment. A construction site just starting out.";

  if (visualXp > 50) {
    phaseDescription = "Ground level foundations and scattered bricks. A construction site in early progress with some structural outlines.";
  }
  if (visualXp > 200) {
    phaseDescription = "First floor walls are partially built with pink marble and stone. Wooden scaffolding is present. The base structure is taking shape.";
  }
  if (visualXp > 400) {
    phaseDescription = "The first floor is fully built, and the second floor is under construction. There are elegant pillars and some windows installed.";
  }
  if (visualXp > 600) {
    phaseDescription = "The main structure is almost complete with multiple floors. They are actively putting on the roof. Golden accents are visible.";
  }
  if (visualXp > 800) {
    phaseDescription = "The house is fully built but surrounding landscaping and final polish are being done. It looks beautiful and elegant.";
  }
  if (visualXp >= 1000) {
    phaseDescription = "A magnificent, completely finished dream palace, glowing with magical ethereal light, perfect in every detail.";
  }

  // 2. Determine Details based on Habits categories
  const categories = [...new Set(habits.map(h => h.category))];
  let details = "";
  if (categories.includes("Saúde") || categories.includes("Health")) details += " Includes a small zen garden next to the house.";
  if (categories.includes("Intelecto") || categories.includes("Study")) details += " Includes a visible telescope or outdoor reading nook.";
  if (categories.includes("Criatividade") || categories.includes("Art")) details += " Includes an outside easel or flower array.";

  const prompt = `
    Generate a photorealistic image in a STRICTLY CUTE 8-BIT PIXEL ART style.
    This must look like a high-quality isometric indie game (like Stardew Valley or classic RPGs).
    
    Subject: A house under construction in the **${architecturalStyle}** style.
    Construction Phase: ${visualXp} out of 1000 XP.
    Visual Description of the Phase: ${phaseDescription}
    
    Aesthetic: Cute, pastel pink, warm beige, gold, and white marble.
    Lighting: Bright, colorful, sunny golden hour.
    View: Isometric perspective.
    Details: ${details}
    
    IMPORTANT: The entire image MUST be in pixel art format. Do not make it photorealistic or 3D rendered. It needs to look like a retro 8-bit game sprite scene.
  `;

  try {
    const response = await client.models.generateContent({
      model: IMAGE_MODEL,
      contents: { parts: [{ text: prompt }] },
    });

    let base64Image = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64Image) throw new Error("No image generated");
    return `data:image/png;base64,${base64Image}`;
  } catch (error) {
    console.error("Error generating house:", error);
    throw error;
  }
};

export const chatWithArchitect = async (history: ChatMessage[], userMessage: string, habits: Habit[], notes: Note[]): Promise<string> => {
  const client = getAI();

  // Create a context string from the user's habits
  const habitsList = habits.map(h => `- ${h.title} (${h.category} - Tipo: ${h.goalType}): ${h.streak} dias de sequência.`).join('\n');
  const notesList = notes.map(n => `- ${n.content} `).join('\n');

  // Convert internal history to Gemini format
  const systemInstruction = `
    Você é a "Arquiteta dos Sonhos", uma assistente pessoal elegante, sofisticada e motivadora.
    Seu tom é calmo, profissional, mas acolhedor(como uma arquiteta de luxo).
    
    REGRAS DE FORMATAÇÃO(IMPORTANTE):
    1. NÃO use negrito(** texto **).Escreva de forma limpa.
    2. NÃO use Markdown complexo.Apenas texto puro e quebras de linha.
    3. Use parágrafos claros para organizar suas ideias.Deixe uma linha em branco entre parágrafos.
    4. Escreva como uma conversa humana natural, não como um robô formatado.

    O tema do app é construir a "Casa dos Sonhos" através de hábitos.
    Ajude o usuário a manter seus hábitos, dê conselhos práticos e curtos.

    CONTEXTO ATUAL DA OBRA(HÁBITOS DO USUÁRIO):
    ${habits.length > 0 ? habitsList : "O usuário ainda não definiu hábitos (alicerces). Incentive-o a começar."}

    IDEIAS E ANOTAÇÕES DO USUÁRIO(RASCUNHOS DA PLANTA):
    ${notes.length > 0 ? notesList : "Nenhuma anotação disponível ainda."}

    Se o usuário perguntar sobre o progresso, use os dados acima.
    Se o usuário mencionar uma ideia ou anotação, use o contexto das anotações.
    Se o usuário for vago, pergunte o que ele gostaria de construir hoje.
  `;

  const chat = client.chats.create({
    model: TEXT_MODEL,
    config: {
      systemInstruction: systemInstruction,
    },
    history: history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }))
  });

  try {
    const result = await chat.sendMessage({ message: userMessage });
    return result.text || "Desculpe, estou recalculando a planta. Pode repetir?";
  } catch (error) {
    console.error("Chat error:", error);
    return "Houve um problema de comunicação com o escritório central.";
  }
};