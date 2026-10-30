import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Filter,
  AlertCircle,
  Plus,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import L from 'leaflet';
import { CivicReport } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const CivicMapPage: React.FC = () => {
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeReport, setActiveReport] = useState<CivicReport | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const navigate = useNavigate();

  const categories = [
    'All',
    'Potholes',
    'Damaged Roads',
    'Broken Streetlights',
    'Water Leakage',
    'Garbage Accumulation',
    'Drainage Problems',
    'Public Sanitation',
    'Damaged Infrastructure',
  ];

  const severities = ['All', 'Critical', 'High', 'Medium', 'Low'];

  useEffect(() => {
    fetch('/api/reports')
      .then((r) => r.json())
      .then((d) => {
        setReports(d.reports || []);
      })
      .catch((err) => console.error('Failed to load map reports:', err));
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Ahmedabad / default coordinate
    const map = L.map(mapContainerRef.current, {
      center: [23.0372, 72.5532],
      zoom: 13,
      zoomControl: true,
    });

    // Dark styled OpenStreetMap CartoDB tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Click on map to report new issue at clicked location
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      if (confirm(`Would you like to report a civic issue at coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})?`)) {
        navigate(`/reports/new?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}`);
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [navigate]);

  // Update markers when reports or filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const filtered = reports.filter((r) => {
      if (categoryFilter !== 'All' && r.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
      if (severityFilter !== 'All' && r.severity.toLowerCase() !== severityFilter.toLowerCase()) return false;
      if (statusFilter !== 'All' && r.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      return true;
    });

    filtered.forEach((r) => {
      const getMarkerColor = () => {
        if (r.status === 'Resolved') return '#10B981'; // Green
        switch (r.severity) {
          case 'Critical':
            return '#EF4444'; // Red
          case 'High':
            return '#F97316'; // Orange
          case 'Medium':
            return '#F59E0B'; // Amber
          case 'Low':
            return '#3B82F6'; // Blue
          default:
            return '#6B7280';
        }
      };

      const color = getMarkerColor();

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="
            background-color: ${color};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: bold;
          ">
            !
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([r.latitude, r.longitude], { icon: customIcon });

      marker.on('click', () => {
        setActiveReport(r);
      });

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #F8FAFC; min-width: 200px;">
          <div style="font-size: 10px; color: #38D9E6; font-weight: bold; margin-bottom: 2px;">${r.reportId} • ${r.category}</div>
          <div style="font-weight: bold; font-size: 13px; margin-bottom: 4px;">${r.title}</div>
          <div style="color: #94A3B8; font-size: 11px; margin-bottom: 6px;">${r.location}</div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: ${color}; font-weight: bold;">${r.severity} Severity</span>
            <a href="/reports/${r.reportId}" style="color: #477BFF; text-decoration: underline; font-weight: bold;">View Details →</a>
          </div>
        </div>
      `);

      markersLayerRef.current?.addLayer(marker);
    });
  }, [reports, categoryFilter, severityFilter, statusFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#8968FF]">
            <MapPin className="w-3.5 h-3.5" />
            <span>OPENSTREETMAP SPATIAL INFRASTRUCTURE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Live Civic Issue Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Visual geocoded map of reported municipal defects. Click anywhere on the map to pin a new grievance.
          </p>
        </div>

        <Link
          to="/reports/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#477BFF] to-[#386df0] rounded-xl shadow-lg shadow-[#477BFF]/25 hover:opacity-95 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Report at My Location</span>
        </Link>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2 bg-[#11182B] border border-white/[0.1] rounded-xl px-3 py-1.5">
          <span className="text-slate-400 font-mono">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent text-white focus:outline-none cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-[#11182B]">
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-[#11182B] border border-white/[0.1] rounded-xl px-3 py-1.5">
          <span className="text-slate-400 font-mono">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-transparent text-white focus:outline-none cursor-pointer"
          >
            {severities.map((s) => (
              <option key={s} value={s} className="bg-[#11182B]">
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 ml-auto text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Critical
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Resolved
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[600px] rounded-3xl overflow-hidden border border-white/[0.1] shadow-2xl">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Selected Report Floating Card (if clicked) */}
        {activeReport && (
          <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:max-w-md z-[500] glass-panel p-5 rounded-2xl border border-white/[0.15] shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white">{activeReport.reportId}</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={activeReport.severity} type="severity" size="sm" />
                <button
                  onClick={() => setActiveReport(null)}
                  className="text-slate-400 hover:text-white text-xs font-mono"
                >
                  ✕
                </button>
              </div>
            </div>

            <h3 className="text-sm font-bold text-white line-clamp-1">{activeReport.title}</h3>
            <p className="text-xs text-slate-300 line-clamp-2">{activeReport.description}</p>

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] text-xs">
              <span className="text-slate-400 truncate max-w-[200px]">{activeReport.location}</span>
              <Link
                to={`/reports/${activeReport.reportId}`}
                className="text-[#38D9E6] hover:underline font-semibold"
              >
                Full Timeline →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
