import { useState, useMemo, useEffect } from 'react';
import { WolfSighting, FilterState, RegionHotspot } from './types/wolf';
import { generateFullDataset, INITIAL_TELEMETRY_TRACKS } from './data/nwtWolfData';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { MapComponent } from './components/MapComponent';
import { SightingCard } from './components/SightingCard';
import { SightingDetailModal } from './components/SightingDetailModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AddSightingModal } from './components/AddSightingModal';
import { AiResearchAssistant } from './components/AiResearchAssistant';
import { ExportModal } from './components/ExportModal';
import { ArrowUpDown, Map, ListFilter, Compass, SearchX } from 'lucide-react';

const STORAGE_KEY = 'nwt_wolf_sightings_data_v2';

const INITIAL_FILTER_STATE: FilterState = {
  startDate: '',
  endDate: '',
  minPackSize: 1,
  maxPackSize: 25,
  selectedPacks: [],
  selectedRegions: [],
  selectedMethods: [],
  searchQuery: '',
  hasCollaredOnly: false,
  hasPupsOnly: false,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'analytics' | 'ai'>('map');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);

  // Load dataset
  const [sightings, setSightings] = useState<WolfSighting[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load local storage wolf dataset', e);
    }
    return generateFullDataset();
  });

  const [telemetryTracks] = useState(INITIAL_TELEMETRY_TRACKS);

  // Modal & Selection States
  const [selectedSighting, setSelectedSighting] = useState<WolfSighting | null>(null);
  const [detailModalSighting, setDetailModalSighting] = useState<WolfSighting | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionHotspot | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [aiInitialQuery, setAiInitialQuery] = useState<string | undefined>(undefined);

  const [sortOrder, setSortOrder] = useState<'date-desc' | 'date-asc' | 'pack-desc'>('date-desc');
  const [showMobileList, setShowMobileList] = useState(false);

  // Save to LocalStorage on sighting updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sightings));
    } catch (e) {
      console.error('Failed to save wolf dataset to local storage', e);
    }
  }, [sightings]);

  // Unique Pack Names for Filter Dropdown
  const availablePacks = useMemo(() => {
    const packSet = new Set<string>();
    sightings.forEach((s) => {
      if (s.packName) packSet.add(s.packName);
    });
    return Array.from(packSet).sort();
  }, [sightings]);

  // Compute Filtered Sightings
  const filteredSightings = useMemo(() => {
    return sightings.filter((s) => {
      // Date Range
      if (filters.startDate && s.date < filters.startDate) return false;
      if (filters.endDate && s.date > filters.endDate) return false;

      // Pack Size
      if (s.packSize < filters.minPackSize) return false;
      if (filters.maxPackSize < 25 && s.packSize > filters.maxPackSize) return false;

      // Selected Region
      if (filters.selectedRegions.length > 0 && !filters.selectedRegions.includes(s.region)) {
        return false;
      }

      // Selected Pack
      if (filters.selectedPacks.length > 0 && !filters.selectedPacks.includes(s.packName)) {
        return false;
      }

      // Observation Method
      if (filters.selectedMethods.length > 0 && !filters.selectedMethods.includes(s.observationMethod)) {
        return false;
      }

      // Toggles
      if (filters.hasCollaredOnly && !s.collaredWolfId && s.observationMethod !== 'Collar GPS Telemetry') {
        return false;
      }

      if (filters.hasPupsOnly && (!s.pupCount || s.pupCount <= 0)) {
        return false;
      }

      // Text Search Query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchName = s.packName.toLowerCase().includes(query);
        const matchLocation = s.locationName.toLowerCase().includes(query);
        const matchRegion = s.region.toLowerCase().includes(query);
        const matchPrey = s.preyProximity.toLowerCase().includes(query);
        const matchBehavior = s.behavior.toLowerCase().includes(query);
        const matchNotes = s.notes.toLowerCase().includes(query);

        if (!matchName && !matchLocation && !matchRegion && !matchPrey && !matchBehavior && !matchNotes) {
          return false;
        }
      }

      return true;
    });
  }, [sightings, filters]);

  // Sorted Filtered Sightings
  const sortedSightings = useMemo(() => {
    return [...filteredSightings].sort((a, b) => {
      if (sortOrder === 'date-desc') {
        return b.date.localeCompare(a.date);
      } else if (sortOrder === 'date-asc') {
        return a.date.localeCompare(b.date);
      } else {
        return b.packSize - a.packSize;
      }
    });
  }, [filteredSightings, sortOrder]);

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTER_STATE);
  };

  const handleAddSighting = (newSighting: WolfSighting) => {
    setSightings((prev) => [newSighting, ...prev]);
    setSelectedSighting(newSighting);
  };

  const handleQueryAiAboutSighting = (sighting: WolfSighting) => {
    setDetailModalSighting(null);
    setActiveTab('ai');
    setAiInitialQuery(
      `Please provide an in-depth ecological analysis of ${sighting.packName} (ID: ${sighting.id}). Sighting recorded ${sighting.date} at ${sighting.locationName} (${sighting.latitude}°N, ${sighting.longitude}°W) with a pack size of ${sighting.packSize} wolves near ${sighting.preyProximity}. Behavior noted: "${sighting.behavior}".`
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        sightingsCount={filteredSightings.length}
      />

      {/* Filter Bar (Visible in Map & Analytics Views) */}
      {activeTab !== 'ai' && (
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          totalCount={sightings.length}
          filteredCount={filteredSightings.length}
          availablePacks={availablePacks}
          onResetFilters={handleResetFilters}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === 'map' && (
          <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-120px)] overflow-hidden relative">
            {/* Mobile View Toggle Strip */}
            <div className="lg:hidden flex items-center justify-between p-2 bg-slate-900 border-b border-slate-800 text-xs">
              <button
                onClick={() => setShowMobileList(!showMobileList)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold rounded-lg"
              >
                {showMobileList ? <Map className="w-4 h-4" /> : <ListFilter className="w-4 h-4" />}
                <span>{showMobileList ? 'Switch to Map View' : `View Sightings List (${filteredSightings.length})`}</span>
              </button>
            </div>

            {/* Left Sidebar List of Sightings */}
            <aside
              className={`w-full lg:w-96 xl:w-[420px] bg-slate-900/90 border-r border-slate-800/90 flex flex-col shrink-0 z-20 ${
                showMobileList ? 'block h-full' : 'hidden lg:flex h-full'
              }`}
            >
              {/* Sidebar Header */}
              <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-xs text-slate-100">
                    Filtered Sightings
                  </span>
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-cyan-300 border border-slate-700">
                    {sortedSightings.length} Records
                  </span>
                </div>

                {/* Sort Order Selector */}
                <div className="flex items-center gap-1 text-[11px]">
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="pack-desc">Largest Pack Size</option>
                  </select>
                </div>
              </div>

              {/* Scrollable Sighting Cards List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {sortedSightings.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400 gap-2 my-auto">
                    <SearchX className="w-8 h-8 text-slate-500" />
                    <span className="font-semibold text-xs text-slate-300">No wolf sightings match these filters</span>
                    <p className="text-[11px] text-slate-500 max-w-xs">
                      Try expanding the date range, adjusting min/max pack size sliders, or resetting region filters.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-2 px-3 py-1.5 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs rounded-lg font-medium hover:bg-cyan-500/25 transition-colors"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  sortedSightings.map((sighting) => (
                    <SightingCard
                      key={sighting.id}
                      sighting={sighting}
                      isSelected={selectedSighting?.id === sighting.id}
                      onSelect={(s) => {
                        setSelectedSighting(s);
                        setDetailModalSighting(s);
                      }}
                    />
                  ))
                )}
              </div>
            </aside>

            {/* Right Map Canvas Container */}
            <div className="flex-1 h-full relative z-10">
              <MapComponent
                sightings={filteredSightings}
                telemetryTracks={telemetryTracks}
                selectedSighting={selectedSighting}
                onSelectSighting={(s) => {
                  setSelectedSighting(s);
                  setDetailModalSighting(s);
                }}
                selectedRegion={selectedRegion}
                onSelectRegionHotspot={(r) => setSelectedRegion(r)}
              />
            </div>
          </div>
        )}

        {/* Research Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="flex-1 overflow-y-auto bg-slate-950 pb-12">
            <AnalyticsDashboard sightings={filteredSightings} />
          </div>
        )}

        {/* AI Habitat Assistant Tab */}
        {activeTab === 'ai' && (
          <div className="flex-1 overflow-y-auto bg-slate-950">
            <AiResearchAssistant
              filteredSightings={filteredSightings}
              initialQuery={aiInitialQuery}
              onClearInitialQuery={() => setAiInitialQuery(undefined)}
            />
          </div>
        )}
      </main>

      {/* Modal Dossier Detail */}
      <SightingDetailModal
        sighting={detailModalSighting}
        onClose={() => setDetailModalSighting(null)}
        onQueryAiAboutSighting={handleQueryAiAboutSighting}
      />

      {/* Add Sighting Modal */}
      <AddSightingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSighting={handleAddSighting}
      />

      {/* Export GIS Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        sightings={filteredSightings}
      />
    </div>
  );
}
