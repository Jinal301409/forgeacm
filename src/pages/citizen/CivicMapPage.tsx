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
  Navigation,
  Crosshair,
  Eye,
  CheckCircle2,
  Clock,
  Flame,
  Info,
} from 'lucide-react';
import L from 'leaflet';
import { CivicReport } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

type MapTileStyle = 'auto' | 'streets' | 'satellite';

export const CivicMapPage: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [reports, setReports] = useState<CivicReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeReport, setActiveReport] = useState<CivicReport | null>(null);
  const [tileStyle, setTileStyle] = useState<MapTileStyle>('auto');
  const [locatingUser, setLocatingUser] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

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
  const statuses = ['All', 'Submitted', 'Under Review', 'In Progress', 'Resolved'];

  // Fetch civic reports
  useEffect(() => {
    setLoading(true);
    fetch('/api/reports')
      .then((r) => r.json())
      .then((d) => {
        setReports(d.reports || []);
      })
      .catch((err) => console.error('Failed to load map reports:', err))
      .finally(() => setLoading(false));
  }, []);

  // Determine current tile URL based on chosen style and theme
  const getTileUrl = (style: MapTileStyle, currentTheme: string) => {
    if (style === 'satellite') {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }
    if (style === 'streets') {
      return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    }
    // 'auto': Dark Carto in dark mode, Positron Light in light mode
    return currentTheme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Ahmedabad / default coordinate
    const map = L.map(mapContainerRef.current, {
      center: [23.0372, 72.5532],
      zoom: 13,
      zoomControl: false, // We'll add custom positioned zoom control
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    const initialTileUrl = getTileUrl(tileStyle, theme);
    const tileLayer = L.tileLayer(initialTileUrl, {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO / Esri',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Click on map to report new issue at clicked location
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      const willReport = window.confirm(
        `Report civic grievance at coordinates:\nLatitude: ${lat.toFixed(5)}\nLongitude: ${lng.toFixed(5)}\n\nProceed to filing form?`
      );
      if (willReport) {
        navigate(`/reports/new?lat=${lat.toFixed(5)}&lng=${lng.toFixed(5)}`);
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      tileLayerRef.current = null;
      markersLayerRef.current = null;
    };
  }, [navigate]);

  // Update Tile Layer when tileStyle or theme changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const newUrl = getTileUrl(tileStyle, theme);
    tileLayerRef.current.setUrl(newUrl);
  }, [tileStyle, theme]);

  // Locate User GPS
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingUser(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({ lat, lng });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.5 });

          // Add / update pulsating user marker
          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([lat, lng]);
          } else {
            const userIcon = L.divIcon({
              className: 'user-loc-marker',
              html: `
                <div style="position: relative; width: 22px; height: 22px;">
                  <span style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: #38D9E6; opacity: 0.75; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
                  <span style="position: relative; display: block; width: 14px; height: 14px; margin: 4px; border-radius: 50%; background: #477BFF; border: 2.5px solid #FFFFFF; box-shadow: 0 0 10px #477BFF;"></span>
                </div>
              `,
              iconSize: [22, 22],
              iconAnchor: [11, 11],
            });
            userMarkerRef.current = L.marker([lat, lng], { icon: userIcon })
              .addTo(mapInstanceRef.current)
              .bindPopup('<b style="color: #0B1020;">Your Current GPS Location</b>');
          }
        }
      },
      (err) => {
        setLocatingUser(false);
        console.warn('Geolocation failed:', err);
        alert('Could not access your location. Please check browser location permissions.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Render Issue Markers
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
        className: 'civic-marker-icon',
        html: `
          <div style="
            background: radial-gradient(circle at 30% 30%, ${color}, ${color}DD);
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 2px solid #FFFFFF;
            box-shadow: 0 4px 14px rgba(0,0,0,0.4), 0 0 12px ${color}88;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FFFFFF;
            font-size: 11px;
            font-weight: 800;
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            !
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([r.latitude, r.longitude], { icon: customIcon });

      marker.on('click', () => {
        setActiveReport(r);
      });

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; min-width: 210px; padding: 2px;">
          <div style="font-size: 10px; color: #477BFF; font-weight: 700; margin-bottom: 2px; text-transform: uppercase;">
            ${r.reportId} • ${r.category}
          </div>
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px; line-height: 1.3;">
            ${r.title}
          </div>
          <div style="font-size: 11px; opacity: 0.8; margin-bottom: 8px;">
            📍 ${r.location}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(120,120,120,0.2); pt: 4px;">
            <span style="font-weight: 700; color: ${color}; font-size: 11px;">
              ${r.severity} Priority
            </span>
            <a href="/reports/${r.reportId}" style="color: #477BFF; text-decoration: none; font-weight: 700; font-size: 11px;">
              View Details →
            </a>
          </div>
        </div>
      `);

      markersLayerRef.current?.addLayer(marker);
    });
  }, [reports, categoryFilter, severityFilter, statusFilter]);

  // Statistics
  const totalCount = reports.length;
  const criticalCount = reports.filter((r) => r.severity === 'Critical').length;
  const inProgressCount = reports.filter((r) => r.status === 'In Progress' || r.status === 'Under Review').length;
  const resolvedCount = reports.filter((r) => r.status === 'Resolved').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b app-border">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#8968FF] mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>OPENSTREETMAP SPATIAL INFRASTRUCTURE • REAL-TIME MUNICIPAL GIS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold app-text tracking-tight">
            {t('nav.map', 'Civic Map')} — Live Defect Tracking
          </h1>
          <p className="text-xs sm:text-sm app-text-muted mt-1 max-w-2xl">
            Interactive, zero-API-key geocoded public map of civic grievances across the city.
            Click anywhere on the map to pin a new grievance with automatic GPS coordinates.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleLocateMe}
            disabled={locatingUser}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border app-border app-surface app-text hover:bg-slate-500/10 transition-all shadow-sm"
            title="Detect GPS Location"
          >
            <Navigation className={`w-3.5 h-3.5 text-[#38D9E6] ${locatingUser ? 'animate-spin' : ''}`} />
            <span>{locatingUser ? 'Locating...' : 'My Location'}</span>
          </button>

          <Link
            to="/reports/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#477BFF] to-[#386df0] rounded-xl shadow-lg shadow-[#477BFF]/25 hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('btn.fileGrievance', 'Report Civic Issue')}</span>
          </Link>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-3 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-[#477BFF]">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-mono app-text-muted">Total Geo-Pinned</div>
            <div className="text-lg font-extrabold app-text">{totalCount}</div>
          </div>
        </div>

        <div className="glass-card p-3 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-mono app-text-muted">Critical Defects</div>
            <div className="text-lg font-extrabold text-red-500">{criticalCount}</div>
          </div>
        </div>

        <div className="glass-card p-3 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-mono app-text-muted">Active / Pending</div>
            <div className="text-lg font-extrabold text-amber-500">{inProgressCount}</div>
          </div>
        </div>

        <div className="glass-card p-3 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-mono app-text-muted">Verified Resolved</div>
            <div className="text-lg font-extrabold text-emerald-500">{resolvedCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Layer Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-2 glass-panel px-3 py-1.5 rounded-xl border app-border">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="app-text-muted font-mono">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent app-text focus:outline-none cursor-pointer font-medium"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white dark:bg-[#11182B]">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-2 glass-panel px-3 py-1.5 rounded-xl border app-border">
            <span className="app-text-muted font-mono">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent app-text focus:outline-none cursor-pointer font-medium"
            >
              {severities.map((s) => (
                <option key={s} value={s} className="bg-slate-900 text-white dark:bg-[#11182B]">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 glass-panel px-3 py-1.5 rounded-xl border app-border">
            <span className="app-text-muted font-mono">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent app-text focus:outline-none cursor-pointer font-medium"
            >
              {statuses.map((st) => (
                <option key={st} value={st} className="bg-slate-900 text-white dark:bg-[#11182B]">
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Map Layer Switcher */}
        <div className="flex items-center gap-1.5 glass-panel p-1 rounded-xl border app-border">
          <Layers className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          <button
            onClick={() => setTileStyle('auto')}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all ${
              tileStyle === 'auto'
                ? 'bg-[#477BFF] text-white shadow-sm'
                : 'app-text-muted hover:app-text'
            }`}
          >
            Auto {theme === 'dark' ? 'Dark' : 'Light'}
          </button>
          <button
            onClick={() => setTileStyle('streets')}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all ${
              tileStyle === 'streets'
                ? 'bg-[#477BFF] text-white shadow-sm'
                : 'app-text-muted hover:app-text'
            }`}
          >
            Voyager
          </button>
          <button
            onClick={() => setTileStyle('satellite')}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all ${
              tileStyle === 'satellite'
                ? 'bg-[#477BFF] text-white shadow-sm'
                : 'app-text-muted hover:app-text'
            }`}
          >
            Satellite
          </button>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="relative w-full h-[620px] rounded-3xl overflow-hidden border app-border shadow-2xl">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Quick Helper Floating Tip */}
        <div className="absolute top-4 left-4 z-[400] glass-panel px-3 py-1.5 rounded-full border app-border shadow-lg flex items-center gap-2 text-[11px] app-text-muted pointer-events-none">
          <Info className="w-3.5 h-3.5 text-[#38D9E6]" />
          <span>Click anywhere on the map to file an issue at that exact spot</span>
        </div>

        {/* Floating Legend */}
        <div className="absolute top-4 right-14 z-[400] glass-panel px-3 py-1.5 rounded-xl border app-border shadow-lg hidden md:flex items-center gap-3 text-[11px] app-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50" /> Critical
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Low
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" /> Resolved
          </span>
        </div>

        {/* Selected Report Floating Drawer Card */}
        {activeReport && (
          <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:max-w-md z-[500] glass-panel p-5 rounded-2xl border app-border shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#38D9E6]">{activeReport.reportId}</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={activeReport.severity} type="severity" size="sm" />
                <StatusBadge status={activeReport.status} size="sm" />
                <button
                  onClick={() => setActiveReport(null)}
                  className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-500/20 app-text-muted hover:app-text text-xs font-mono ml-1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                {activeReport.category} • Dept: {activeReport.assignedOfficer?.department || activeReport.aiAnalysis?.suggestedDepartment || 'Municipal Works'}
              </div>
              <h3 className="text-sm font-bold app-text line-clamp-1 mt-0.5">{activeReport.title}</h3>
              <p className="text-xs app-text-muted line-clamp-2 mt-1">{activeReport.description}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t app-border text-xs">
              <span className="app-text-muted truncate max-w-[210px]">📍 {activeReport.location}</span>
              <Link
                to={`/reports/${activeReport.reportId}`}
                className="text-[#477BFF] hover:underline font-semibold flex items-center gap-1"
              >
                <span>Live Timeline</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Information Footer Card */}
      <div className="glass-card p-5 rounded-2xl border app-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-[#8968FF] shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold font-mono text-[#8968FF] uppercase">Zero-API-Key Geospatial Architecture</h4>
            <p className="text-xs app-text-muted mt-0.5">
              Powered by OpenStreetMap (OSM) & CARTO vector rasters with client-side Leaflet rendering.
              No Google Maps billing or API key is required. All coordinates link directly to municipal action queues.
            </p>
          </div>
        </div>

        <Link
          to="/transparency"
          className="text-xs font-semibold text-[#477BFF] hover:underline whitespace-nowrap self-start md:self-auto"
        >
          View Public Transparency Metrics →
        </Link>
      </div>
    </div>
  );
};
