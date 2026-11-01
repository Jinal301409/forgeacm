/**
 * CivicLens AI - Deterministic Rule Engine for Scheme Eligibility
 */
import type { Scheme } from './db.js';

export interface EligibilityProfile {
    age?: number;
    annualIncome?: number;
    state?: string;
    category?: string;
    occupation?: string;
}

export interface RuleCheck {
    label: string;
    status: 'pass' | 'fail' | 'unknown';
    detail: string;
}

export interface RuleEvaluation {
    isEligible: 'Likely Eligible' | 'Partially Eligible' | 'Ineligible' | 'Requires More Info';
    matchScore: number;
    reasons: string[];
    missingRequirements: string[];
    actionAdvice: string;
    checks: RuleCheck[];
    hardFail: boolean;
}

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export function checkEligibilityRules(profile: EligibilityProfile, scheme: Scheme): RuleEvaluation {
    const rules = scheme.eligibilityRules || {};
    const checks: RuleCheck[] = [];

    if (rules.minAge !== undefined || rules.maxAge !== undefined) {
        const range = `${rules.minAge ?? 0}${rules.maxAge !== undefined ? `-${rules.maxAge}` : '+'} years`;
        if (profile.age === undefined || Number.isNaN(profile.age)) {
            checks.push({ label: 'Age Requirement', status: 'unknown', detail: `Published scheme range is ${range}. Age was not provided.` });
        } else if ((rules.minAge !== undefined && profile.age < rules.minAge) || (rules.maxAge !== undefined && profile.age > rules.maxAge)) {
            checks.push({ label: 'Age Requirement', status: 'fail', detail: `Applicant age (${profile.age}) is outside the requirement (${range}).` });
        } else {
            checks.push({ label: 'Age Requirement', status: 'pass', detail: `Applicant age (${profile.age}) meets published criterion (${range}).` });
        }
    }

    if (rules.maxIncome !== undefined) {
        if (profile.annualIncome === undefined || Number.isNaN(profile.annualIncome)) {
            checks.push({ label: 'Income Ceiling', status: 'unknown', detail: `Annual household income cap is ${inr(rules.maxIncome)}.` });
        } else if (profile.annualIncome > rules.maxIncome) {
            checks.push({ label: 'Income Ceiling', status: 'fail', detail: `Stated income (${inr(profile.annualIncome)}) exceeds cap (${inr(rules.maxIncome)}).` });
        } else {
            checks.push({ label: 'Income Ceiling', status: 'pass', detail: `Stated income (${inr(profile.annualIncome)}) is within the ${inr(rules.maxIncome)} ceiling.` });
        }
    }

    const schemeState = (scheme.state || '').toLowerCase();
    const isCentral = schemeState.includes('all-india') || schemeState.includes('central') || schemeState.includes('national') || schemeState === '';
    const allowedStates = (rules.eligibleStates || []).map((s) => s.toLowerCase());

    if (!isCentral || allowedStates.length > 0) {
        const userState = (profile.state || '').toLowerCase();
        const list = allowedStates.length > 0 ? allowedStates : [schemeState];
        if (!userState) {
            checks.push({ label: 'Jurisdiction', status: 'unknown', detail: 'State/UT was not provided.' });
        } else if (list.some((s) => s === userState || s.includes(userState) || userState.includes(s))) {
            checks.push({ label: 'Jurisdiction', status: 'pass', detail: `Applicant located in eligible territory (${profile.state}).` });
        } else {
            checks.push({ label: 'Jurisdiction', status: 'fail', detail: `Scheme is restricted to ${scheme.state}, not ${profile.state}.` });
        }
    } else {
        checks.push({ label: 'Jurisdiction', status: 'pass', detail: 'National / All-India Central Scheme.' });
    }

    if (rules.targetGroups && rules.targetGroups.length > 0) {
        checks.push({
            label: 'Beneficiary Category',
            status: 'unknown',
            detail: `Targeted beneficiary groups: ${rules.targetGroups.join(', ')}.`,
        });
    }

    const pass = checks.filter((c) => c.status === 'pass').length;
    const unknown = checks.filter((c) => c.status === 'unknown').length;
    const fail = checks.filter((c) => c.status === 'fail').length;
    const total = Math.max(checks.length, 1);

    let score = Math.round(((pass + unknown * 0.5) / total) * 100);
    if (fail > 0) score = Math.min(score, 40);
    score = Math.max(10, Math.min(100, score));

    let isEligible: RuleEvaluation['isEligible'];
    if (fail > 0) isEligible = 'Ineligible';
    else if (unknown === 0) isEligible = 'Likely Eligible';
    else if (pass > 0) isEligible = 'Partially Eligible';
    else isEligible = 'Requires More Info';

    const missing = [
        ...checks.filter((c) => c.status === 'unknown').map((c) => `Verify: ${c.detail}`),
        ...(scheme.requiredDocuments || []).slice(0, 4).map((d) => `Mandatory proof: ${d}`),
    ];

    return {
        isEligible,
        matchScore: score,
        reasons: checks.map((c) => `${c.status === 'pass' ? '✓' : c.status === 'fail' ? '✗' : '?'} ${c.detail}`),
        missingRequirements: missing,
        actionAdvice:
            fail > 0
                ? 'Based on published criteria, you do not meet all mathematical requirements. Verify on the official portal for relaxations.'
                : `Gather listed required documents and apply via the designated portal: ${scheme.officialUrl}`,
        checks,
        hardFail: fail > 0,
    };
}