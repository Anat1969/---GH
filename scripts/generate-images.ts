/**
 * Generates the two images every solution card shows, and commits them to the
 * repository by writing the files into `public/solutions/` and the paths back
 * into `data/solutions.json`.
 *
 * This runs once, by hand — not in CI and not in the browser. The published
 * site never calls an image API: it serves files that live in Git, so the
 * pictures are as permanent as the text beside them.
 *
 *   FAL_KEY=xxxx npm run generate:images              # everything still missing
 *   FAL_KEY=xxxx npm run generate:images -- --limit 4 # try a few first
 *   FAL_KEY=xxxx npm run generate:images -- --force   # redo images that exist
 *   npm run generate:images -- --dry-run              # print prompts, call nothing
 *
 * Provider: fal.ai FLUX schnell, the same one the project used before. Set
 * FAL_KEY to a key from https://fal.ai/dashboard/keys.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_FILE = join(root, 'data', 'solutions.json');
const CHALLENGES_FILE = join(root, 'data', 'challenges.json');
const IMAGE_DIR = join(root, 'public', 'solutions');

const SLOTS = ['mechanism', 'application'] as const;
type Slot = (typeof SLOTS)[number];

interface Challenge {
  id: string;
  category: string;
}

interface Solution {
  id: string;
  challenge_id: string | null;
  source_type: 'animal' | 'plant' | 'inanimate';
  title: string;
  image_mechanism: string | null;
  image_application: string | null;
  visual_mechanism: string | null;
  visual_application: string | null;
}

// ---------------------------------------------------------------------------
// Prompt construction — kept in step with src/lib/image-prompt.ts, which is
// what the app shows next to each frame.
// ---------------------------------------------------------------------------

const CATEGORY_BRIEF: Record<string, string> = {
  climate: 'passive cooling and urban climate regulation',
  water: 'urban water capture, filtration and drainage',
  structure: 'structural performance and material efficiency',
  energy: 'building energy efficiency and on-site generation',
  waste: 'circular material flows and waste processing',
  wellbeing: 'air quality, acoustics and biophilic comfort',
  safety: 'coastal and urban resilience',
  mobility: 'movement, flow and street design',
};

const MECHANISM_STYLE: Record<string, string> = {
  animal:
    'Wildlife macro photograph, natural habitat, razor-sharp focus on the anatomical structure, shallow depth of field, natural daylight, National Geographic style',
  plant:
    'Botanical macro photograph, extreme close-up of the living tissue, natural daylight, shallow depth of field, scientific nature photography',
  inanimate:
    'Documentary nature photograph of the formation, geological detail and texture, natural daylight, wide tonal range, large-format landscape photography',
};

const COMMON = 'No text, no lettering, no watermark, no logos.';

function englishName(title: string): string | null {
  const inParens = title.match(/\(([^)]*[A-Za-z][^)]*)\)/);
  if (inParens) return inParens[1].trim();
  const latinRun = title.match(/[A-Za-z][A-Za-z\s'-]{2,}/);
  return latinRun ? latinRun[0].trim() : null;
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function buildPrompt(solution: Solution, category: string | undefined, slot: Slot): string {
  const subject = englishName(solution.title);

  if (slot === 'mechanism') {
    return [
      `${MECHANISM_STYLE[solution.source_type]}.`,
      `Subject: ${subject ?? 'the natural mechanism'}.`,
      `${capitalise(solution.visual_mechanism ?? 'the structure responsible for the effect')}.`,
      'Uncluttered natural background, no human-made objects.',
      COMMON,
    ].join(' ');
  }

  return [
    `Architectural visualisation for ${category ? CATEGORY_BRIEF[category] : 'sustainable urban design'}.`,
    `${capitalise(solution.visual_application ?? 'a contemporary building expressing the same principle')}.`,
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

// ---------------------------------------------------------------------------

async function generate(prompt: string, apiKey: string): Promise<Buffer> {
  const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
    method: 'POST',
    headers: { Authorization: `Key ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, image_size: 'landscape_4_3', num_images: 1 }),
  });

  if (!response.ok) {
    throw new Error(`fal.ai returned ${response.status}: ${await response.text()}`);
  }

  const url = (await response.json())?.images?.[0]?.url;
  if (!url) throw new Error('fal.ai returned no image URL');

  const image = await fetch(url);
  if (!image.ok) throw new Error(`downloading the image failed with ${image.status}`);

  return Buffer.from(await image.arrayBuffer());
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const limitArg = args.indexOf('--limit');
  const limit = limitArg >= 0 ? Number(args[limitArg + 1]) : Infinity;

  const apiKey = process.env.FAL_KEY;
  if (!apiKey && !dryRun) {
    console.error('FAL_KEY is not set. Get one at https://fal.ai/dashboard/keys, then:');
    console.error('  FAL_KEY=xxxx npm run generate:images');
    console.error('Or preview the prompts without generating: npm run generate:images -- --dry-run');
    process.exit(1);
  }

  const solutions: Solution[] = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
  const challenges: Challenge[] = JSON.parse(readFileSync(CHALLENGES_FILE, 'utf8'));
  const categoryOf = new Map(challenges.map((c) => [c.id, c.category]));

  mkdirSync(IMAGE_DIR, { recursive: true });

  // Every slot that still needs a picture, flattened so --limit is predictable.
  const jobs: { solution: Solution; slot: Slot }[] = [];
  for (const solution of solutions) {
    for (const slot of SLOTS) {
      const field = slot === 'mechanism' ? 'image_mechanism' : 'image_application';
      if (!force && solution[field]) continue;
      jobs.push({ solution, slot });
    }
  }

  const selected = jobs.slice(0, limit);
  console.log(`${jobs.length} image(s) missing; generating ${selected.length}.`);

  let done = 0;
  let failed = 0;

  for (const { solution, slot } of selected) {
    const category = solution.challenge_id ? categoryOf.get(solution.challenge_id) : undefined;
    const prompt = buildPrompt(solution, category, slot);
    const fileName = `${solution.id}-${slot}.jpg`;

    if (dryRun) {
      console.log(`\n--- ${fileName}\n${prompt}`);
      done++;
      continue;
    }

    try {
      const bytes = await generate(prompt, apiKey!);
      writeFileSync(join(IMAGE_DIR, fileName), bytes);

      // Paths are relative to the site root so they survive the /<repo>/ prefix
      // that GitHub Pages adds.
      if (slot === 'mechanism') solution.image_mechanism = `solutions/${fileName}`;
      else solution.image_application = `solutions/${fileName}`;

      // Written after every image, so an interrupted run keeps what it produced.
      writeSolutions(solutions);

      done++;
      console.log(`[${done}/${selected.length}] ${fileName}`);
    } catch (error) {
      failed++;
      console.error(`FAILED ${fileName}: ${(error as Error).message}`);
    }
  }

  console.log(`\nDone: ${done} generated, ${failed} failed.`);
  if (!dryRun && done > 0) {
    console.log('Now commit public/solutions/ and data/solutions.json.');
  }
}

/** Writes one record per line, matching how the rest of the data file reads. */
function writeSolutions(solutions: Solution[]) {
  const body = solutions.map((s) => JSON.stringify(s)).join(', \n ');
  writeFileSync(DATA_FILE, `[${body}]`, 'utf8');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
