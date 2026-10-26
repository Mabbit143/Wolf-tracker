import React from 'react';
import { Map, BarChart3, Bot, Download, Plus, Compass } from 'lucide-react';

interface HeaderProps {
  activeTab: 'map' | 'analytics' | 'ai';
  setActiveTab: (tab: 'map' | 'analytics' | 'ai') => void;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  sightingsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenExportModal,
  sightingsCount,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="/"
        onClick={(e) => {
          e.preventDefault();
          setActiveTab('map');
        }}
        className="flex items-center gap-2.5 group whitespace-nowrap shrink-0"
      >
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
          <Compass className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-white flex items-center gap-2">
            NWT Wolf Tracker
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
              GIS v2.6
            </span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Northwest Territories Wildlife Research</span>
        </div>
      </a>

      {/* Zone 2: Clean 1-line nav links */}
      <nav className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'map'
              ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30 shadow-sm'
              : 'hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>Interactive Map</span>
          <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono rounded bg-slate-800 text-slate-300">
            {sightingsCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'analytics'
              ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30 shadow-sm'
              : 'hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Research Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'ai'
              ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30 shadow-sm'
              : 'hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-cyan-400" />
          <span>AI Habitat Assistant</span>
        </button>
      </nav>

      {/* Zone 3: Primary actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          title="Export CSV / GeoJSON data"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Export GIS</span>
        </button>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm shadow-cyan-500/20 transition-all whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Report Sighting</span>
        </button>
      </div>
    </header>
  );
};
