/**
 * Builds the English rendering prompt shown on each solution card, so a visitor
 * can paste it into an image generator.
 *
 * The old version matched the Hebrew title against a hand-written keyword table
 * that had drifted out of sync with the data — most titles fell through to a
 * generic fallback. This version reads the English name the data already
 * carries in parentheses (e.g. "נמלת הסהרה הכסופה (Saharan Silver Ant)") and
 * falls back to the source category, so every card gets a specific prompt.
 */
import type { ChallengeCategory, Solution, SourceType } from '@/data';

const CATEGORY_BRIEF: Record<ChallengeCategory, string> = {
  climate: 'urban climate regulation and passive cooling',
  water: 'urban water management and harvesting',
  structure: 'structural engineering and material efficiency',
  energy: 'building energy efficiency and generation',
  waste: 'waste processing and circular material flows',
  wellbeing: 'human wellbeing and biophilic design',
  safety: 'hazard protection and urban resilience',
  mobility: 'transportation and pedestrian flow',
};

const SOURCE_BRIEF: Record<SourceType, string> = {
  animal: 'an animal adaptation',
  plant: 'a plant mechanism',
  inanimate: 'a geological or mineral formation',
};

/** Pulls the Latin-script name out of a title like "לוטוס (Lotus Leaf)". */
function englishName(title: string): string | null {
  const parenthesised = title.match(/\(([^)]*[A-Za-z][^)]*)\)/);
  if (parenthesised) return parenthesised[1].trim();

  const latinRun = title.match(/[A-Za-z][A-Za-z\s'-]{2,}/);
  return latinRun ? latinRun[0].trim() : null;
}

export function buildImagePrompt(solution: Solution, category: ChallengeCategory | undefined): string {
  const brief = category ? CATEGORY_BRIEF[category] : 'sustainable urban design';
  const source = SOURCE_BRIEF[solution.source_type];
  const inspiration = englishName(solution.title);

  const subject = inspiration
    ? `biomimicry of ${inspiration}, ${source}`
    : `biomimicry of ${source}`;

  return [
    `Architectural visualisation: a contemporary building addressing ${brief},`,
    `designed through ${subject}.`,
    'The facade and structural system visibly express that principle.',
    'Photorealistic rendering, eye-level perspective, urban context with pedestrians',
    'and vegetation, golden hour lighting, high detail.',
  ].join(' ');
}
