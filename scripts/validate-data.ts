/**
 * Guards the JSON "database" in `data/`.
 *
 * With no Postgres behind the app there are no constraints, foreign keys or
 * enums to catch a bad edit — so CI runs this before every build. Editing the
 * data by hand is the intended workflow, and this is what makes that safe.
 */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const CATEGORIES = new Set([
  'climate',
  'water',
  'structure',
  'energy',
  'waste',
  'wellbeing',
  'safety',
  'mobility',
]);

const SOURCE_TYPES = new Set(['animal', 'plant', 'inanimate']);

const METRIC_SCALES: Record<string, number> = {
  coolingEffect: 100,
  energySavings: 100,
  waterEfficiency: 100,
  airQuality: 100,
  structuralStrength: 10,
  ecologicalSupport: 10,
  costEfficiency: 10,
};

const errors: string[] = [];
const warnings: string[] = [];

function load(name: string): unknown[] {
  const path = join(root, 'data', name);
  const parsed = JSON.parse(readFileSync(path, 'utf8'));
  if (!Array.isArray(parsed)) {
    errors.push(`${name}: top level must be an array`);
    return [];
  }
  return parsed;
}

const challenges = load('challenges.json') as Record<string, unknown>[];
const solutions = load('solutions.json') as Record<string, unknown>[];

const challengeIds = new Set<string>();

challenges.forEach((c, i) => {
  const where = `challenges[${i}] (${String(c.title ?? 'ללא כותרת')})`;

  if (typeof c.id !== 'string' || !c.id) errors.push(`${where}: missing id`);
  else if (challengeIds.has(c.id)) errors.push(`${where}: duplicate id ${c.id}`);
  else challengeIds.add(c.id);

  if (typeof c.title !== 'string' || !c.title.trim()) errors.push(`${where}: missing title`);
  if (typeof c.category !== 'string' || !CATEGORIES.has(c.category)) {
    errors.push(`${where}: category "${String(c.category)}" is not one of ${[...CATEGORIES].join(', ')}`);
  }
  if (c.description != null && typeof c.description !== 'string') {
    errors.push(`${where}: description must be a string or null`);
  }
});

const solutionIds = new Set<string>();
const challengesWithSolutions = new Set<string>();

solutions.forEach((s, i) => {
  const where = `solutions[${i}] (${String(s.title ?? 'ללא כותרת')})`;

  if (typeof s.id !== 'string' || !s.id) errors.push(`${where}: missing id`);
  else if (solutionIds.has(s.id)) errors.push(`${where}: duplicate id ${s.id}`);
  else solutionIds.add(s.id);

  for (const field of ['title', 'mechanism', 'application']) {
    if (typeof s[field] !== 'string' || !(s[field] as string).trim()) {
      errors.push(`${where}: missing ${field}`);
    }
  }

  if (typeof s.source_type !== 'string' || !SOURCE_TYPES.has(s.source_type)) {
    errors.push(`${where}: source_type "${String(s.source_type)}" is not one of ${[...SOURCE_TYPES].join(', ')}`);
  }

  // A card has two picture frames. Each needs a visual description to generate
  // from, and an image path that actually points at a file once generated.
  for (const slot of ['mechanism', 'application'] as const) {
    const visualField = `visual_${slot}`;
    const imageField = `image_${slot}`;

    const visual = s[visualField];
    if (visual == null || (typeof visual === 'string' && !visual.trim())) {
      warnings.push(`${where}: no ${visualField}, so its prompt falls back to generic wording`);
    } else if (typeof visual !== 'string') {
      errors.push(`${where}: ${visualField} must be a string or null`);
    }

    const image = s[imageField];
    if (image == null) continue;
    if (typeof image !== 'string' || !image.trim()) {
      errors.push(`${where}: ${imageField} must be a non-empty string or null`);
    } else if (/^https?:/.test(image)) {
      warnings.push(`${where}: ${imageField} points at an external URL, which can disappear`);
    } else if (image.startsWith('/')) {
      errors.push(`${where}: ${imageField} "${image}" must be relative to public/, not start with "/"`);
    } else if (!existsSync(join(root, 'public', image))) {
      errors.push(`${where}: ${imageField} "${image}" has no file at public/${image}`);
    }
  }

  if (s.challenge_id == null) {
    warnings.push(`${where}: no challenge_id, so it will not appear anywhere in the app`);
  } else if (typeof s.challenge_id !== 'string' || !challengeIds.has(s.challenge_id)) {
    errors.push(`${where}: challenge_id "${String(s.challenge_id)}" does not match any challenge`);
  } else {
    challengesWithSolutions.add(s.challenge_id);
  }

  if (s.metrics != null) {
    if (typeof s.metrics !== 'object' || Array.isArray(s.metrics)) {
      errors.push(`${where}: metrics must be an object`);
    } else {
      for (const [key, value] of Object.entries(s.metrics as Record<string, unknown>)) {
        const max = METRIC_SCALES[key];
        if (max === undefined) {
          errors.push(`${where}: unknown metric "${key}"`);
        } else if (typeof value !== 'number' || value < 0 || value > max) {
          errors.push(`${where}: metric "${key}" must be a number between 0 and ${max}, got ${String(value)}`);
        }
      }
    }
  }
});

for (const c of challenges) {
  if (typeof c.id === 'string' && !challengesWithSolutions.has(c.id)) {
    warnings.push(`challenge "${String(c.title)}" has no solutions`);
  }
}

for (const w of warnings) console.warn(`warning: ${w}`);

if (errors.length > 0) {
  for (const e of errors) console.error(`error: ${e}`);
  console.error(`\n${errors.length} problem(s) found in data/.`);
  process.exit(1);
}

console.log(
  `data/ is valid: ${challenges.length} challenges, ${solutions.length} solutions, ${warnings.length} warning(s).`,
);
