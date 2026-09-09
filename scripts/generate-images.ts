/**
 * Generates the two images every solution card shows, and commits them to the
 * repository by writing the files into `public/solutions/` and the paths back
 * into `data/solutions.json`.
 *
 * This runs once, by hand — not in CI and not in the browser. The published
 * site never calls an image API: it serves files that live in Git, so the
 * pictures are as permanent as the text beside them.
 *
 *   npm run generate:images -- --dry-run              # print prompts, call nothing
 *   FAL_KEY=xxxx npm run generate:images              # everything still missing
 *   FAL_KEY=xxxx npm run generate:images -- --limit 4 # try a few first
 *   FAL_KEY=xxxx npm run generate:images -- --force   # redo images that exist
 *   npm run generate:images -- --only <solution-id>   # one solution only
 *
 * Provider: fal.ai FLUX schnell, the same one the project used before. Set
 * FAL_KEY to a key from https://fal.ai/dashboard/keys.
 *
 * The prompts come from src/lib/image-prompt.ts — the exact module the app uses
 * to show them — so what a card displays is what was generated.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPrompt, type ImageSlot } from '../src/lib/image-prompt';
import type { Challenge, Solution } from '../src/data/types';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_FILE = join(root, 'data', 'solutions.json');
const CHALLENGES_FILE = join(root, 'data', 'challenges.json');
const IMAGE_DIR = join(root, 'public', 'solutions');

const SLOTS: ImageSlot[] = ['mechanism', 'application'];

async function generate(prompt: string, apiKey: string): Promise<Buffer> {
  const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
    method: 'POST',
    headers: { Authorization: `Key ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, image_size: 'landscape_4_3', num_images: 1 }),
  });

  if (!response.ok) {
    throw new Error(`fal.ai returned ${response.status}: ${await response.text()}`);
  }

  // Node types `json()` as unknown, so the shape is narrowed here.
  const body = (await response.json()) as { images?: { url?: string }[] };
  const url = body.images?.[0]?.url;
  if (!url) throw new Error('fal.ai returned no image URL');

  const image = await fetch(url);
  if (!image.ok) throw new Error(`downloading the image failed with ${image.status}`);

  return Buffer.from(await image.arrayBuffer());
}

/** Writes one record per line, matching how the rest of the data file reads. */
function writeSolutions(solutions: Solution[]): void {
  writeFileSync(DATA_FILE, `[${solutions.map((s) => JSON.stringify(s)).join(', \n ')}]`, 'utf8');
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');

  const limitIndex = args.indexOf('--limit');
  const limit = limitIndex >= 0 ? Number(args[limitIndex + 1]) : Number.POSITIVE_INFINITY;

  const onlyIndex = args.indexOf('--only');
  const only = onlyIndex >= 0 ? args[onlyIndex + 1] : undefined;

  const apiKey = process.env.FAL_KEY;
  if (!apiKey && !dryRun) {
    console.error('FAL_KEY is not set. Get one at https://fal.ai/dashboard/keys, then:');
    console.error('  FAL_KEY=xxxx npm run generate:images');
    console.error('Or preview the prompts without generating: npm run generate:images -- --dry-run');
    process.exit(1);
  }

  const solutions = JSON.parse(readFileSync(DATA_FILE, 'utf8')) as Solution[];
  const challenges = JSON.parse(readFileSync(CHALLENGES_FILE, 'utf8')) as Challenge[];
  const categoryOf = new Map(challenges.map((c) => [c.id, c.category]));

  mkdirSync(IMAGE_DIR, { recursive: true });

  // Every slot that still needs a picture, flattened so --limit is predictable.
  const jobs: { solution: Solution; slot: ImageSlot }[] = [];
  for (const solution of solutions) {
    if (only && !solution.id.startsWith(only)) continue;
    for (const slot of SLOTS) {
      const existing = slot === 'mechanism' ? solution.image_mechanism : solution.image_application;
      if (!force && existing) continue;
      jobs.push({ solution, slot });
    }
  }

  const selected = jobs.slice(0, limit);
  console.log(`${jobs.length} image(s) missing; ${dryRun ? 'previewing' : 'generating'} ${selected.length}.`);

  let done = 0;
  let failed = 0;

  for (const { solution, slot } of selected) {
    const category = solution.challenge_id ? categoryOf.get(solution.challenge_id) : undefined;
    const prompt = buildPrompt(solution, category, slot);
    const fileName = `${solution.id}-${slot}.jpg`;

    if (dryRun) {
      console.log(`\n--- ${fileName}\n${solution.title}\n${prompt}`);
      done++;
      continue;
    }

    try {
      const bytes = await generate(prompt, apiKey!);
      writeFileSync(join(IMAGE_DIR, fileName), bytes);

      // Paths are relative to the site root so they survive the /<repo>/ prefix
      // GitHub Pages adds.
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

  console.log(`\nDone: ${done} ${dryRun ? 'previewed' : 'generated'}, ${failed} failed.`);
  if (!dryRun && done > 0) {
    console.log('Now commit public/solutions/ and data/solutions.json.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
