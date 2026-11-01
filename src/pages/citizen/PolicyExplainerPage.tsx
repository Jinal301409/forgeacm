import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  Globe,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calendar,
  Send,
  BookOpen,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, SupportedLanguage, LANGUAGES } from '../../context/LanguageContext';
import { StatusBadge } from '../../components/common/StatusBadge';

export const PolicyExplainerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const { language: currentAppLanguage } = useLanguage();

  const [policies, setPolicies] = useState<any[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(currentAppLanguage);
  const [explanation, setExplanation] = useState<any>(null);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Audio TTS State
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Q&A Chat states
  const [chatQuestion, setChatQuestion] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [isAnswering, setIsAnswering] = useState<boolean>(false);

  // Upload modal / file extraction state
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAuthority, setUploadAuthority] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Public Administration');
  const [uploadContent, setUploadContent] = useState('');
  const [uploadSourceUrl, setUploadSourceUrl] = useState('');
  const [uploadedDocUrl, setUploadedDocUrl] = useState('');
  const [isExtractingFile, setIsExtractingFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetch('/api/policies')
      .then((r) => r.json())
      .then((d) => {
        setPolicies(d.policies || []);
        if (id) {
          const found = d.policies.find((p: any) => p.id === id);
          if (found) setSelectedPolicy(found);
        } else if (d.policies && d.policies.length > 0) {
          setSelectedPolicy(d.policies[0]);
        }
      })
      .catch((err) => console.error('Failed to load policies:', err));
  }, [id]);

  useEffect(() => {
    if (!selectedPolicy) return;
    loadExplanation(selectedPolicy.id, selectedLanguage);
  }, [selectedPolicy, selectedLanguage]);

  const loadExplanation = async (policyId: string, targetLang: string) => {
    setIsExplaining(true);
    setError('');
    setAudioUrl(null);
    try {
      const res = await fetch(`/api/policies/${policyId}/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ targetLanguage: targetLang }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate explanation.');
      setExplanation(data.explanation);
      setChatMessages([]);
    } catch (err: any) {
      setError(err.message || 'Error communicating with AI engine.');
    } finally {
      setIsExplaining(false);
    }
  };

  const handlePlayVoice = async () => {
    if (!explanation?.simpleExplanation) return;
    if (audioUrl) {
      if (audioRef.current) {
        if (isPlayingAudio) {
          audioRef.current.pause();
          setIsPlayingAudio(false);
        } else {
          audioRef.current.play();
          setIsPlayingAudio(true);
        }
      }
      return;
    }

    setIsLoadingAudio(true);
    try {
      const textToSpeak = `${explanation.simpleExplanation}. Key point: ${(explanation.keyPointsSummary || []).slice(0, 2).join('. ')}`;
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ text: textToSpeak }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Voice generation unavailable.');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setIsPlayingAudio(false);
      audio.play();
      setIsPlayingAudio(true);
    } catch (err: any) {
      alert(err.message || 'Voice generation failed.');
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtractingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/policies/extract', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token || ''}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not parse document.');

      setUploadContent(data.text || '');
      setUploadedDocUrl(data.fileUrl || '');
      if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    } catch (err: any) {
      alert(err.message || 'Document text extraction failed.');
    } finally {
      setIsExtractingFile(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuestion.trim() || !selectedPolicy || isAnswering) return;

    const q = chatQuestion.trim();
    setChatQuestion('');
    setChatMessages((prev) => [...prev, { role: 'user', text: q }]);
    setIsAnswering(true);

    try {
      const res = await fetch(`/api/policies/${selectedPolicy.id}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ question: q }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get answer.');
      setChatMessages((prev) => [...prev, { role: 'assistant', text: data.answer }]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `Error: ${err.message || 'Unable to query policy.'}` },
      ]);
    } finally {
      setIsAnswering(false);
    }
  };

  const handleUploadPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle || !uploadContent) return;

    setIsUploading(true);
    try {
      const res = await fetch('/api/policies/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          title: uploadTitle,
          authority: uploadAuthority,
          category: uploadCategory,
          content: uploadContent,
          sourceUrl: uploadSourceUrl,
          documentUrl: uploadedDocUrl,
          language: selectedLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed.');

      setPolicies([data.policy, ...policies]);
      setSelectedPolicy(data.policy);
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadAuthority('');
      setUploadContent('');
      setUploadSourceUrl('');
      setUploadedDocUrl('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit document.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#38D9E6]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GEMINI 3.8 / 2.5 FLASH GROUNDED POLICY ANALYSIS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Policy & Notification Explainer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Translates official gazettes and PDF circulars into plain citizen entitlements with verifiable citations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#080B12] border border-white/[0.1] rounded-xl px-3 py-2 text-xs">
            <Globe className="w-4 h-4 text-[#38D9E6]" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguage)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.name} className="bg-[#080B12] text-white">
                  {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#477BFF] to-[#386df0] hover:opacity-95 rounded-xl shadow-lg shadow-[#477BFF]/20 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Document Index */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center justify-between">
            <span>Official Policy Documents</span>
            <span className="text-[10px] text-slate-400">{policies.length} Cataloged</span>
          </h2>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {policies.map((p) => {
              const isSelected = selectedPolicy?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPolicy(p)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all space-y-2 group ${isSelected
                      ? 'bg-gradient-to-r from-[#477BFF]/20 to-[#8968FF]/10 border-[#477BFF]/40 shadow-md shadow-[#477BFF]/10'
                      : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.06] text-slate-300'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#38D9E6] uppercase tracking-wider">
                      {p.category}
                    </span>
                    <StatusBadge status={p.verificationStatus || 'Official'} size="sm" />
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-[#38D9E6] transition-colors line-clamp-2">
                    {p.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{p.authority}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Explanation */}
        <div className="lg:col-span-8 space-y-6">
          {selectedPolicy && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.1] space-y-8">
              <div className="space-y-3 pb-6 border-b border-white/[0.08]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono text-[#38D9E6] bg-[#38D9E6]/10 px-2.5 py-1 rounded-md border border-[#38D9E6]/20">
                    {selectedPolicy.authority}
                  </span>
                  <div className="flex items-center gap-3">
                    {/* Voice Explainer Button */}
                    <button
                      onClick={handlePlayVoice}
                      disabled={isExplaining || isLoadingAudio || !explanation}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#8968FF]/15 hover:bg-[#8968FF]/25 border border-[#8968FF]/30 text-xs font-semibold text-[#8968FF] transition-all disabled:opacity-50"
                      title="Listen in regional language audio"
                    >
                      {isLoadingAudio ? (
                        <>
                          <span className="w-3 h-3 border-2 border-[#8968FF] border-t-transparent rounded-full animate-spin" />
                          <span>Generating Audio...</span>
                        </>
                      ) : isPlayingAudio ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>Pause Voice</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Voice Explainer ({selectedLanguage})</span>
                        </>
                      )}
                    </button>
                    <span className="text-xs text-slate-400 font-mono">
                      Published: {selectedPolicy.notificationDate}
                    </span>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {selectedPolicy.title}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  {selectedPolicy.sourceUrl && (
                    <a
                      href={selectedPolicy.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#477BFF] hover:underline"
                    >
                      <span>Official Source Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {selectedPolicy.documentUrl && (
                    <a
                      href={selectedPolicy.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#38D9E6] hover:underline"
                    >
                      <span>Original Uploaded File (PDF)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Loading */}
              {isExplaining && (
                <div className="py-16 text-center space-y-4">
                  <div className="w-10 h-10 border-2 border-[#477BFF] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-medium text-white">
                    Analyzing gazette provisions in {selectedLanguage}...
                  </p>
                  <p className="text-xs text-slate-400">
                    Gemini is isolating statutory mandates and grounding citations.
                  </p>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {!isExplaining && explanation && (
                <div className="space-y-8 text-sm leading-relaxed">
                  {/* Summary */}
                  <div className="p-5 rounded-2xl bg-[#477BFF]/10 border border-[#477BFF]/20 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-[#38D9E6] uppercase tracking-wider">
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        Citizen Summary ({selectedLanguage})
                      </span>
                    </div>
                    <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                      {explanation.simpleExplanation}
                    </p>
                  </div>

                  {/* Core provisions */}
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#477BFF]" />
                      Core Provisions & Key Points
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(explanation.keyPointsSummary || []).map((point: string, idx: number) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-300 flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Eligibility */}
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Eligibility Checker
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                        <span className="font-semibold text-emerald-400 uppercase font-mono tracking-wider">
                          Who is Eligible
                        </span>
                        <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                          {(explanation.eligibilityCriteria?.eligible || []).map((e: string, i: number) => (
                            <li key={i}>{e}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                        <span className="font-semibold text-rose-400 uppercase font-mono tracking-wider">
                          Who is Excluded / Ineligible
                        </span>
                        <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                          {(explanation.eligibilityCriteria?.ineligible || []).map((e: string, i: number) => (
                            <li key={i}>{e}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#38D9E6]" />
                      Mandatory Required Documents
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {(explanation.requiredDocuments || []).map((doc: string, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-slate-300 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#38D9E6]" />
                          <span>{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step by Step */}
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-[#8968FF]" />
                      Step-by-Step Application Guide
                    </h3>
                    <div className="space-y-3">
                      {(explanation.applicationGuide || []).map((step: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3 text-xs">
                          <span className="w-6 h-6 rounded-lg bg-[#477BFF]/20 text-[#477BFF] font-mono font-bold flex items-center justify-center shrink-0">
                            {step.step || idx + 1}
                          </span>
                          <div className="space-y-1">
                            <p className="font-semibold text-white">{step.title}</p>
                            <p className="text-slate-400 leading-relaxed">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deadlines */}
                  {explanation.importantDeadlines && explanation.importantDeadlines.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-400" />
                        Important Deadlines & Milestones
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {explanation.importantDeadlines.map((dl: any, idx: number) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                            <p className="font-semibold text-white">{dl.milestone}</p>
                            <p className="text-amber-300 font-mono">{dl.date}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grounded Citations */}
                  <div className="p-5 rounded-2xl bg-[#090E1B] border border-white/[0.1] space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                      <span className="text-xs font-mono font-bold text-[#38D9E6] uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Source Gazette Citations & Verifiability
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Distinguishing Explicit vs AI Inferred
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      {(explanation.citations || []).map((cite: any, idx: number) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1.5">
                          <p className="font-mono text-emerald-400 font-semibold">{cite.pageOrSection}</p>
                          <p className="text-slate-300">
                            <strong className="text-white">Verbatim Source:</strong> "{cite.explicitStatement}"
                          </p>
                          {cite.aiInterpretation && (
                            <p className="text-slate-400 text-[11px]">
                              <strong className="text-[#38D9E6]">AI Interpretation:</strong> {cite.aiInterpretation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    <p className="text-[11px] text-slate-500 italic">
                      Disclaimer: AI-generated explanations are derived directly from published statutory gazette records. They are informational and do not replace formal judicial counsel.
                    </p>
                  </div>

                  {/* Q&A Chat */}
                  <div className="pt-6 border-t border-white/[0.08] space-y-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-[#477BFF]" />
                      Ask Questions About This Policy
                    </h3>
                    <p className="text-xs text-slate-400">
                      Our AI will answer questions strictly grounded in this official document.
                    </p>

                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {chatMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={`p-3.5 rounded-2xl text-xs ${msg.role === 'user'
                              ? 'bg-[#477BFF]/20 text-white ml-8 border border-[#477BFF]/30'
                              : 'bg-white/[0.03] text-slate-200 mr-8 border border-white/[0.06]'
                            }`}
                        >
                          <p className="font-semibold text-[10px] uppercase font-mono text-slate-400 mb-1">
                            {msg.role === 'user' ? 'You' : 'CivicLens Policy Advisor'}
                          </p>
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        </div>
                      ))}
                      {isAnswering && (
                        <div className="p-3 rounded-xl bg-white/[0.03] text-xs text-slate-400 flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#477BFF] animate-pulse" />
                          <span>Searching policy document for citations...</span>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleAskQuestion} className="flex gap-2">
                      <input
                        type="text"
                        value={chatQuestion}
                        onChange={(e) => setChatQuestion(e.target.value)}
                        placeholder="e.g. Can tenant occupants apply for this subsidy?"
                        className="flex-1 bg-[#080B12] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#477BFF]"
                      />
                      <button
                        type="submit"
                        disabled={isAnswering || !chatQuestion.trim()}
                        className="px-4 py-2.5 rounded-xl font-semibold text-white bg-[#477BFF] hover:bg-[#386df0] disabled:opacity-50 text-xs flex items-center gap-1.5 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Ask</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Upload & PDF Ingestion Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#080B12] border border-white/[0.1] rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#38D9E6]" />
                Upload Official Policy or Notification
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            {/* Document parser drag-drop */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-dashed border-white/[0.15] text-center space-y-2">
              <Upload className="w-6 h-6 text-[#38D9E6] mx-auto" />
              <p className="text-xs text-white font-semibold">Upload PDF, scanned gazette, or photo</p>
              <p className="text-[11px] text-slate-400">PDFs are extracted locally; photos use Gemini OCR in any Indian language.</p>
              <label className="inline-block mt-2 px-3.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-white cursor-pointer transition-all">
                {isExtractingFile ? 'Extracting Text...' : 'Choose PDF / Image File'}
                <input
                  type="file"
                  accept="application/pdf,image/*,.txt"
                  onChange={handleFileUpload}
                  disabled={isExtractingFile}
                  className="hidden"
                />
              </label>
            </div>

            <form onSubmit={handleUploadPolicy} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Document Title *</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Revised Electric Vehicle Urban Subsidy Circular 2025"
                  className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl px-4 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Issuing Authority</label>
                  <input
                    type="text"
                    value={uploadAuthority}
                    onChange={(e) => setUploadAuthority(e.target.value)}
                    placeholder="e.g. Ministry of Housing & Urban Affairs"
                    className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl px-4 py-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl px-4 py-2 text-white"
                  >
                    <option value="Energy & Sustainability">Energy & Sustainability</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Digital Governance & Privacy">Digital Governance & Privacy</option>
                    <option value="Urban Infrastructure">Urban Infrastructure</option>
                    <option value="Public Administration">Public Administration</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Official Portal / Source URL</label>
                <input
                  type="url"
                  value={uploadSourceUrl}
                  onChange={(e) => setUploadSourceUrl(e.target.value)}
                  placeholder="https://pib.gov.in/..."
                  className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl px-4 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Document Text / Provisions *</label>
                <textarea
                  rows={5}
                  required
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  placeholder="Paste or extract notification text here..."
                  className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl p-3 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !uploadTitle || !uploadContent}
                  className="px-5 py-2.5 rounded-xl font-semibold text-white bg-[#477BFF] hover:bg-[#386df0] disabled:opacity-50 transition-all"
                >
                  {isUploading ? 'Ingesting...' : 'Submit Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};