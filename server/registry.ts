/**
 * CivicLens AI - Verified Registry Context & Media Provenance
 */
import { db } from './db.js';

export interface RegistryMatch {
    id: string;
    type: 'Scheme' | 'Policy' | 'Prior fact-check';
    title: string;
    authority?: string;
    excerpt: string;
    score: number;
}

export interface RelatedCheck {
    id: string;
    claim: string;
    verdict: string;
    similarity: number;
    reason: 'identical-media' | 'similar-claim';
    verifiedTimestamp: string;
}

const STOPWORDS = new Set(
    'the a an and or of to in on for with is are was were be been this that these those it its as at by from has have had will would can could should not no yes you your they their them we our about all any new now get gets give gives per via also more than into out over under what which who whom when where why how'.split(' ')
);

function tokenize(text: string): string[] {
    return (text.toLowerCase().match(/[\p{L}\p{N}₹]+/gu) || []).filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

function jaccard(a: Set<string>, b: Set<string>): number {
    if (a.size === 0 || b.size === 0) return 0;
    let inter = 0;
    for (const t of a) if (b.has(t)) inter++;
    return inter / (a.size + b.size - inter);
}

export function retrieveRegistryContext(claim: string, limit = 5): RegistryMatch[] {
    const data = db.get();
    const queryTokens = new Set(tokenize(claim));
    if (queryTokens.size === 0) return [];

    type Entry = Omit<RegistryMatch, 'score'> & { text: string };
    const entries: Entry[] = [];

    for (const s of data.schemes) {
        entries.push({
            id: s.id,
            type: 'Scheme',
            title: s.name,
            authority: s.source,
            excerpt: `${s.description} Eligibility: ${s.eligibilitySummary}. Benefits: ${(s.benefits || []).join('; ')}. Source: ${s.officialUrl}`.slice(0, 700),
            text: `${s.name} ${s.description} ${s.eligibilitySummary} ${(s.benefits || []).join(' ')} ${(s.tags || []).join(' ')}`,
        });
    }
    for (const p of data.policyDocuments) {
        if (p.verificationStatus !== 'Official') continue;
        entries.push({
            id: p.id,
            type: 'Policy',
            title: p.title,
            authority: p.authority,
            excerpt: p.extractedContent.slice(0, 700),
            text: `${p.title} ${p.authority} ${p.extractedContent.slice(0, 3000)}`,
        });
    }
    for (const f of data.factChecks) {
        entries.push({
            id: f.id,
            type: 'Prior fact-check',
            title: `${f.verdict}: ${f.originalClaim.slice(0, 90)}`,
            excerpt: `Verdict: ${f.verdict}. ${f.analysis}`.slice(0, 700),
            text: `${f.originalClaim} ${f.analysis}`,
        });
    }

    const docFreq = new Map<string, number>();
    const tokenised = entries.map((e) => new Set(tokenize(e.text)));
    for (const set of tokenised) {
        for (const t of queryTokens) if (set.has(t)) docFreq.set(t, (docFreq.get(t) || 0) + 1);
    }

    const scored: RegistryMatch[] = [];
    entries.forEach((e, i) => {
        let score = 0;
        for (const t of queryTokens) {
            if (tokenised[i].has(t)) score += 1 + Math.log((entries.length + 1) / ((docFreq.get(t) || 0) + 0.5));
        }
        if (score > 0) {
            const { text: _t, ...rest } = e;
            scored.push({ ...rest, score: Math.round((score / queryTokens.size) * 100) / 100 });
        }
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, limit).filter((m) => m.score >= 0.5);
}

export function findRelatedChecks(claim: string, mediaSha256?: string, excludeId?: string): RelatedCheck[] {
    const q = new Set(tokenize(claim));
    const out: RelatedCheck[] = [];

    for (const f of db.get().factChecks) {
        if (f.id === excludeId) continue;
        if (mediaSha256 && f.mediaSha256 && f.mediaSha256 === mediaSha256) {
            out.push({
                id: f.id,
                claim: f.originalClaim,
                verdict: f.verdict,
                similarity: 1.0,
                reason: 'identical-media',
                verifiedTimestamp: f.verifiedTimestamp,
            });
            continue;
        }
        const sim = jaccard(q, new Set(tokenize(f.originalClaim)));
        if (sim >= 0.45) {
            out.push({
                id: f.id,
                claim: f.originalClaim,
                verdict: f.verdict,
                similarity: Math.round(sim * 100) / 100,
                reason: 'similar-claim',
                verifiedTimestamp: f.verifiedTimestamp,
            });
        }
    }
    return out.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
}