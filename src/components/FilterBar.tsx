import React, { useState } from 'react';
import { Filter, Search, RotateCcw, Calendar, Users, SlidersHorizontal, ChevronDown, ChevronUp, Radio } from 'lucide-react';
import { FilterState, RegionName, ObservationMethod } from '../types/wolf';
import { NWT_REGIONS } from '../data/nwtWolfData';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalCount: number;
  filteredCount: number;
  availablePacks: string[];
  onResetFilters: () => void;
}

const OBSERVATION_METHODS: ObservationMethod[] = [
  'Collar GPS Telemetry',
  'Field Camera Trap',
  'Aerial Wildlife Survey',
  'Community & Elders Report',
  'Wildlife Officer Patrol',
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  totalCount,
  filteredCount,
  availablePacks,
  onResetFilters,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFiltersCount =
    (filters.startDate ? 1 : 0) +
    (filters.endDate ? 1 : 0) +
    (filters.minPackSize > 1 ? 1 : 0) +
    (filters.maxPackSize < 25 ? 1 : 0) +
    (filters.selectedRegions.length > 0 ? 1 : 0) +
    (filters.selectedPacks.length > 0 ? 1 : 0) +
    (filters.selectedMethods.length > 0 ? 1 : 0) +
    (filters.searchQuery ? 1 : 0) +
    (filters.hasCollaredOnly ? 1 : 0) +
    (filters.hasPupsOnly ? 1 : 0);

  const handlePresetDate = (preset: 'all' | '2026' | '2025' | 'winter') => {
    if (preset === 'all') {
      setFilters((prev) => ({ ...prev, startDate: '', endDate: '' }));
    } else if (preset === '2026') {
      setFilters((prev) => ({ ...prev, startDate: '2026-01-01', endDate: '2026-12-31' }));
    } else if (preset === '2025') {
      setFilters((prev) => ({ ...prev, startDate: '2025-01-01', endDate: '2025-12-31' }));
    } else if (preset === 'winter') {
      setFilters((prev) => ({ ...prev, startDate: '2025-11-01', endDate: '2026-04-30' }));
    }
  };

  const handleRegionToggle = (region: RegionName) => {
    setFilters((prev) => {
      const exists = prev.selectedRegions.includes(region);
      return {
        ...prev,
        selectedRegions: exists
          ? prev.selectedRegions.filter((r) => r !== region)
          : [...prev.selectedRegions, region],
      };
    });
  };

  const handleMethodToggle = (method: ObservationMethod) => {
    setFilters((prev) => {
      const exists = prev.selectedMethods.includes(method);
      return {
        ...prev,
        selectedMethods: exists
          ? prev.selectedMethods.filter((m) => m !== method)
          : [...prev.selectedMethods, method],
      };
    });
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 p-4 text-slate-200">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Main Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Search & Primary Quick Controls */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search pack name, location, prey or behavior..."
                value={filters.searchQuery}
                onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Pack Size Quick Range Slider */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg text-xs">
              <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-slate-400 font-mono text-[11px] whitespace-nowrap">Pack Size:</span>
              <div className="flex items-center gap-1.5 font-mono text-cyan-300 font-semibold">
                <span>{filters.minPackSize}</span>
                <span className="text-slate-500">-</span>
                <span>{filters.maxPackSize === 25 ? '20+' : filters.maxPackSize}</span>
              </div>
              <input
                type="range"
                min={1}
                max={25}
                value={filters.minPackSize}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    minPackSize: Math.min(Number(e.target.value), prev.maxPackSize),
                  }))
                }
                className="w-16 accent-cyan-400 cursor-pointer"
                title="Minimum pack size"
              />
              <input
                type="range"
                min={1}
                max={25}
                value={filters.maxPackSize}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    maxPackSize: Math.max(Number(e.target.value), prev.minPackSize),
                  }))
                }
                className="w-16 accent-cyan-400 cursor-pointer"
                title="Maximum pack size"
              />
            </div>

            {/* Region Dropdown */}
            <select
              value={filters.selectedRegions[0] || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  selectedRegions: e.target.value ? [e.target.value as RegionName] : [],
                }))
              }
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="">All NWT Regions</option>
              {NWT_REGIONS.map((reg) => (
                <option key={reg.name} value={reg.name}>
                  {reg.name}
                </option>
              ))}
            </select>

            {/* Pack Name Selector */}
            <select
              value={filters.selectedPacks[0] || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  selectedPacks: e.target.value ? [e.target.value] : [],
                }))
              }
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer max-w-[180px] truncate"
            >
              <option value="">All Known Packs</option>
              {availablePacks.map((pack) => (
                <option key={pack} value={pack}>
                  {pack}
                </option>
              ))}
            </select>
          </div>

          {/* Right: Counter, Toggle Advanced, Reset */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Filtered Sightings Count Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs">
              <span className="text-slate-400">Showing:</span>
              <span className="font-bold text-cyan-300">{filteredCount}</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">{totalCount}</span>
            </div>

            {/* Advanced Filters Drawer Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                isExpanded || activeFiltersCount > 0
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter Options</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Reset Button */}
            {activeFiltersCount > 0 && (
              <button
                onClick={onResetFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Expanded Filter Panel */}
        {isExpanded && (
          <div className="mt-2 pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
            {/* Column 1: Date Filters */}
            <div className="flex flex-col gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-300 font-semibold mb-0.5">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  Date Range
                </span>
                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    onClick={() => handlePresetDate('all')}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    All
                  </button>
                  <button
                    onClick={() => handlePresetDate('2026')}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    2026
                  </button>
                  <button
                    onClick={() => handlePresetDate('winter')}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Winter
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-mono block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-mono block mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Column 2: Observation Method Filter */}
            <div className="flex flex-col gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5 mb-0.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                Observation Method
              </span>

              <div className="flex flex-wrap gap-1.5">
                {OBSERVATION_METHODS.map((method) => {
                  const active = filters.selectedMethods.includes(method);
                  return (
                    <button
                      key={method}
                      onClick={() => handleMethodToggle(method)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors border ${
                        active
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-medium'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {method}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Column 3: Special Attribute Toggles */}
            <div className="flex flex-col gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 justify-between">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                Research Criteria Toggles
              </span>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={filters.hasCollaredOnly}
                    onChange={(e) => setFilters((prev) => ({ ...prev, hasCollaredOnly: e.target.checked }))}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span>GPS Telemetry Collared Wolves Only</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={filters.hasPupsOnly}
                    onChange={(e) => setFilters((prev) => ({ ...prev, hasPupsOnly: e.target.checked }))}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Sightings with Pups / Juvenile Observations</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
