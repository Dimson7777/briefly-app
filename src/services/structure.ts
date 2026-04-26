/**
 * Lightweight, deterministic transformer that turns raw client notes
 * into a structured brief skeleton. No AI — pattern matching only,
 * which is honest and predictable for a portfolio piece.
 */

export type Structured = {
  overview: string;
  goals: string;
  deliverables: string[];
  exclusions: string[];
  assumptions: string[];
};

const DELIVERABLE_HINTS = [
  /\b(?:need|build|create|design|develop|deliver|provide|set\s?up|implement)\b/i,
  /\b(?:page|landing|website|app|dashboard|logo|brand|copy|video|email|funnel|integration|automation|api)\b/i,
];

const EXCLUSION_HINTS = [/\b(?:not include|no |exclud|out of scope|won['’]?t|will not|skip)\b/i];
const ASSUMPTION_HINTS = [/\b(?:assume|expect|assuming|figure|presum)\b/i];

function splitSentences(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .split(/(?<=[.!?])\s+|\n+|[•\-]\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 4);
}

function clean(s: string): string {
  return s.replace(/^[•\-\d.)\s]+/, '').trim();
}

export function structureNotes(raw: string): Structured {
  const sentences = splitSentences(raw);
  const deliverables: string[] = [];
  const exclusions: string[] = [];
  const assumptions: string[] = [];
  const overviewParts: string[] = [];

  for (const s of sentences) {
    const c = clean(s);
    if (EXCLUSION_HINTS.some((r) => r.test(c))) {
      exclusions.push(c);
    } else if (ASSUMPTION_HINTS.some((r) => r.test(c))) {
      assumptions.push(c);
    } else if (DELIVERABLE_HINTS.some((r) => r.test(c))) {
      deliverables.push(c);
    } else {
      overviewParts.push(c);
    }
  }

  const overview = overviewParts.slice(0, 3).join(' ');
  const goalSeed = overviewParts.find((s) => /\b(?:goal|aim|objective|so that|in order to|because)\b/i.test(s));
  const goals = goalSeed ?? (overviewParts[0] ?? '');

  return {
    overview: overview || raw.slice(0, 280),
    goals: goals,
    deliverables: dedupe(deliverables).slice(0, 8),
    exclusions: dedupe(exclusions).slice(0, 6),
    assumptions: dedupe(assumptions).slice(0, 6),
  };
}

function dedupe(arr: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of arr) {
    const k = x.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      out.push(x);
    }
  }
  return out;
}
