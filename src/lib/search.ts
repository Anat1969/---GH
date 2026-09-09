/**
 * Relevance search over the bundled library.
 *
 * This replaces the old `oracle` Supabase edge function. Everything runs in the
 * browser against the JSON in `data/`, so search works offline, costs nothing,
 * and has no API key to leak.
 */
import {
  challenges,
  getChallenge,
  getSolutionsForChallenge,
  solutions,
  type Challenge,
  type Solution,
} from '@/data';

/**
 * Hebrew words pick up prefixes (ו, ה, ב, כ, ל, מ, ש) that break naive matching,
 * and final letters differ from their medial forms. Normalising both sides of a
 * comparison lets "לקירור" match "קירור".
 */
const FINAL_LETTERS: Record<string, string> = {
  ך: 'כ',
  ם: 'מ',
  ן: 'נ',
  ף: 'פ',
  ץ: 'צ',
};

const PREFIXES = ['ו', 'ה', 'ב', 'כ', 'ל', 'מ', 'ש'];

/** Words too common in this corpus to say anything about relevance. */
const STOP_WORDS = new Set([
  'של',
  'עם',
  'על',
  'את',
  'לא',
  'זה',
  'אני',
  'איך',
  'מה',
  'כדי',
  'יותר',
  'the',
  'and',
  'for',
  'with',
]);

function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[֑-ׇ]/g, '') // strip niqqud and cantillation marks
    .replace(/[ךםןףץ]/g, (ch) => FINAL_LETTERS[ch])
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** A word plus its form without a one-letter Hebrew prefix, so both can match. */
function variants(word: string): string[] {
  if (word.length > 3 && PREFIXES.includes(word[0])) {
    return [word, word.slice(1)];
  }
  return [word];
}

function tokenise(text: string): string[] {
  return normalise(text)
    .split(' ')
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/** Counts how strongly one term hits a field: exact word > prefix > substring. */
function scoreTerm(term: string, haystack: string): number {
  let best = 0;
  for (const variant of variants(term)) {
    if (variant.length < 2) continue;
    const wordBoundary = new RegExp(`(^| )${escapeRegExp(variant)}( |$)`);
    if (wordBoundary.test(haystack)) best = Math.max(best, 3);
    else if (haystack.includes(` ${variant}`)) best = Math.max(best, 2);
    else if (haystack.includes(variant)) best = Math.max(best, 1);
  }
  return best;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface ChallengeMatch {
  challenge: Challenge;
  score: number;
}

export interface SolutionMatch {
  solution: Solution;
  challenge: Challenge | undefined;
  score: number;
}

export interface SearchResults {
  query: string;
  challenges: ChallengeMatch[];
  solutions: SolutionMatch[];
}

// Title hits matter more than body hits, so each field carries its own weight.
const CHALLENGE_FIELDS = [
  { get: (c: Challenge) => c.title, weight: 4 },
  { get: (c: Challenge) => c.description ?? '', weight: 1 },
];

const SOLUTION_FIELDS = [
  { get: (s: Solution) => s.title, weight: 4 },
  { get: (s: Solution) => s.mechanism, weight: 1.5 },
  { get: (s: Solution) => s.application, weight: 1.5 },
];

/** Filters challenges for the sidebar list — substring match, no ranking. */
export function filterChallenges(query: string): Challenge[] {
  const terms = tokenise(query);
  if (terms.length === 0) return challenges;

  return challenges.filter((c) => {
    const haystack = ` ${normalise(`${c.title} ${c.description ?? ''}`)} `;
    return terms.some((term) => scoreTerm(term, haystack) > 0);
  });
}

/** Ranked search across both challenges and solutions, used by the search modal. */
export function search(query: string, limit = 6): SearchResults {
  const terms = tokenise(query);
  if (terms.length === 0) return { query, challenges: [], solutions: [] };

  const rankedChallenges: ChallengeMatch[] = challenges
    .map((challenge) => {
      let score = 0;
      for (const field of CHALLENGE_FIELDS) {
        const haystack = ` ${normalise(field.get(challenge))} `;
        for (const term of terms) score += scoreTerm(term, haystack) * field.weight;
      }
      // A challenge is also relevant when its own solutions match the query.
      for (const solution of getSolutionsForChallenge(challenge.id)) {
        const haystack = ` ${normalise(solution.title)} `;
        for (const term of terms) score += scoreTerm(term, haystack) * 0.5;
      }
      return { challenge, score };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const rankedSolutions: SolutionMatch[] = solutions
    .map((solution) => {
      let score = 0;
      for (const field of SOLUTION_FIELDS) {
        const haystack = ` ${normalise(field.get(solution))} `;
        for (const term of terms) score += scoreTerm(term, haystack) * field.weight;
      }
      return { solution, challenge: getChallenge(solution.challenge_id ?? undefined), score };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return { query, challenges: rankedChallenges, solutions: rankedSolutions };
}
