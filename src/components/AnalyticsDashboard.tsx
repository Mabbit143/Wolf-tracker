import React from 'react';
import { WolfSighting } from '../types/wolf';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Users, Eye, Radio, Sparkles, MapPin, TrendingUp, ShieldCheck } from 'lucide-react';

interface AnalyticsDashboardProps {
  sightings: WolfSighting[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ sightings }) => {
  const totalSightings = sightings.length;
  const totalWolvesCount = sightings.reduce((acc, curr) => acc + curr.packSize, 0);
  const avgPackSize = totalSightings > 0 ? (totalWolvesCount / totalSightings).toFixed(1) : '0';
  const collaredCount = sightings.filter((s) => s.collaredWolfId || s.observationMethod === 'Collar GPS Telemetry').length;
  const pupSightingsCount = sightings.filter((s) => s.pupCount && s.pupCount > 0).length;

  // 1. Pack Size Histogram Data
  const packSizeRanges = [
    { label: 'Solitary (1)', min: 1, max: 1, count: 0 },
    { label: 'Pair (2)', min: 2, max: 2, count: 0 },
    { label: 'Small (3-5)', min: 3, max: 5, count: 0 },
    { label: 'Medium (6-9)', min: 6, max: 9, count: 0 },
    { label: 'Large (10-13)', min: 10, max: 13, count: 0 },
    { label: 'Mega (14+)', min: 14, max: 100, count: 0 },
  ];

  sightings.forEach((s) => {
    const range = packSizeRanges.find((r) => s.packSize >= r.min && s.packSize <= r.max);
    if (range) range.count++;
  });

  // 2. Region Breakdown Data
  const regionCounts: Record<string, number> = {};
  sightings.forEach((s) => {
    const rName = s.region.split(' ')[0]; // short name
    regionCounts[rName] = (regionCounts[rName] || 0) + 1;
  });

  const regionChartData = Object.entries(regionCounts).map(([region, count]) => ({
    region,
    sightings: count,
  }));

  // 3. Observation Method Pie Data
  const methodCounts: Record<string, number> = {};
  sightings.forEach((s) => {
    methodCounts[s.observationMethod] = (methodCounts[s.observationMethod] || 0) + 1;
  });

  const methodColors = ['#06b6d4', '#10b981', '#f59e0b', '#a855f7', '#ec4899'];
  const methodChartData = Object.entries(methodCounts).map(([method, count], idx) => ({
    name: method.replace('Community & Elders Report', 'Community').replace('Collar GPS Telemetry', 'Telemetry'),
    value: count,
    color: methodColors[idx % methodColors.length],
  }));

  // 4. Monthly Timeline Data
  const monthCounts: Record<string, number> = {};
  sightings.forEach((s) => {
    const monthKey = s.date.slice(0, 7); // YYYY-MM
    monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
  });

  const timelineChartData = Object.entries(monthCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({
      month,
      observations: count,
    }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            NWT Wolf Population & GIS Research Analytics
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              Active Filtered Set
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Empirical telemetry patterns, pack size distribution, and ecological survey metrics across Northwest Territories.
          </p>
        </div>
      </div>

      {/* KPI Metric Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            Total Sightings
          </span>
          <div className="mt-2 flex items-baseline gap-1 font-mono">
            <span className="text-2xl font-extrabold text-slate-100">{totalSightings}</span>
            <span className="text-xs text-slate-400 font-sans">records</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            Wolves Counted
          </span>
          <div className="mt-2 flex items-baseline gap-1 font-mono">
            <span className="text-2xl font-extrabold text-cyan-300">{totalWolvesCount}</span>
            <span className="text-xs text-slate-400 font-sans">individuals</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            Average Pack Size
          </span>
          <div className="mt-2 flex items-baseline gap-1 font-mono">
            <span className="text-2xl font-extrabold text-emerald-400">{avgPackSize}</span>
            <span className="text-xs text-slate-400 font-sans">wolves/pack</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            Monitored Collar GPS
          </span>
          <div className="mt-2 flex items-baseline gap-1 font-mono">
            <span className="text-2xl font-extrabold text-amber-300">{collaredCount}</span>
            <span className="text-xs text-slate-400 font-sans">telemetry IDs</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between col-span-2 md:col-span-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Pup Breeding Records
          </span>
          <div className="mt-2 flex items-baseline gap-1 font-mono">
            <span className="text-2xl font-extrabold text-purple-300">{pupSightingsCount}</span>
            <span className="text-xs text-slate-400 font-sans">sightings</span>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Pack Size Distribution Histogram */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Pack Size Distribution Histogram
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Frequency of solitary wolves vs medium and mega-packs in NWT
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={packSizeRanges} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={0} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc', fontSize: '12px' }}
                  cursor={{ fill: 'rgba(51, 65, 85, 0.4)' }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Regional Hotspot Comparison */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                Regional Sightings Hotspots
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Observation volume by NWT administrative & ecological zones
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionChartData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis dataKey="region" type="category" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc', fontSize: '12px' }}
                />
                <Bar dataKey="sightings" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Seasonality & Monthly Observation Timeline */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Seasonality & Monthly Timeline
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Temporal distribution of wolf sightings across calendar months
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="observations" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Observation Method Distribution */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Data Source & Observation Method
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Breakdown of Collar GPS, Field Cameras, Aerial Surveys & Elders Reports
              </p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={methodChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {methodChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
