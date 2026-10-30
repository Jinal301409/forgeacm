import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  Camera,
  MapPin,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';

export const CivicReportPage: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const paramLat = searchParams.get('lat');
  const paramLng = searchParams.get('lng');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<any>('Potholes');
  const [location, setLocation] = useState(
    paramLat && paramLng
      ? `Geo-Pinned Location (${Number(paramLat).toFixed(4)}, ${Number(paramLng).toFixed(4)})`
      : 'Navrangpura Bus Junction, Ahmedabad, Gujarat'
  );
  const [address, setAddress] = useState(
    paramLat && paramLng
      ? `Coordinates: ${paramLat}, ${paramLng}`
      : 'Near Commerce Six Roads, Navrangpura, Ahmedabad'
  );
  const [latitude, setLatitude] = useState<number>(paramLat ? parseFloat(paramLat) : 23.0372);
  const [longitude, setLongitude] = useState<number>(paramLng ? parseFloat(paramLng) : 72.5532);
  const [imagePreview, setImagePreview] = useState<string>(
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
  );
  const [imageBase64, setImageBase64] = useState<string>('');
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [aiPreview, setAiPreview] = useState<any>(null);

  const categories = [
    'Potholes',
    'Damaged Roads',
    'Broken Streetlights',
    'Water Leakage',
    'Garbage Accumulation',
    'Drainage Problems',
    'Public Sanitation',
    'Pollution',
    'Damaged Infrastructure',
    'Other',
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocation(`Pinned Coordinates (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        // Safe default fallback
        setLatitude(23.0225);
        setLongitude(72.5714);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !description || !location) {
      setError('Please provide issue title, description, and location.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          title,
          description,
          category,
          location,
          address,
          latitude,
          longitude,
          imageBase64: imageBase64 || imagePreview,
          imageMimeType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit report.');
      }

      // Success: redirect to tracking page for this report
      navigate(`/reports/${data.report.reportId}`);
    } catch (err: any) {
      setError(err.message || 'Error communicating with server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <div className="pb-4 border-b border-white/[0.08]">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-orange-400">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>MUNICIPAL INFRASTRUCTURE REPORTING</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Report a Civic Grievance
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Upload photo evidence and location. Gemini Multimodal AI will assess severity and route to the authorized department.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Inputs (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.1] space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Grievance Headline / Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hazardous Road Cavities Near Bus Stop"
              className="w-full bg-[#11182B] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#477BFF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Issue Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#11182B] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#477BFF]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Location Area / Landmark *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Navrangpura Bus Bay"
                className="w-full bg-[#11182B] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#477BFF]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Full Postal Address / Nearby Junction</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street name, landmark, ward number"
              className="w-full bg-[#11182B] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#477BFF]"
            />
          </div>

          {/* GPS Coordinates & Geolocation button */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#38D9E6]" />
                GPS Coordinates
              </span>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="text-xs font-medium text-[#38D9E6] hover:underline flex items-center gap-1"
              >
                <Navigation className="w-3 h-3" />
                <span>Use Current Location</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="w-full bg-[#11182B] border border-white/[0.1] rounded-lg px-3 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="w-full bg-[#11182B] border border-white/[0.1] rounded-lg px-3 py-1.5 text-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Detailed Situation Description *</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the severity, depth, pedestrian hazard, or duration of the issue..."
              className="w-full bg-[#11182B] border border-white/[0.1] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#477BFF]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#477BFF] to-[#386df0] hover:from-[#3a6ee8] hover:to-[#2e5fd4] shadow-xl shadow-[#477BFF]/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Gemini Multimodal Triage in Progress...
              </span>
            ) : (
              <span>Submit Grievance to Municipal Desk</span>
            )}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Column: Photo Evidence & AI Triage Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Photo Evidence Box */}
          <div className="glass-panel p-6 rounded-3xl border border-white/[0.1] space-y-4">
            <span className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#38D9E6]" />
              Photographic Evidence
            </span>

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#11182B] border border-white/[0.1] group">
              <img
                src={imagePreview}
                alt="Civic issue evidence"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <label className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#477BFF] hover:bg-[#386df0] cursor-pointer shadow-lg">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <label className="w-full py-2.5 rounded-xl border border-dashed border-white/[0.2] hover:border-[#38D9E6] text-slate-300 hover:text-white text-xs flex items-center justify-center gap-2 cursor-pointer transition-all">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New Photo from Device</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* AI Assessment Protocol Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#121B38] to-[#0E1528] border border-white/[0.08] space-y-3 text-xs">
            <div className="flex items-center gap-2 text-[#38D9E6] font-mono font-semibold">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI Triage Protocol</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Upon submission, Gemini 3.8 Flash automatically executes visual feature extraction on your uploaded photo and text to estimate severity, identify responsible ward engineers, and guarantee Citizen Charter SLA compliance.
            </p>
            <div className="pt-2 border-t border-white/[0.06] text-[11px] text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Severity is an AI-assisted operational recommendation, not an emergency 112 classification.</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
