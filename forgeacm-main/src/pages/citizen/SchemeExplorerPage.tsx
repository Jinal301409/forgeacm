import React, { useState, useEffect } from 'react';
import {
  Search,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Filter,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Scheme } from '../../types';

export const SchemeExplorerPage: React.FC = () => {
  const { user, token } = useAuth();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [activeScheme, setActiveScheme] = useState<Scheme | null>(null);

  // Eligibility Checker Modal State
  const [eligibilityModalScheme, setEligibilityModalScheme] = useState<Scheme | null>(null);
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [checkerProfile, setCheckerProfile] = useState({
    age: 32,
    annualIncome: user?.annualIncome || 450000,
    state: user?.state || 'Gujarat',
    city: user?.city || 'Ahmedabad',
    occupation: user?.occupation || 'Small Business Owner',
    category: user?.category || 'General',
  });

  const categories = [
    'All',
    'Energy & Sustainability',
    'Healthcare',
    'Entrepreneurship',
    'Agriculture',
    'Education & Employment',
    'Housing',
    'Women & Child Welfare',
  ];

  const states = [
    'All',
    'All-India / Central',
    'Gujarat',
    'Maharashtra',
    'Delhi (NCT)',
    'Karnataka',
    'Tamil Nadu',
    'Uttar Pradesh',
    'Rajasthan',
  ];

  useEffect(() => {
    loadSchemes();
    if (token) {
      fetch('/api/bookmarks', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => {
          if (d.bookmarks) {
            setBookmarkedIds(d.bookmarks.map((b: any) => b.itemId));
          }
        })
        .catch(() => { });
    }
  }, [selectedCategory, selectedState, token]);

  const loadSchemes = async () => {
    try {
      const url = new URL('/api/schemes', window.location.origin);
      if (selectedCategory !== 'All') url.searchParams.set('category', selectedCategory);
      if (selectedState !== 'All') url.searchParams.set('state', selectedState);
      if (searchQuery) url.searchParams.set('search', searchQuery);

      const res = await fetch(url.toString());
      const data = await res.json();
      setSchemes(data.schemes || []);
      if (!activeScheme && data.schemes && data.schemes.length > 0) {
        setActiveScheme(data.schemes[0]);
      }
    } catch (err) {
      console.error('Failed to load schemes:', err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadSchemes();
  };

  const toggleBookmark = async (scheme: Scheme) => {
    if (!token) return;
    const isBookmarked = bookmarkedIds.includes(scheme.id);

    try {
      if (isBookmarked) {
        await fetch(`/api/schemes/${scheme.id}/bookmark`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookmarkedIds((prev) => prev.filter((id) => id !== scheme.id));
      } else {
        await fetch(`/api/schemes/${scheme.id}/bookmark`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookmarkedIds((prev) => [...prev, scheme.id]);
      }
    } catch (err) {
      console.error('Error updating bookmark:', err);
    }
  };

  const runEligibilityCheck = async (scheme: Scheme) => {
    setEligibilityModalScheme(scheme);
    setEligibilityResult(null);
    setIsCheckingEligibility(true);

    try {
      const res = await fetch(`/api/schemes/${scheme.id}/check-eligibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify(checkerProfile),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to evaluate eligibility.');
      }
      setEligibilityResult(data.evaluation);
    } catch (err: any) {
      setEligibilityResult({
        isEligible: 'Requires Verification',
        matchScore: 60,
        reasons: [err.message || 'Error communicating with AI service.'],
        missingRequirements: ['Manual verification with scheme officer required'],
        actionAdvice: 'Verify with the designated district welfare office.',
      });
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#38D9E6]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OFFICIAL WELFARE SCHEMES DIRECTORY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Government Scheme Discovery & Eligibility
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Search verified central & state programs. Match your demographic profile with AI.
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword, scheme name, or benefit..."
              className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#477BFF]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl font-semibold text-white bg-[#477BFF] hover:bg-[#386df0] text-xs transition-all shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category Pills & State Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                  ? 'bg-[#477BFF] text-white shadow-sm'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08]'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-mono uppercase">Jurisdiction Filter:</span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-[#080B12] border border-white/[0.1] rounded-lg px-2.5 py-1 text-white focus:outline-none"
          >
            {states.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 font-mono">{schemes.length} programs available</span>
        </div>
      </div>

      {/* Main Grid: Scheme Cards (5 cols) & Deep Detail Drawer (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Scheme Cards List */}
        <div className="lg:col-span-5 space-y-3 max-h-[800px] overflow-y-auto pr-1">
          {schemes.map((scheme) => {
            const isBookmarked = bookmarkedIds.includes(scheme.id);
            const isSelected = activeScheme?.id === scheme.id;

            return (
              <div
                key={scheme.id}
                onClick={() => setActiveScheme(scheme)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${isSelected
                    ? 'bg-gradient-to-r from-[#477BFF]/20 to-[#8968FF]/10 border-[#477BFF]/40 shadow-lg shadow-[#477BFF]/10'
                    : 'glass-card border-white/[0.06] hover:border-white/[0.15]'
                  }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#38D9E6] uppercase tracking-wider">
                      {scheme.category} • {scheme.state}
                    </span>
                    <h3 className="text-sm font-bold text-white leading-snug">{scheme.name}</h3>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(scheme);
                    }}
                    className="p-1 text-slate-400 hover:text-amber-300 transition-colors shrink-0"
                    title={isBookmarked ? 'Remove Bookmark' : 'Save Scheme'}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {scheme.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      runEligibilityCheck(scheme);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#38D9E6] hover:underline"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Check AI Eligibility</span>
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Verified {scheme.lastVerifiedAt}
                  </span>
                </div>
              </div>
            );
          })}

          {schemes.length === 0 && (
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center space-y-2">
              <p className="text-sm text-slate-400">No matching schemes found for this criteria.</p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedState('All');
                  setSearchQuery('');
                  loadSchemes();
                }}
                className="text-xs font-semibold text-[#477BFF] hover:underline"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Right: Selected Scheme Full Detail */}
        <div className="lg:col-span-7">
          {activeScheme ? (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.1] space-y-6">
              {/* Header */}
              <div className="space-y-3 pb-6 border-b border-white/[0.08]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono text-[#38D9E6] bg-[#38D9E6]/10 px-2.5 py-1 rounded-md border border-[#38D9E6]/20">
                    {activeScheme.source}
                  </span>
                  <button
                    onClick={() => runEligibilityCheck(activeScheme)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-[#477BFF] to-[#38D9E6] shadow-md shadow-[#477BFF]/20 hover:opacity-95 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Run AI Eligibility Check</span>
                  </button>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">{activeScheme.name}</h2>
                <p className="text-xs text-slate-300 leading-relaxed">{activeScheme.description}</p>
                {activeScheme.officialUrl && (
                  <a
                    href={activeScheme.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#477BFF] hover:underline font-medium"
                  >
                    <span>Visit Official Government Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Published Eligibility Criteria */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2 text-xs">
                <span className="font-semibold text-emerald-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Official Published Eligibility
                </span>
                <p className="text-slate-300 leading-relaxed">{activeScheme.eligibilitySummary}</p>
              </div>

              {/* Key Entitlements & Benefits */}
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-white uppercase font-mono tracking-wider">
                  Guaranteed Scheme Benefits
                </h4>
                <div className="space-y-2">
                  {activeScheme.benefits.map((b, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-slate-300 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Documents */}
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-white uppercase font-mono tracking-wider">
                  Mandatory Required Proofs
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeScheme.requiredDocuments.map((doc, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-slate-300 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#38D9E6]" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step by step application guide */}
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-white uppercase font-mono tracking-wider">
                  Official Application Process
                </h4>
                <div className="space-y-2">
                  {activeScheme.applicationSteps.map((step, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-[#477BFF]/20 text-[#477BFF] font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                        {i + 1}
                      </span>
                      <span className="text-slate-300">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 glass-card rounded-3xl">
              Select a scheme on the left to review its eligibility and application requirements.
            </div>
          )}
        </div>
      </div>

      {/* AI Eligibility Evaluation Modal */}
      {eligibilityModalScheme && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#080B12] border border-white/[0.1] rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#38D9E6]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>GEMINI 3.8 ELIGIBILITY EVALUATOR</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  {eligibilityModalScheme.name}
                </h3>
              </div>
              <button
                onClick={() => setEligibilityModalScheme(null)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            {/* Profile Check Inputs */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3 text-xs">
              <span className="font-semibold text-white font-mono">Verify Your Profile Inputs:</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">State</label>
                  <input
                    type="text"
                    value={checkerProfile.state}
                    onChange={(e) => setCheckerProfile({ ...checkerProfile, state: e.target.value })}
                    className="w-full bg-[#080B12] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Annual Household Income (₹)</label>
                  <input
                    type="number"
                    value={checkerProfile.annualIncome}
                    onChange={(e) => setCheckerProfile({ ...checkerProfile, annualIncome: Number(e.target.value) })}
                    className="w-full bg-[#080B12] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Occupation</label>
                  <input
                    type="text"
                    value={checkerProfile.occupation}
                    onChange={(e) => setCheckerProfile({ ...checkerProfile, occupation: e.target.value })}
                    className="w-full bg-[#080B12] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Social Category</label>
                  <select
                    value={checkerProfile.category}
                    onChange={(e) => setCheckerProfile({ ...checkerProfile, category: e.target.value })}
                    className="w-full bg-[#080B12] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-white"
                  >
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => runEligibilityCheck(eligibilityModalScheme)}
                disabled={isCheckingEligibility}
                className="w-full py-2 rounded-xl text-xs font-semibold text-white bg-[#477BFF] hover:bg-[#386df0] transition-all"
              >
                {isCheckingEligibility ? 'Running Gemini AI Assessment...' : 'Re-Evaluate Eligibility'}
              </button>
            </div>

            {/* Assessment Result */}
            {isCheckingEligibility ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-8 h-8 border-2 border-[#38D9E6] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-300">Comparing profile against published gazette rules...</p>
              </div>
            ) : eligibilityResult ? (
              <div className="space-y-4 text-xs">
                {/* Score & Verdict */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-transparent border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                      Evaluation Result
                    </span>
                    <span className="text-base font-bold text-white">
                      {eligibilityResult.isEligible}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold font-mono text-emerald-400">
                      {eligibilityResult.matchScore}%
                    </span>
                    <span className="text-[10px] text-slate-400 block">Match Score</span>
                  </div>
                </div>

                {/* Rule-by-rule Breakdown */}
                {eligibilityResult.checks && eligibilityResult.checks.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-semibold text-white font-mono">Rule Criteria Breakdown:</span>
                    <div className="space-y-1.5">
                      {eligibilityResult.checks.map((chk: any, i: number) => (
                        <div key={i} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-2">
                          <span className={`font-bold font-mono ${chk.status === 'pass' ? 'text-emerald-400' : chk.status === 'fail' ? 'text-rose-400' : 'text-amber-400'}`}>
                            {chk.status === 'pass' ? '✓' : chk.status === 'fail' ? '✗' : '?'}
                          </span>
                          <div className="flex-1">
                            <span className="font-semibold text-white mr-1.5">{chk.label}:</span>
                            <span className="text-slate-300">{chk.detail}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Explanations */}
                <div className="space-y-2">
                  <span className="font-semibold text-white font-mono">Assessment Reasons:</span>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                    {(eligibilityResult.reasons || []).map((r: string, i: number) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                {/* Action Advice */}
                {eligibilityResult.actionAdvice && (
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                    <span className="font-semibold text-[#38D9E6]">Recommended Next Step:</span>
                    <p className="text-slate-300">{eligibilityResult.actionAdvice}</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
