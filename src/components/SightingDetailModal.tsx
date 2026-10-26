import React from 'react';
import { WolfSighting } from '../types/wolf';
import { X, Calendar, MapPin, Radio, Users, Thermometer, ShieldAlert, Bot, Sparkles, Compass } from 'lucide-react';

interface SightingDetailModalProps {
  sighting: WolfSighting | null;
  onClose: () => void;
  onQueryAiAboutSighting: (sighting: WolfSighting) => void;
}

export const SightingDetailModal: React.FC<SightingDetailModalProps> = ({
  sighting,
  onClose,
  onQueryAiAboutSighting,
}) => {
  if (!sighting) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">{sighting.packName}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                  {sighting.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 font-mono">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{sighting.locationName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-200">
          {/* Top Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Users className="w-3 h-3 text-cyan-400" />
                PACK SIZE
              </span>
              <span className="text-xl font-bold font-mono text-cyan-300 mt-1">
                {sighting.packSize} <span className="text-xs font-sans text-slate-400 font-normal">wolves</span>
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Calendar className="w-3 h-3 text-cyan-400" />
                OBSERVATION DATE
              </span>
              <span className="text-sm font-semibold font-mono text-slate-100 mt-1">{sighting.date}</span>
              <span className="text-[10px] text-slate-400 font-mono">{sighting.time}</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-cyan-400" />
                TEMPERATURE
              </span>
              <span className="text-sm font-semibold font-mono text-slate-100 mt-1">
                {sighting.temperatureCelsius !== undefined ? `${sighting.temperatureCelsius}°C` : 'N/A'}
              </span>
              <span className="text-[10px] text-slate-400 truncate">{sighting.weatherCondition}</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyan-400" />
                METHOD
              </span>
              <span className="text-xs font-semibold text-cyan-300 mt-1 truncate">
                {sighting.observationMethod}
              </span>
            </div>
          </div>

          {/* Coordinates & Region Box */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="font-semibold text-slate-200">GIS Coordinates & Region</span>
              <span className="font-mono text-[10px] text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {sighting.region}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">LATITUDE</span>
                <span className="text-slate-100 font-bold">{sighting.latitude.toFixed(4)}° N</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">LONGITUDE</span>
                <span className="text-slate-100 font-bold">{sighting.longitude.toFixed(4)}° W</span>
              </div>
            </div>
          </div>

          {/* Behavior & Ecological Observations */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              Observed Behavior & Field Notes
            </h4>
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl leading-relaxed text-slate-300">
              "{sighting.behavior}"
              <p className="mt-2 text-slate-400 text-[11px] font-mono border-t border-slate-800/80 pt-2">
                Field Officer Log: {sighting.notes}
              </p>
            </div>
          </div>

          {/* Biological & Prey Association Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Prey Proximity / Herd</span>
              <span className="text-xs font-semibold text-cyan-300">{sighting.preyProximity}</span>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Pelage / Color Variants</span>
              <div className="flex flex-wrap gap-1">
                {sighting.colorVariants.map((color) => (
                  <span
                    key={color}
                    className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-300"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Telemetry & Pups Highlights */}
          {(sighting.collaredWolfId || sighting.pupCount) && (
            <div className="p-3.5 bg-cyan-950/20 border border-cyan-500/30 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="font-semibold text-cyan-200">Active Collar & Breeding Evidence</span>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    {sighting.collaredWolfId && `GPS Collar ID: ${sighting.collaredWolfId} `}
                    {sighting.pupCount && `| Observed Pups: ${sighting.pupCount}`}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            onClick={() => onQueryAiAboutSighting(sighting)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-semibold rounded-xl text-xs transition-colors"
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>Ask AI Assistant About This Pack</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
