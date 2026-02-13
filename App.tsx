
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Mic, Send, Activity, Layers, 
  Terminal, Newspaper, Trophy, 
  Wand2, Check, User, Sun, Moon, 
  Briefcase, Plane, ShoppingBag, Cpu, Loader2, StopCircle, 
  PenSquare, Share2, Library, History as HistoryIcon
} from 'lucide-react';
import clsx from 'clsx';

import { PrimaryAgent, Message, TrendingTopic, ChatSession, LogicStep } from './types';
import { getTrendingTopics, transcribeAudio } from './services/geminiService';
import { QuantumRoutingGateway } from './services/QuantumRoutingGateway';
import { agentsList, runAgent } from './agents';
import NetworkGraph from './components/NetworkGraph';
import VoiceAuthModal from './components/VoiceAuthModal';

const FinanceCharts = React.lazy(() => 
    import('./components/FinanceCharts')
    .then(module => ({ default: module.default }))
    .catch(() => ({ default: () => <div className="p-4 text-xs text-amber-500">Visualization Unavailable</div> }))
);

const INITIAL_AGENTS: PrimaryAgent[] = agentsList.map(agent => ({
    ...agent,
    active: false,
    status: 'idle',
    usageCount: agent.id === 'general' ? 20 : Math.floor(Math.random() * 10) + 2
}));

const NewsTicker = ({ items, onTopicClick }: { items: TrendingTopic[], onTopicClick: (q: string) => void }) => (
  <div className="bg-white dark:bg-dark-surface border-b border-slate-200 dark:border-dark-border py-2 px-4 flex items-center gap-4 overflow-hidden relative h-10 transition-colors">
    <div className="flex items-center gap-2 text-red-600 dark:text-red-500 font-bold text-[10px] whitespace-nowrap">
      LIVE
    </div>
    <div className="flex-1 overflow-hidden relative h-full flex items-center group">
       <div className="absolute whitespace-nowrap animate-[slideLeft_60s_linear_infinite] group-hover:pause flex gap-12 text-[11px] font-medium text-slate-600 dark:text-slate-300 items-center">
          {items.map((item, idx) => (
             <button key={idx} onClick={() => onTopicClick(item.query)} className="hover:text-brand-600 dark:hover:text-brand-400 focus:outline-none flex items-center gap-1 cursor-pointer">
                <span className="font-bold opacity-60">[{item.category}]</span> {item.headline}
             </button>
          ))}
          {items.map((item, idx) => (
             <button key={`dup-${idx}`} onClick={() => onTopicClick(item.query)} className="hover:text-brand-600 dark:hover:text-brand-400 focus:outline-none flex items-center gap-1 cursor-pointer">
                <span className="font-bold opacity-60">[{item.category}]</span> {item.headline}
             </button>
          ))}
       </div>
    </div>
    <style>{`
      @keyframes slideLeft { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      .group-hover\\:pause:hover { animation-play-state: paused; }
    `}</style>
  </div>
);

const getIcon = (iconName: string, size: number = 16, className?: string) => {
    switch(iconName) {
        case 'Trophy': return <Trophy size={size} className={className} />;
        case 'Terminal': return <Terminal size={size} className={className} />;
        case 'Newspaper': return <Newspaper size={size} className={className} />;
        case 'Briefcase': return <Briefcase size={size} className={className} />;
        case 'Plane': return <Plane size={size} className={className} />;
        case 'ShoppingBag': return <ShoppingBag size={size} className={className} />;
        case 'Cpu': return <Cpu size={size} className={className} />;
        case 'Library': return <Library size={size} className={className} />;
        case 'History': return <HistoryIcon size={size} className={className} />;
        default: return <Activity size={size} className={className} />;
    }
};

function App() {
  const [agents, setAgents] = useState<PrimaryAgent[]>(INITIAL_AGENTS);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>(Date.now().toString());
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'library' | 'history'>('library');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [routingReason, setRoutingReason] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [tickerItems, setTickerItems] = useState<TrendingTopic[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('smb_ai_chat_sessions');
      if (saved) setSessions(JSON.parse(saved));
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    setSessions(prev => {
      const existingIdx = prev.findIndex(s => s.id === currentSessionId);
      const updatedSession: ChatSession = {
        id: currentSessionId,
        title: messages.find(m => m.role === 'user')?.content.slice(0, 30) || 'Chat',
        messages: messages,
        createdAt: existingIdx !== -1 ? prev[existingIdx].createdAt : Date.now(),
        updatedAt: Date.now(),
        domain: messages.find(m => m.agentId)?.agentId || 'general',
      };
      const newSessions = existingIdx !== -1 ? prev.map(s => s.id === currentSessionId ? updatedSession : s) : [updatedSession, ...prev];
      localStorage.setItem('smb_ai_chat_sessions', JSON.stringify(newSessions));
      return newSessions;
    });
  }, [messages, currentSessionId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);

  useEffect(() => {
    const fetchTicker = async () => {
        const topics = await getTrendingTopics();
        if (topics?.length > 0) setTickerItems(topics);
    };
    fetchTicker();
    const interval = setInterval(fetchTicker, 3600000);
    return () => clearInterval(interval);
  }, []);

  const handleMicClick = async () => isRecording ? stopRecording() : startRecording();

  const startRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];
          mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
          mediaRecorder.onstop = () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
              stream.getTracks().forEach(track => track.stop());
              handleTranscription(audioBlob);
          };
          mediaRecorder.start();
          setIsRecording(true);
      } catch (err) {}
  };

  const stopRecording = () => { if (mediaRecorderRef.current && isRecording) { mediaRecorderRef.current.stop(); setIsRecording(false); } };

  const handleTranscription = async (audioBlob: Blob) => {
      setIsTranscribing(true);
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
          const base64String = (reader.result as string).split(',')[1];
          const text = await transcribeAudio(base64String, audioBlob.type);
          if (text) setInput(prev => prev ? `${prev} ${text}` : text);
          setIsTranscribing(false);
      };
  };

  const processMessageGeneration = async (text: string, currentHistory: Message[]) => {
    setRoutingReason("Analyzing...");
    let routingResult;
    try {
        routingResult = await QuantumRoutingGateway.route(text);
    } catch (e) {
        routingResult = { target: 'general', reason: 'Fallback', confidence: 0, latency: 0, steps: [], alternatives: [] };
    }
    const { target, reason, latency, steps } = routingResult;
    setActiveAgentId(target);
    setRoutingReason(`${reason}`);
    
    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
        id: botMsgId, role: 'assistant', content: '', timestamp: new Date(), agentId: target,
        metrics: { latencyMs: latency, confidence: routingResult.confidence, sources: [] },
        computation: { steps: steps }
    }]);

    setAgents(prev => prev.map(a => ({ ...a, active: a.id === target, status: a.id === target ? 'working' : 'idle' })));

    try {
        const stream = await runAgent(target, text, currentHistory);
        let accumulatedText = "";
        for await (const chunk of stream) {
            accumulatedText += (chunk.text || "");
            let displayContent = accumulatedText;
            let chartData = null;
            const jsonMatch = accumulatedText.match(/```json_finance_charts([\s\S]*?)```/);
            if (jsonMatch) {
                 try { chartData = JSON.parse(jsonMatch[1]); displayContent = accumulatedText.replace(jsonMatch[0], '').trim(); } catch (e) {}
            }
            setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, content: displayContent, chartData: chartData } : m));
        }
        setAgents(prev => prev.map(a => ({ ...a, status: a.id === target ? 'success' : 'idle' })));
    } catch (error) {
        setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, content: "Error." } : m));
    } finally {
        setIsStreaming(false);
        setRoutingReason(null);
    }
  };

  const triggerSearch = async (queryText: string) => {
    if (!queryText.trim() || isStreaming) return;
    setIsStreaming(true);
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: queryText, timestamp: new Date() };
    setMessages(prev => [...prev, newUserMsg]);
    await processMessageGeneration(queryText, [...messages, newUserMsg]);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');
    await triggerSearch(text);
  };

  const handleNewChat = () => { setMessages([]); setCurrentSessionId(Date.now().toString()); setInput(''); setActiveAgentId(null); setRoutingReason(null); };

  const selectAgent = (agentId: string) => {
      handleNewChat();
      setActiveAgentId(agentId);
      // Start a chat automatically with a prompt placeholder
      inputRef.current?.focus();
  };

  if (!isAuthenticated) return <VoiceAuthModal isOpen={!isAuthenticated} onAuthenticate={() => setIsAuthenticated(true)} />;

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-dark-bg text-slate-900 dark:text-slate-100 font-sans transition-colors overflow-hidden">
      <header className="flex-none bg-white dark:bg-dark-surface border-b border-slate-200 dark:border-dark-border px-6 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded flex items-center justify-center"><Layers className="text-white" size={16} /></div>
            <h1 className="font-bold text-sm tracking-tight">SMB AI</h1>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 text-slate-500 dark:text-slate-400">{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button>
            <div className="w-8 h-8 rounded bg-slate-100 dark:bg-dark-surface border border-slate-200 dark:border-dark-border flex items-center justify-center text-xs opacity-50"><User size={14} /></div>
        </div>
      </header>
      
      <NewsTicker items={tickerItems} onTopicClick={(q) => triggerSearch(q)} />

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-64 flex-none bg-slate-50 dark:bg-dark-surface border-r border-slate-200 dark:border-dark-border flex flex-col z-10 hidden md:flex">
            {/* NAVIGATION TABS */}
            <div className="flex p-2 gap-1 border-b border-slate-200 dark:border-dark-border">
                <button 
                    onClick={() => setSidebarTab('library')}
                    className={clsx(
                        "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-[11px] font-bold uppercase transition-all",
                        sidebarTab === 'library' ? "bg-white dark:bg-dark-bg shadow-sm text-brand-600" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    )}
                >
                    <Library size={14} /> Library
                </button>
                <button 
                    onClick={() => setSidebarTab('history')}
                    className={clsx(
                        "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-[11px] font-bold uppercase transition-all",
                        sidebarTab === 'history' ? "bg-white dark:bg-dark-bg shadow-sm text-brand-600" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    )}
                >
                    <HistoryIcon size={14} /> History
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {sidebarTab === 'library' ? (
                    <div className="p-2 space-y-1">
                        <div className="px-2 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Agents</div>
                        {agentsList.map(agent => (
                            <div 
                                key={agent.id} 
                                onClick={() => selectAgent(agent.id)}
                                className={clsx(
                                    "p-3 rounded-lg cursor-pointer transition-all border border-transparent flex items-start gap-3",
                                    activeAgentId === agent.id ? "bg-white dark:bg-dark-bg border-slate-200 dark:border-slate-700 shadow-sm" : "hover:bg-slate-200/50 dark:hover:bg-dark-border/30"
                                )}
                            >
                                <div className={clsx("w-8 h-8 rounded flex items-center justify-center shrink-0", activeAgentId === agent.id ? "bg-brand-100 text-brand-600" : "bg-slate-200 dark:bg-slate-800 text-slate-500")}>
                                    {getIcon(agent.icon, 16)}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[12px] font-bold leading-none mb-1">{agent.display_name}</div>
                                    <div className="text-[10px] text-slate-500 line-clamp-1">{agent.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        <div className="flex items-center justify-between px-2 py-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Chats</span>
                            <button onClick={handleNewChat} className="p-1 text-slate-400 hover:text-brand-600 transition-colors"><PenSquare size={14} /></button>
                        </div>
                        {sessions.map(session => (
                            <div key={session.id} onClick={() => { setCurrentSessionId(session.id); setMessages(session.messages); }} className={clsx("p-3 rounded-lg cursor-pointer text-[12px] truncate transition-colors flex items-center gap-3", session.id === currentSessionId ? "bg-white dark:bg-dark-bg shadow-sm font-bold border border-slate-200 dark:border-slate-700" : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-dark-border/30")}>
                                <div className="w-5 h-5 flex items-center justify-center shrink-0 opacity-40">
                                    {getIcon(agentsList.find(a => a.id === session.domain)?.icon || 'MessageSquare', 12)}
                                </div>
                                <span className="truncate">{session.title}</span>
                            </div>
                        ))}
                        {sessions.length === 0 && (
                            <div className="text-center py-10 text-[10px] text-slate-400 italic">No history found.</div>
                        )}
                    </div>
                )}
            </div>
        </aside>

        <section className="flex-1 flex flex-col relative bg-slate-50/50 dark:bg-[#0B1120]">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 gap-4">
                        <Wand2 size={32} />
                        <div className="text-center">
                            <div className="text-sm font-bold">Quantum Core Active</div>
                            <div className="text-[10px] uppercase tracking-widest mt-1">Select an agent or type a query</div>
                        </div>
                    </div>
                )}
                {messages.map((msg) => (
                    <div key={msg.id} className={clsx("flex gap-3 max-w-2xl mx-auto", msg.role === 'user' ? "flex-row-reverse" : "")}>
                        <div className={clsx("w-6 h-6 rounded flex items-center justify-center shrink-0 mt-1", msg.role === 'user' ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-brand-600")}>
                            {msg.role === 'user' ? <User size={12} /> : getIcon(agentsList.find(a => a.id === msg.agentId)?.icon || 'Bot', 12)}
                        </div>
                        <div className={clsx("flex-1 min-w-0 space-y-1", msg.role === 'user' ? "text-right" : "")}>
                            <div className={clsx("inline-block text-left p-3 rounded-lg text-sm transition-all shadow-sm", msg.role === 'user' ? "bg-indigo-600 text-white" : "bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-200")}>
                                {msg.content || <div className="flex gap-1 animate-pulse">...</div>}
                                {(msg as any).chartData && <React.Suspense fallback={<div className="h-32 bg-slate-100 animate-pulse"></div>}><FinanceCharts data={(msg as any).chartData} /></React.Suspense>}
                            </div>
                             {msg.role !== 'user' && msg.computation && (
                                <div className="text-[9px] text-slate-400 mt-1 flex gap-2">
                                    {msg.computation.steps?.filter(s => !['Tokenization', 'L1 Cache Hit', 'Model Inference'].includes(s.step)).map((s, i) => (<span key={i}>• {s.step} ({s.latencyMs.toFixed(0)}ms)</span>))}
                                </div>
                             )}
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-white dark:bg-dark-surface border-t border-slate-200 dark:border-dark-border relative z-20">
                {routingReason && <div className="absolute top-0 left-0 -mt-6 w-full flex justify-center"><div className="bg-brand-600 text-white text-[9px] px-2 py-0.5 rounded shadow-lg animate-pulse">{routingReason}</div></div>}
                <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex items-center gap-2">
                    <button type="button" onClick={handleMicClick} className={clsx("p-2 rounded border border-slate-200 dark:border-dark-border transition-colors", isRecording ? "bg-red-500 text-white" : "bg-slate-100 dark:bg-dark-border text-slate-500")}>{isTranscribing ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />}</button>
                    <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type..." className="flex-1 bg-slate-100 dark:bg-dark-border border border-slate-200 dark:border-dark-border rounded py-2 px-3 text-sm focus:outline-none" disabled={isStreaming} />
                    <button type="submit" disabled={!input.trim() || isStreaming} className={clsx("p-2 rounded shadow", input.trim() && !isStreaming ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-400")}><Send size={16} /></button>
                </form>
            </div>
        </section>

        <aside className="w-64 flex-none bg-white dark:bg-dark-surface border-l border-slate-200 dark:border-dark-border flex flex-col hidden lg:flex">
            <div className="p-3 border-b border-slate-200 dark:border-dark-border text-[10px] font-bold text-slate-400 uppercase tracking-widest">Neural Topography</div>
            <div className="h-48 bg-slate-50 dark:bg-dark-bg border-b border-slate-200 dark:border-dark-border overflow-hidden"><NetworkGraph agents={agents} activeAgentId={activeAgentId} /></div>
            <div className="flex-1 overflow-y-auto p-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Active Sub-Matrix</div>
                {activeAgentId ? (
                    <div className="space-y-1">
                         {agents.find(a => a.id === activeAgentId)?.sub_agents.map(sub => (
                             <div key={sub.id} className="flex items-center gap-2 text-[11px] py-1 border-b border-slate-50 dark:border-slate-800 last:border-0">
                                <div className={clsx("w-1 h-1 rounded-full", sub.status === 'working' ? "bg-amber-400 animate-pulse" : sub.status === 'success' ? "bg-emerald-500" : "bg-slate-300")}></div>
                                <span className="opacity-70 font-medium">{sub.display_name}</span>
                             </div>
                         ))}
                    </div>
                ) : <div className="text-[10px] text-slate-400 italic">Idle State</div>}
            </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
