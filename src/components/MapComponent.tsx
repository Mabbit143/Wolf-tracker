import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { WolfSighting, TelemetryTrack, RegionHotspot } from '../types/wolf';
import { NWT_REGIONS } from '../data/nwtWolfData';
import { Layers, Eye, Navigation, LocateFixed } from 'lucide-react';

interface MapComponentProps {
  sightings: WolfSighting[];
  telemetryTracks: TelemetryTrack[];
  selectedSighting: WolfSighting | null;
  onSelectSighting: (sighting: WolfSighting) => void;
  selectedRegion: RegionHotspot | null;
  onSelectRegionHotspot: (region: RegionHotspot) => void;
}

type BaseLayerType = 'topo' | 'satellite' | 'dark' | 'street';

export const MapComponent: React.FC<MapComponentProps> = ({
  sightings,
  telemetryTracks,
  selectedSighting,
  onSelectSighting,
  selectedRegion,
  onSelectRegionHotspot,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tracksLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [activeBaseLayer, setActiveBaseLayer] = useState<BaseLayerType>('dark');
  const [showTelemetryTracks, setShowTelemetryTracks] = useState(true);

  // Base tile configurations
  const TILE_URLS: Record<BaseLayerType, { url: string; attribution: string }> = {
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>',
    },
    topo: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'Map data &copy; <a href="https://openstreetmap.org">OSM</a>, SRTM | Map style &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
    },
    street: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    },
  };

  // Initialize Map Instance once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // NWT Center approx (Yellowknife area default)
    const map = L.map(mapContainerRef.current, {
      center: [64.00, -120.00],
      zoom: 5,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    const initialTileConfig = TILE_URLS[activeBaseLayer];
    const initialTileLayer = L.tileLayer(initialTileConfig.url, {
      attribution: initialTileConfig.attribution,
      maxZoom: 17,
      minZoom: 3,
    }).addTo(map);

    tileLayerRef.current = initialTileLayer;

    // Create Layer Groups
    markersLayerRef.current = L.layerGroup().addTo(map);
    tracksLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Base Layer Changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const config = TILE_URLS[activeBaseLayer];
    const newTileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: 17,
      minZoom: 3,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTileLayer;
  }, [activeBaseLayer]);

  // Update Telemetry Polyline Tracks Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !tracksLayerRef.current) return;

    tracksLayerRef.current.clearLayers();

    if (showTelemetryTracks) {
      telemetryTracks.forEach((track) => {
        const latLngs = track.points.map((p) => [p.latitude, p.longitude] as [number, number]);

        // Draw Polyline
        const polyline = L.polyline(latLngs, {
          color: track.color,
          weight: 3,
          opacity: 0.8,
          dashArray: '6, 8',
        });

        polyline.bindTooltip(
          `<div class="font-sans text-xs">
            <span class="font-bold text-cyan-300">${track.packName}</span>
            <div class="text-[10px] text-slate-300 font-mono">${track.description}</div>
          </div>`,
          { sticky: true, className: 'leaflet-tooltip-dark' }
        );

        tracksLayerRef.current?.addLayer(polyline);

        // Add waypoint small dots along track
        track.points.forEach((pt, idx) => {
          const waypointMarker = L.circleMarker([pt.latitude, pt.longitude], {
            radius: idx === track.points.length - 1 ? 5 : 3,
            color: track.color,
            fillColor: '#0f172a',
            fillOpacity: 1,
            weight: 2,
          });

          waypointMarker.bindPopup(
            `<div class="p-3 bg-slate-900 text-slate-100 text-xs">
              <div class="text-xs font-bold text-cyan-400">${track.packName}</div>
              <div class="text-[10px] font-mono text-slate-400">Telemetry Waypoint #${idx + 1}</div>
              <div class="text-[11px] mt-1 font-mono">${pt.timestamp}</div>
              <div class="text-[10px] font-mono text-slate-400">${pt.latitude.toFixed(3)}°N, ${pt.longitude.toFixed(3)}°W</div>
            </div>`
          );

          tracksLayerRef.current?.addLayer(waypointMarker);
        });
      });
    }
  }, [telemetryTracks, showTelemetryTracks]);

  // Update Markers when Sightings list changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    sightings.forEach((s) => {
      // Determine color theme based on pack size
      let badgeBg = 'bg-amber-500';
      let badgeBorder = 'border-amber-300';
      let shadowGlow = 'shadow-amber-500/30';
      let textColor = 'text-slate-950';

      if (s.packSize === 1) {
        badgeBg = 'bg-slate-800';
        badgeBorder = 'border-amber-400';
        textColor = 'text-amber-300';
      } else if (s.packSize <= 5) {
        badgeBg = 'bg-cyan-500';
        badgeBorder = 'border-cyan-200';
        shadowGlow = 'shadow-cyan-500/40';
      } else if (s.packSize <= 10) {
        badgeBg = 'bg-emerald-500';
        badgeBorder = 'border-emerald-200';
        shadowGlow = 'shadow-emerald-500/40';
      } else {
        badgeBg = 'bg-purple-600';
        badgeBorder = 'border-purple-200';
        shadowGlow = 'shadow-purple-500/50';
      }

      const isSelected = selectedSighting?.id === s.id;

      // Custom HTML Icon
      const iconHtml = `
        <div class="relative group cursor-pointer flex items-center justify-center">
          ${
            s.packSize >= 12
              ? `<div class="absolute -inset-1.5 rounded-full ${badgeBg} opacity-40 radar-pulse"></div>`
              : ''
          }
          <div class="relative flex items-center justify-center w-7 h-7 rounded-full ${badgeBg} ${badgeBorder} border-2 text-[11px] font-mono font-extrabold ${textColor} shadow-md ${shadowGlow} transition-transform hover:scale-125 ${
        isSelected ? 'scale-125 ring-4 ring-cyan-400 ring-offset-2 ring-offset-slate-950' : ''
      }">
            ${s.packSize}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-wolf-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([s.latitude, s.longitude], { icon: customIcon });

      // Rich Leaflet Popup
      const popupHtml = `
        <div class="w-64 p-3 bg-slate-900 text-slate-100 rounded-xl font-sans text-xs">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span class="font-bold text-slate-100 truncate pr-2">${s.packName}</span>
            <span class="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 whitespace-nowrap">
              ${s.packSize} Wolves
            </span>
          </div>

          <div class="space-y-1 text-slate-300 text-[11px] mb-3">
            <div class="flex justify-between font-mono text-[10px]">
              <span class="text-slate-400">Date:</span>
              <span class="text-cyan-300">${s.date} (${s.time})</span>
            </div>
            <div class="flex justify-between font-mono text-[10px]">
              <span class="text-slate-400">Region:</span>
              <span class="text-slate-200">${s.region}</span>
            </div>
            <div class="text-slate-300 line-clamp-2 mt-1 italic">
              "${s.behavior}"
            </div>
          </div>

          <button id="btn-view-dossier-${s.id}" class="w-full py-1.5 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-center text-xs transition-colors shadow-sm">
            Inspect Research Dossier
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-view-dossier-${s.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectSighting(s);
          };
        }
      });

      marker.on('click', () => {
        onSelectSighting(s);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [sightings, selectedSighting]);

  // Center map when selectedSighting or selectedRegion changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (selectedSighting) {
      mapInstanceRef.current.flyTo([selectedSighting.latitude, selectedSighting.longitude], 10, {
        duration: 1.2,
      });
    }
  }, [selectedSighting]);

  const handleRegionClick = (region: RegionHotspot) => {
    onSelectRegionHotspot(region);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([region.centerLat, region.centerLng], region.defaultZoom, {
        duration: 1.5,
      });
    }
  };

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([64.00, -120.00], 5, { duration: 1.2 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-950 overflow-hidden flex flex-col">
      {/* Leaflet Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-0" />

      {/* Top Map Layer & Telemetry Floating Bar */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl text-xs">
        {/* Base Layer Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <Layers className="w-3.5 h-3.5 text-cyan-400 ml-1.5 shrink-0" />
          <button
            onClick={() => setActiveBaseLayer('dark')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              activeBaseLayer === 'dark' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Dark GIS
          </button>
          <button
            onClick={() => setActiveBaseLayer('topo')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              activeBaseLayer === 'topo' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Topographic
          </button>
          <button
            onClick={() => setActiveBaseLayer('satellite')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              activeBaseLayer === 'satellite' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Telemetry Polylines Toggle */}
        <button
          onClick={() => setShowTelemetryTracks(!showTelemetryTracks)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-colors ${
            showTelemetryTracks
              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Telemetry Corridors ({telemetryTracks.length})</span>
        </button>

        <button
          onClick={handleResetView}
          className="p-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
          title="Reset NWT View"
        >
          <LocateFixed className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Region Hotspot Fly-To Strip */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between gap-2 overflow-x-auto p-2 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl scrollbar-none">
        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 shrink-0 px-2">
          <Navigation className="w-3.5 h-3.5 text-cyan-400" />
          <span>Fly-To NWT Region:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto shrink-0">
          {NWT_REGIONS.map((reg) => {
            const isSelected = selectedRegion?.name === reg.name;
            return (
              <button
                key={reg.name}
                onClick={() => handleRegionClick(reg)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-sm'
                    : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                {reg.name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
