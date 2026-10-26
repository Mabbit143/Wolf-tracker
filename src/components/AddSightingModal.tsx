import React, { useState } from 'react';
import { WolfSighting, RegionName, ObservationMethod } from '../types/wolf';
import { NWT_REGIONS } from '../data/nwtWolfData';
import { X, Plus, MapPin, Users, Calendar, ShieldCheck } from 'lucide-react';

interface AddSightingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSighting: (sighting: WolfSighting) => void;
}

export const AddSightingModal: React.FC<AddSightingModalProps> = ({ isOpen, onClose, onAddSighting }) => {
  if (!isOpen) return null;

  const [packName, setPackName] = useState('Mackenzie Valley Pack');
  const [date, setDate] = useState('2026-03-22');
  const [time, setTime] = useState('11:00 MST');
  const [region, setRegion] = useState<RegionName>('North Slave (Yellowknife)');
  const [locationName, setLocationName] = useState('Yellowknife River Bridge corridor');
  const [latitude, setLatitude] = useState('62.512');
  const [longitude, setLongitude] = useState('-114.320');
  const [packSize, setPackSize] = useState(6);
  const [observationMethod, setObservationMethod] = useState<ObservationMethod>('Field Camera Trap');
  const [preyProximity, setPreyProximity] = useState('Woodland Caribou trail');
  const [weatherCondition, setWeatherCondition] = useState('-16°C, Clear sky, crisp snow');
  const [behavior, setBehavior] = useState('Pack traveling along river ice corridor in single file.');
  const [notes, setNotes] = useState('Verified field officer observation log.');
  const [collaredWolfId, setCollaredWolfId] = useState('');
  const [pupCount, setPupCount] = useState<number | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newSighting: WolfSighting = {
      id: `NWT-WOLF-${Date.now().toString().slice(-6)}`,
      date,
      time,
      latitude: parseFloat(latitude) || 62.45,
      longitude: parseFloat(longitude) || -114.37,
      locationName,
      region,
      packSize,
      packName,
      packStatus: packSize > 2 ? 'Active Pack' : packSize === 2 ? 'Breeding Pair' : 'Solitary Lone Wolf',
      observationMethod,
      colorVariants: ['Classic Grey / Buff'],
      preyProximity,
      weatherCondition,
      behavior,
      notes,
      collaredWolfId: collaredWolfId.trim() || undefined,
      pupCount: pupCount && pupCount > 0 ? pupCount : undefined,
      temperatureCelsius: -16,
    };

    onAddSighting(newSighting);
    onClose();
  };

  const handleQuickRegionLocation = (regName: RegionName) => {
    setRegion(regName);
    const reg = NWT_REGIONS.find((r) => r.name === regName);
    if (reg) {
      setLatitude(reg.centerLat.toString());
      setLongitude(reg.centerLng.toString());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Report New Wolf Sighting</h3>
              <p className="text-[11px] text-slate-400">Submit new field observation or telemetry data point</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs text-slate-200">
          {/* Row 1: Pack Name & Size */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Pack Name / ID</label>
              <input
                type="text"
                required
                value={packName}
                onChange={(e) => setPackName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
                <Users className="w-3 h-3 text-cyan-400" />
                Pack Size ({packSize})
              </label>
              <input
                type="number"
                min={1}
                max={30}
                required
                value={packSize}
                onChange={(e) => setPackSize(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Row 2: Date, Time & Region */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-cyan-400" />
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Region</label>
              <select
                value={region}
                onChange={(e) => handleQuickRegionLocation(e.target.value as RegionName)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                {NWT_REGIONS.map((r) => (
                  <option key={r.name} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Location Name & Lat/Lng */}
          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" />
                Location Description
              </label>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Latitude (°N)</label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Longitude (°W)</label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Method & Prey */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                Observation Method
              </label>
              <select
                value={observationMethod}
                onChange={(e) => setObservationMethod(e.target.value as ObservationMethod)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="Collar GPS Telemetry">Collar GPS Telemetry</option>
                <option value="Field Camera Trap">Field Camera Trap</option>
                <option value="Aerial Wildlife Survey">Aerial Wildlife Survey</option>
                <option value="Community & Elders Report">Community & Elders Report</option>
                <option value="Wildlife Officer Patrol">Wildlife Officer Patrol</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Prey Proximity / Herd</label>
              <input
                type="text"
                value={preyProximity}
                onChange={(e) => setPreyProximity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Behavior & Notes */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Observed Behavior Summary</label>
            <textarea
              rows={2}
              required
              value={behavior}
              onChange={(e) => setBehavior(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl shadow-md transition-all"
            >
              Save Sighting Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
