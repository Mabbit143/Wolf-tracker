import React from 'react';
import { WolfSighting } from '../types/wolf';
import { Calendar, MapPin, Eye, Radio, Sparkles } from 'lucide-react';

interface SightingCardProps {
  sighting: WolfSighting;
  isSelected: boolean;
  onSelect: (sighting: WolfSighting) => void;
}

export const SightingCard: React.FC<SightingCardProps> = ({ sighting, isSelected, onSelect }) => {
  // Pack size badge color code
  let badgeStyle = 'bg-slate-800 text-slate-200 border-slate-700';
  if (sighting.packSize === 1) {
    badgeStyle = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  } else if (sighting.packSize <= 5) {
    badgeStyle = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
  } else if (sighting.packSize <= 10) {
    badgeStyle = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  } else {
    badgeStyle = 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm';
  }

  return (
    <div
      onClick={() => onSelect(sighting)}
      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
        isSelected
          ? 'bg-slate-900 border-cyan-500 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/50'
          : 'bg-slate-950/80 hover:bg-slate-900/90 border-slate-800/90 hover:border-slate-700'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <span className="font-bold text-slate-100 text-xs tracking-tight line-clamp-1">
            {sighting.packName}
          </span>
          <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
            <span className="truncate">{sighting.locationName}</span>
          </span>
        </div>

        <div className={`px-2 py-0.5 rounded-lg border font-mono text-xs font-bold shrink-0 ${badgeStyle}`}>
          {sighting.packSize} {sighting.packSize === 1 ? 'Wolf' : 'Wolves'}
        </div>
      </div>

      {/* Behavior summary */}
      <p className="text-[11px] text-slate-300 line-clamp-2 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
        "{sighting.behavior}"
      </p>

      {/* Metadata Row */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-1 text-slate-300">
          <Calendar className="w-3 h-3 text-cyan-400" />
          <span>{sighting.date}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {sighting.collaredWolfId && (
            <span className="flex items-center gap-1 text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-1.5 py-0.2 rounded">
              <Radio className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
              <span>{sighting.collaredWolfId}</span>
            </span>
          )}

          {sighting.pupCount && (
            <span className="text-amber-300 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.2 rounded flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" />
              <span>{sighting.pupCount} Pups</span>
            </span>
          )}

          <span className="text-slate-400 flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{sighting.observationMethod.split(' ')[0]}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
