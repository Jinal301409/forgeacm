import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Search,
  Upload,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FactCheck } from '../../types';

export const FactVerificationPage: React.FC = () => {
  const { token } = useAuth();
  const [claimText, setClaimText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [currentResult, setCurrentResult] = useState<FactCheck | null>(null);
  const [history, setHistory] = useState<FactCheck[]>([]);

  useEffect(() => {
    fetch('/api/fact-check')
      .then((r) => r.json())
      .then((d) => setHistory(d.factChecks || []))
      .catch((err) => console.error('Failed to load fact checks:', err));
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = reader.result as string;
      setImagePreview(res);
      setImageBase64(res);
    };
    reader.readAsDataURL(file);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimText.trim()) return;

    setError('');
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/fact-check/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          claim: claimText,
          sourceUrl,
          imageBase64: imageBase64 ? imageBase64.replace(/^data:image\/\w+;base64,/, '') : undefined,
          imageMimeType: 'image/jpeg',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify claim.');
      }

      setCurrentResult(data.factCheck);
      setHistory([data.factCheck, ...history]);
      setClaimText('');
      setSourceUrl('');
      setImagePreview('');
      setImageBase64('');
    } catch (err: any) {
      setError(err.message || 'Error communicating with Fact Verification Engine.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="pb-4 border-b border-white/[0.08]">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#8968FF]">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>OBJECTIVE MISINFORMATION AUDIT</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Civic Claim & Policy Verification Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Verify viral WhatsApp claims, policy announcements, and rumors against authorized government gazettes and PIB reports.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Input Form (5 cols) & Verification Result (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Verification Form */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.1] space-y-5">
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Search className="w-4 h-4 text-[#38D9E6]" />
            Submit Claim for AI Audit
          </h2>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Claim Text / Viral Message / News Snippet *
              </label>
              <textarea
                rows={4}
                required
                value={claimText}
                onChange={(e) => setClaimText(e.target.value)}
                placeholder="Paste the viral claim, forwarded WhatsApp message, or news claim..."
                className="w-full bg-[#11182B] border border-white/[0.1] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#477BFF]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Source URL / Social Media Link (Optional)
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://t.me/... or https://x.com/..."
                className="w-full bg-[#11182B] border border-white/[0.1] rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#477BFF]"
              />
            </div>

            {/* Screenshot upload */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">
                Attach Screenshot Evidence (Optional)
              </label>
              {imagePreview ? (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-[#11182B] border border-white/[0.1]">
                  <img src={imagePreview} alt="Screenshot" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setImageBase64('');
                    }}
                    className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white rounded text-[10px]"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="w-full py-3 rounded-xl border border-dashed border-white/[0.2] hover:border-[#38D9E6] text-slate-400 hover:text-white text-xs flex items-center justify-center gap-2 cursor-pointer transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image or Screenshot</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={isAnalyzing || !claimText.trim()}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#477BFF] to-[#386df0] hover:from-[#3a6ee8] hover:to-[#2e5fd4] shadow-lg shadow-[#477BFF]/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-xs"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Cross-referencing Gazette Repositories...
                </span>
              ) : (
                <span>Execute Fact Verification</span>
              )}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick example prompt selector */}
          <div className="pt-3 border-t border-white/[0.08] space-y-2 text-xs">
            <span className="text-slate-400 font-mono text-[11px] block">Test Popular Civic Claims:</span>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setClaimText('Govt giving ₹5,000 monthly allowance under PM Berojgari Bhatta scheme 2025.')}
                className="w-full text-left p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 text-[11px] truncate block"
              >
                • ₹5,000 PM Berojgari Bhatta rumor
              </button>
              <button
                type="button"
                onClick={() => setClaimText('Senior citizens aged 70+ are now covered under Ayushman Bharat regardless of family income.')}
                className="w-full text-left p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 text-[11px] truncate block"
              >
                • Ayushman Bharat 70+ universal expansion
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Latest Analysis & Historical Record */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Result Card */}
          {currentResult ? (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.1] space-y-6 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/[0.08]">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Claim Under Audit
                  </span>
                  <p className="text-sm font-semibold text-white italic">"{currentResult.originalClaim}"</p>
                </div>
                <StatusBadge status={currentResult.verdict} type="verdict" size="md" />
              </div>

              {/* Confidence Meter */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block font-mono">Verification Confidence</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">{currentResult.confidence}%</span>
                </div>
                <div className="text-right text-[11px] text-slate-400 font-mono">
                  Timestamp: {new Date(currentResult.verifiedTimestamp).toLocaleString()}
                </div>
              </div>

              {/* Detailed Neutral Analysis */}
              <div className="space-y-2 text-xs leading-relaxed">
                <span className="font-bold text-white uppercase font-mono tracking-wider">
                  Detailed Evidence Analysis
                </span>
                <p className="text-slate-300">{currentResult.analysis}</p>
              </div>

              {/* Evidence Points */}
              {currentResult.evidenceFound && currentResult.evidenceFound.length > 0 && (
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-emerald-400 uppercase font-mono tracking-wider">
                    Corroborating Evidence Found
                  </span>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                    {currentResult.evidenceFound.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contradictory Evidence */}
              {currentResult.contradictoryEvidence && currentResult.contradictoryEvidence.length > 0 && (
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-rose-400 uppercase font-mono tracking-wider">
                    Contradictory Evidence / Red Flags
                  </span>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                    {currentResult.contradictoryEvidence.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Official Sources References */}
              {currentResult.officialSources && currentResult.officialSources.length > 0 && (
                <div className="space-y-2 text-xs pt-3 border-t border-white/[0.06]">
                  <span className="font-bold text-white uppercase font-mono tracking-wider">
                    Official Government Gazette & Clarification Sources
                  </span>
                  <div className="space-y-1.5">
                    {currentResult.officialSources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] flex items-center justify-between text-slate-300 hover:text-white transition-all"
                      >
                        <div>
                          <p className="font-semibold text-white">{src.title}</p>
                          <p className="text-[11px] text-slate-400">{src.authority}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-[#477BFF] shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Forensic Disclaimer */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{currentResult.syntheticMediaNotice}</span>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 glass-card rounded-3xl space-y-2">
              <ShieldCheck className="w-8 h-8 text-[#38D9E6] mx-auto opacity-60" />
              <p className="text-sm">Submit a claim on the left to run an automated verification audit.</p>
            </div>
          )}

          {/* Historical Verified Claims Feed */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Previously Verified Public Claims ({history.length})
            </h3>
            <div className="space-y-2.5">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setCurrentResult(item)}
                  className="p-4 rounded-2xl glass-card border-white/[0.06] hover:border-white/[0.15] cursor-pointer transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <StatusBadge status={item.verdict} type="verdict" size="sm" />
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.verifiedTimestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white line-clamp-1">{item.originalClaim}</p>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{item.analysis}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
