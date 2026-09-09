/**
 * The application's data source.
 *
 * There is no database server. `data/challenges.json` and `data/solutions.json`
 * live in this Git repository and are bundled into the app at build time, so a
 * commit to those files is what publishes new content — GitHub Actions rebuilds
 * and redeploys the site on every push.
 */
import challengesRaw from '@data/challenges.json';
import solutionsRaw from '@data/solutions.json';
import {
  CATEGORIES,
  type Challenge,
  type ChallengeCategory,
  type ImpactMetrics,
  type Solution,
} from './types';

export * from './types';

export const challenges: Challenge[] = (challengesRaw as unknown as Challenge[]).map((c) => ({
  id: c.id,
  title: c.title,
  description: c.description,
  category: c.category,
}));

export const solutions: Solution[] = (solutionsRaw as unknown as Solution[]).map((s) => ({
  id: s.id,
  challenge_id: s.challenge_id,
  source_type: s.source_type,
  title: s.title,
  mechanism: s.mechanism,
  application: s.application,
  metrics: (s.metrics ?? {}) as ImpactMetrics,
  image_mechanism: s.image_mechanism ?? null,
  image_application: s.image_application ?? null,
  visual_mechanism: s.visual_mechanism ?? null,
  visual_application: s.visual_application ?? null,
}));

const challengeById = new Map(challenges.map((c) => [c.id, c]));

const solutionsByChallenge = solutions.reduce<Map<string, Solution[]>>((acc, s) => {
  if (!s.challenge_id) return acc;
  const list = acc.get(s.challenge_id);
  if (list) list.push(s);
  else acc.set(s.challenge_id, [s]);
  return acc;
}, new Map());

const solutionById = new Map(solutions.map((s) => [s.id, s]));

export function getChallenge(id: string | undefined): Challenge | undefined {
  return id ? challengeById.get(id) : undefined;
}

export function getSolution(id: string | undefined): Solution | undefined {
  return id ? solutionById.get(id) : undefined;
}

export function getSolutionsForChallenge(challengeId: string | undefined): Solution[] {
  return challengeId ? (solutionsByChallenge.get(challengeId) ?? []) : [];
}

export function countSolutionsForChallenge(challengeId: string): number {
  return solutionsByChallenge.get(challengeId)?.length ?? 0;
}

/** Categories that actually have challenges, with their counts — empty ones are hidden. */
export const populatedCategories: { category: ChallengeCategory; count: number }[] = CATEGORIES
  .map((category) => ({
    category,
    count: challenges.filter((c) => c.category === category).length,
  }))
  .filter((entry) => entry.count > 0);
