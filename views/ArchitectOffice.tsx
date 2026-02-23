import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { ChatMessage, Habit, Note } from '../types';
import { chatWithArchitect } from '../services/geminiService';

// -- Helper Component for Typewriter Effect --
const TypewriterText = ({ text, onComplete }: { text: string, onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    // If text changes completely, reset
    if (text !== displayedText && indexRef.current === 0) {
        // Reset handled by ref check below
    }
  }, [text]);

  useEffect(() => {
    // Clean up interval on unmount
    const intervalId = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText((prev) => prev + text.charAt(indexRef.current));
        indexRef.current++;
      } else {
        clearInterval(intervalId);
        if (onComplete) onComplete();
      }
    }, 20); // Speed of typing (ms)

    return () => clearInterval(intervalId);
  }, [text, onComplete]);

  // Handle line breaks properly
  return <div className="whitespace-pre-wrap">{displayedText}</div>;
};

// -- Main Component --

interface ArchitectOfficeProps {
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  habits: Habit[];
  notes: Note[];
  initialInput?: string;
  onClearInitialInput?: () => void;
}

export const ArchitectOffice: React.FC<ArchitectOfficeProps> = ({ 
  messages, 
  addMessage, 
  habits,
  notes,
  initialInput,
  onClearInitialInput 
}) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial input if present
  useEffect(() => {
    if (initialInput) {
      setInput(initialInput);
      if (onClearInitialInput) onClearInitialInput();
    }
  }, [initialInput, onClearInitialInput]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    addMessage(userMsg);
    setInput('');
    setIsTyping(true);

    try {
      // We now pass the habits AND notes to the service
      const responseText = await chatWithArchitect(messages, userMsg.content, habits, notes);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: Date.now(),
      };
      
      addMessage(aiMsg);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen pb-20 bg-stone-50">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-4 shadow-sm border-b border-stone-100 z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 shadow-inner">
             <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-xl text-stone-800">Escritório da Arquiteta</h1>
            <p className="text-xs text-stone-500">Consultoria de bem-estar & design</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="text-center py-20 opacity-50">
            <p className="font-serif text-lg text-stone-400">"Como posso ajudar a construir seus sonhos hoje?"</p>
          </div>
        )}
        
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const isLastMessage = index === messages.length - 1;
          const shouldAnimate = !isUser && isLastMessage;

          return (
            <div 
              key={msg.id} 
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] p-5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  isUser 
                    ? 'bg-stone-800 text-stone-50 rounded-tr-none' 
                    : 'bg-white text-stone-600 border border-stone-100 rounded-tl-none'
                }`}
              >
                {shouldAnimate ? (
                  <TypewriterText text={msg.content} onComplete={scrollToBottom} />
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-stone-100 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center shadow-sm">
              <span className="w-2 h-2 bg-rose-300 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-rose-300 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-rose-300 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-stone-100">
        <div className="flex items-center gap-2 bg-stone-50 rounded-full p-2 pr-2 border border-stone-200 focus-within:border-rose-200 focus-within:ring-2 focus-within:ring-rose-100 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite algo..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-stone-700 placeholder-stone-400 px-4 text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-full bg-stone-800 text-white flex items-center justify-center hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
