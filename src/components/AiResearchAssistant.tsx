import React, { useState, useEffect } from 'react';
import { WolfSighting } from '../types/wolf';
import { Bot, Send, Sparkles, Loader2, Compass, FileText, HelpCircle } from 'lucide-react';

interface AiResearchAssistantProps {
  filteredSightings: WolfSighting[];
  initialQuery?: string;
  onClearInitialQuery?: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AiResearchAssistant: React.FC<AiResearchAssistantProps> = ({
  filteredSightings,
  initialQuery,
  onClearInitialQuery,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Welcome to the **NWT Wolf Predator Ecology AI Assistant**. I am configured with domain knowledge on Northwest Territories wolf packs, caribou herd migration corridors, telemetry tracking, and habitat distribution.\n\nHow can I help analyze the **${filteredSightings.length} active sightings** currently filtered in your workspace?`,
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      handleSendPrompt(initialQuery);
      if (onClearInitialQuery) onClearInitialQuery();
    }
  }, [initialQuery]);

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: promptText };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Sample or summarize context so payload stays clean
      const contextSample = filteredSightings.slice(0, 40).map((s) => ({
        id: s.id,
        date: s.date,
        packName: s.packName,
        packSize: s.packSize,
        region: s.region,
        location: s.locationName,
        method: s.observationMethod,
        prey: s.preyProximity,
        behavior: s.behavior,
      }));

      const res = await fetch('/api/gemini/research-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          sightingsContext: contextSample,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to communicate with AI Assistant');
      }

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.text || 'Analysis complete.',
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('AI Research Assistant Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Error analyzing sightings: ${err.message || 'Server connection error. Please try again.'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const PRESET_PROMPTS = [
    {
      label: 'Synthesize Great Slave Lake Packs',
      prompt: 'Synthesize wolf pack activity and density around Great Slave Lake and Prosperous Lake.',
      icon: Compass,
    },
    {
      label: 'Caribou Predator-Prey Dynamics',
      prompt: 'Analyze predator-prey dynamics between wolf packs and caribou herds (Bathurst, Bluenose-East) in this dataset.',
      icon: Sparkles,
    },
    {
      label: 'Generate Field Executive Summary',
      prompt: 'Generate a formal NWT Wildlife Research Executive Summary for the current filtered wolf sightings.',
      icon: FileText,
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-4 h-[calc(100vh-140px)] text-slate-100">
      {/* Top Title Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              NWT Wolf Habitat AI Synthesizer
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                Gemini 3.8 Flash
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Query spatial ecology, telemetry tracks, prey association, and pack movement
            </p>
          </div>
        </div>

        <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
          Context: <span className="text-cyan-300 font-bold">{filteredSightings.length}</span> active sightings
        </div>
      </div>

      {/* Preset Quick Actions */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1 mr-1">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          Research Presets:
        </span>
        {PRESET_PROMPTS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handleSendPrompt(preset.prompt)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-200 transition-colors disabled:opacity-50"
          >
            <preset.icon className="w-3.5 h-3.5 text-cyan-400" />
            <span>{preset.label}</span>
          </button>
        ))}
      </div>

      {/* Messages Stream Area */}
      <div className="flex-1 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-3xl p-4 rounded-2xl text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-cyan-500 text-slate-950 font-medium rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 text-cyan-400 text-xs">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <span className="font-mono text-slate-400">Synthesizing wolf telemetry and ecological context...</span>
          </div>
        )}
      </div>

      {/* Bottom Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendPrompt(inputQuery);
        }}
        className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl"
      >
        <input
          type="text"
          placeholder="Ask a research question or request pack synthesis..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none"
        />

        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 shrink-0"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
