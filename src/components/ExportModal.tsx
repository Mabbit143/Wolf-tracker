import React from 'react';
import { WolfSighting } from '../types/wolf';
import { X, FileSpreadsheet, Map, Printer } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sightings: WolfSighting[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, sightings }) => {
  if (!isOpen) return null;

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Sighting_ID',
      'Date',
      'Time',
      'Latitude',
      'Longitude',
      'Location_Name',
      'Region',
      'Pack_Name',
      'Pack_Size',
      'Pack_Status',
      'Observation_Method',
      'Prey_Proximity',
      'Weather_Condition',
      'Observed_Behavior',
      'Collar_ID',
      'Pup_Count',
    ];

    const rows = sightings.map((s) => [
      `"${s.id}"`,
      `"${s.date}"`,
      `"${s.time}"`,
      s.latitude,
      s.longitude,
      `"${s.locationName.replace(/"/g, '""')}"`,
      `"${s.region}"`,
      `"${s.packName.replace(/"/g, '""')}"`,
      s.packSize,
      `"${s.packStatus}"`,
      `"${s.observationMethod}"`,
      `"${s.preyProximity.replace(/"/g, '""')}"`,
      `"${s.weatherCondition.replace(/"/g, '""')}"`,
      `"${s.behavior.replace(/"/g, '""')}"`,
      `"${s.collaredWolfId || ''}"`,
      s.pupCount || 0,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NWT_Wolf_Sightings_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to GeoJSON
  const handleExportGeoJSON = () => {
    const geojson = {
      type: 'FeatureCollection',
      name: 'NWT_Wolf_Sightings',
      crs: {
        type: 'name',
        properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' },
      },
      features: sightings.map((s) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [s.longitude, s.latitude],
        },
        properties: {
          id: s.id,
          date: s.date,
          time: s.time,
          packName: s.packName,
          packSize: s.packSize,
          region: s.region,
          locationName: s.locationName,
          method: s.observationMethod,
          prey: s.preyProximity,
          behavior: s.behavior,
          collaredWolfId: s.collaredWolfId || null,
        },
      })),
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NWT_Wolf_Sightings_${new Date().toISOString().slice(0, 10)}.geojson`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Export GIS Research Data</h3>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Export {sightings.length} active filtered wolf sightings
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          <button
            onClick={handleExportCSV}
            className="w-full flex items-center gap-3 p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-xs text-slate-100 block">CSV Spreadsheet (.csv)</span>
              <span className="text-[10px] text-slate-400">Excel / R / Python data analysis format</span>
            </div>
          </button>

          <button
            onClick={handleExportGeoJSON}
            className="w-full flex items-center gap-3 p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-xs text-slate-100 block">GeoJSON Format (.geojson)</span>
              <span className="text-[10px] text-slate-400">Compatible with QGIS, ArcGIS & Google Earth</span>
            </div>
          </button>

          <button
            onClick={handlePrintSummary}
            className="w-full flex items-center gap-3 p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-xs text-slate-100 block">Print Research Dossier / PDF</span>
              <span className="text-[10px] text-slate-400">Print or save clean PDF summary of current view</span>
            </div>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
