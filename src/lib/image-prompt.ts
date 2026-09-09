/**
 * Builds the two image prompts a solution card needs.
 *
 * A solution has two distinct things to show, and they are not the same
 * picture: the mechanism in nature (a photograph of the organism or formation)
 * and the architectural application (a rendering of the built result). The
 * previous single prompt tried to be both and was neither — it always asked for
 * a building, so the biological half was never illustrated.
 *
 * The subject and the visual description come from the data, so improving one
 * prompt means editing `data/solutions.json`; the style and quality direction
 * live here, so changing the look of every image is a one-line change.
 */
import type { ChallengeCategory, Solution, SourceType } from '@/data';

export type ImageSlot = 'mechanism' | 'application';

/** What the architectural half of a solution is trying to achieve. */
const CATEGORY_BRIEF: Record<ChallengeCategory, string> = {
  climate: 'passive cooling and urban climate regulation',
  water: 'urban water capture, filtration and drainage',
  structure: 'structural performance and material efficiency',
  energy: 'building energy efficiency and on-site generation',
  waste: 'circular material flows and waste processing',
  wellbeing: 'air quality, acoustics and biophilic comfort',
  safety: 'coastal and urban resilience',
  mobility: 'movement, flow and street design',
};

/** How the mechanism half should be photographed, by kind of source. */
const MECHANISM_STYLE: Record<SourceType, string> = {
  animal:
    'Wildlife macro photograph, natural habitat, razor-sharp focus on the anatomical structure, shallow depth of field, natural daylight, National Geographic style',
  plant:
    'Botanical macro photograph, extreme close-up of the living tissue, natural daylight, shallow depth of field, scientific nature photography',
  inanimate:
    'Documentary nature photograph of the formation, geological detail and texture, natural daylight, wide tonal range, large-format landscape photography',
};

/** Fallback phrasing when a solution has no authored visual description yet. */
const MECHANISM_FALLBACK: Record<SourceType, string> = {
  animal: 'the adaptation that makes this animal remarkable, shown in close detail',
  plant: 'the structure of the plant tissue responsible for the effect',
  inanimate: 'the natural formation and the structure that produces the effect',
};

/**
 * Pulls the Latin-script name out of a title, which the data writes either
 * inside parentheses — "לוטוס (Lotus Leaf)" — or before them —
 * "Sphagnum (טחב כבול)".
 */
export function englishName(title: string): string | null {
  const inParens = title.match(/\(([^)]*[A-Za-z][^)]*)\)/);
  if (inParens) return inParens[1].trim();

  const latinRun = title.match(/[A-Za-z][A-Za-z\s'-]{2,}/);
  return latinRun ? latinRun[0].trim() : null;
}

/** Directives that keep the set looking like one library rather than a grab bag. */
const COMMON = 'No text, no lettering, no watermark, no logos.';

export function buildMechanismPrompt(solution: Solution): string {
  const subject = englishName(solution.title) ?? 'the natural mechanism';
  const visual = solution.visual_mechanism?.trim() || MECHANISM_FALLBACK[solution.source_type];

  return [
    `${MECHANISM_STYLE[solution.source_type]}.`,
    `Subject: ${subject}.`,
    `${capitalise(visual)}.`,
    'Uncluttered natural background, no human-made objects.',
    COMMON,
  ].join(' ');
}

export function buildApplicationPrompt(
  solution: Solution,
  category: ChallengeCategory | undefined,
): string {
  const brief = category ? CATEGORY_BRIEF[category] : 'sustainable urban design';
  const subject = englishName(solution.title);
  const visual =
    solution.visual_application?.trim() ||
    'a contemporary building whose facade and structure express the same principle';

  return [
    `Architectural visualisation for ${brief}.`,
    `${capitalise(visual)}.`,
    subject
      ? `The design principle is borrowed from ${subject} and is clearly legible in the built form.`
      : '',
    'Photorealistic architectural rendering, eye-level perspective, contemporary urban context,',
    'people for scale, soft overcast daylight, restrained material palette.',
    COMMON,
  ]
    .filter(Boolean)
    .join(' ');
}

export function buildPrompt(
  solution: Solution,
  category: ChallengeCategory | undefined,
  slot: ImageSlot,
): string {
  return slot === 'mechanism'
    ? buildMechanismPrompt(solution)
    : buildApplicationPrompt(solution, category);
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
