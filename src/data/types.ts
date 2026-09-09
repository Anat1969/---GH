export const CATEGORIES = [
  'climate',
  'water',
  'structure',
  'energy',
  'waste',
  'wellbeing',
  'safety',
  'mobility',
] as const;

export const SOURCE_TYPES = ['animal', 'plant', 'inanimate'] as const;

export type ChallengeCategory = (typeof CATEGORIES)[number];
export type SourceType = (typeof SOURCE_TYPES)[number];

export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  category: ChallengeCategory;
}

/** Every metric is optional — a solution only carries the ones that apply to it. */
export interface ImpactMetrics {
  coolingEffect?: number;
  energySavings?: number;
  ecologicalSupport?: number;
  waterEfficiency?: number;
  structuralStrength?: number;
  airQuality?: number;
  costEfficiency?: number;
}

export interface Solution {
  id: string;
  challenge_id: string | null;
  source_type: SourceType;
  title: string;
  mechanism: string;
  application: string;
  image_url: string | null;
  metrics: ImpactMetrics;
}

export const categoryLabels: Record<ChallengeCategory, string> = {
  climate: 'אקלים',
  energy: 'אנרגיה',
  water: 'מים',
  structure: 'מבנה',
  waste: 'פסולת',
  wellbeing: 'רווחה',
  safety: 'בטיחות',
  mobility: 'ניידות',
};

export const categoryIcons: Record<ChallengeCategory, string> = {
  climate: '🌡️',
  energy: '⚡',
  water: '💧',
  structure: '🏗️',
  waste: '♻️',
  wellbeing: '🌿',
  safety: '🛡️',
  mobility: '🚶',
};

export const categoryColors: Record<ChallengeCategory, string> = {
  climate: 'border-bio-blue/40 text-bio-blue',
  energy: 'border-bio-amber/40 text-bio-amber',
  water: 'border-bio-teal/40 text-bio-teal',
  structure: 'border-bio-rose/40 text-bio-rose',
  waste: 'border-bio-green/40 text-bio-green',
  wellbeing: 'border-bio-green/40 text-bio-green',
  safety: 'border-bio-rose/40 text-bio-rose',
  mobility: 'border-bio-blue/40 text-bio-blue',
};

export const sourceTypeLabels: Record<SourceType, string> = {
  animal: 'בעלי חיים',
  plant: 'צמחים',
  inanimate: 'דומם',
};

export const sourceTypeIcons: Record<SourceType, string> = {
  animal: '🐾',
  plant: '🌿',
  inanimate: '🪨',
};

export const sourceTypeColors: Record<SourceType, string> = {
  animal: 'bg-bio-amber/20 text-bio-amber border-bio-amber/30',
  plant: 'bg-bio-green/20 text-bio-green border-bio-green/30',
  inanimate: 'bg-bio-blue/20 text-bio-blue border-bio-blue/30',
};

/** Metric display metadata, shared by the solution card and the comparison chart. */
export const METRICS = [
  { key: 'coolingEffect', label: 'קירור', max: 100, suffix: '%', description: 'יכולת הפתרון להוריד טמפרטורה באזור' },
  { key: 'energySavings', label: 'אנרגיה', max: 100, suffix: '%', description: 'שיעור החיסכון בצריכת האנרגיה' },
  { key: 'waterEfficiency', label: 'מים', max: 100, suffix: '%', description: 'יעילות השימוש והחיסכון במים' },
  { key: 'airQuality', label: 'אוויר', max: 100, suffix: '%', description: 'שיפור איכות האוויר המקומית' },
  { key: 'structuralStrength', label: 'חוזק', max: 10, suffix: '/10', description: 'עמידות מבנית ויכולת נשיאת עומסים' },
  { key: 'ecologicalSupport', label: 'אקולוגיה', max: 10, suffix: '/10', description: 'תמיכה במערכות אקולוגיות ובמגוון המינים' },
  { key: 'costEfficiency', label: 'עלות', max: 10, suffix: '/10', description: 'יעילות כלכלית וערך ההשקעה' },
] as const satisfies readonly {
  key: keyof ImpactMetrics;
  label: string;
  max: number;
  suffix: string;
  description: string;
}[];
