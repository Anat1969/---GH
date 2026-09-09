/**
 * The architectural reading shown on each solution card.
 *
 * The previous version called this an "AI interpretation" but was in fact a
 * lookup table keyed only on the category, so every solution in a category
 * showed identical (and partly garbled) text. It is now composed from the
 * solution itself, so two solutions never read the same.
 */
import {
  categoryLabels,
  sourceTypeLabels,
  type ChallengeCategory,
  type Solution,
  type SourceType,
} from '@/data';

/** What the discipline is actually optimising for, per urban challenge domain. */
const CATEGORY_FRAMING: Record<ChallengeCategory, string> = {
  climate:
    'ויסות תרמי פסיבי — הפחתת עומסי חום בלי להישען על מיזוג מכני, דרך גאומטריה, חומריות והצללה',
  water:
    'ניהול מחזור המים במגרש — קליטה, השהיה, סינון ושימוש חוזר, במקום סילוק מהיר לתשתית העירונית',
  energy:
    'צמצום הביקוש לאנרגיה לפני ייצורה — אוריינטציה, מעטפת ובקרה שמורידות את העומס הבסיסי של הבניין',
  structure:
    'יעילות חומרית — השגת חוזק ונוקשות במינימום מסה, בדרך שהטבע מגיע אליה דרך היררכיה ומבנה ולא דרך עובי',
  waste:
    'סגירת מעגל החומרים — תכנון שבו תוצר הלוואי של תהליך אחד הוא חומר הגלם של התהליך הבא',
  wellbeing:
    'איכות החוויה היומיומית — אור, אוויר, קול וקשר לטבע כפרמטרים תכנוניים ולא כקישוט',
  safety:
    'עמידות מבוזרת — מערכת שמכילה כשל מקומי בלי לקרוס, בהשראת מנגנוני הגנה והתרעה בטבע',
  mobility:
    'זרימה עירונית — היררכיית מסלולים ותיאום תנועה שמפחיתים חיכוך במקום להוסיף נפח',
};

/** How each source of inspiration typically translates into built form. */
const SOURCE_TRANSLATION: Record<SourceType, string> = {
  animal:
    'התרגום האדריכלי עובר דרך התנהגות ומנגנון: מה האורגניזם עושה, באילו תנאים, ואיזה רכיב בבניין יכול לבצע את אותה פעולה',
  plant:
    'התרגום האדריכלי עובר דרך המעטפת: הצמח פותר את הבעיה בשכבת המגע עם הסביבה, ולכן החזית והגג הם מקום ההתערבות הטבעי',
  inanimate:
    'התרגום האדריכלי עובר דרך החומר עצמו: המנגנון נובע ממבנה פנימי ומתכונות פיזיקליות, ולכן הוא מיושם במפרט החומרים ולא במערכת נוספת',
};

/**
 * Composes a short reading of one solution: what domain it belongs to, how its
 * source of inspiration usually becomes form, and what its own metrics say.
 */
export function architecturalInterpretation(
  solution: Solution,
  category: ChallengeCategory | undefined,
): string {
  const framing = category
    ? CATEGORY_FRAMING[category]
    : 'שילוב בין עיקרון טבעי מוכח לבין צורך עירוני מוגדר';
  const domain = category ? categoryLabels[category] : 'תכנון עירוני';
  const translation = SOURCE_TRANSLATION[solution.source_type];
  const source = sourceTypeLabels[solution.source_type];

  return [
    `הפתרון שייך לתחום ה${domain}, שבו השאלה המרכזית היא ${framing}.`,
    `מקור ההשראה נמצא בקטגוריית ${source}, ולכן ${translation}.`,
    strengthsSentence(solution),
  ]
    .filter(Boolean)
    .join(' ');
}

/** Names the two metrics this solution actually leads on, relative to its own scale. */
function strengthsSentence(solution: Solution): string {
  const labels: Record<string, string> = {
    coolingEffect: 'הפחתת עומס חום',
    energySavings: 'חיסכון באנרגיה',
    waterEfficiency: 'יעילות מים',
    airQuality: 'איכות אוויר',
    structuralStrength: 'ביצועים מבניים',
    ecologicalSupport: 'ערך אקולוגי',
    costEfficiency: 'היתכנות כלכלית',
  };

  const ranked = Object.entries(solution.metrics)
    .filter(([, value]) => typeof value === 'number')
    // Metrics use two scales (0-100 and 0-10); normalise before comparing them.
    .map(([key, value]) => ({
      key,
      normalised: key === 'structuralStrength' || key === 'ecologicalSupport' || key === 'costEfficiency'
        ? (value as number) * 10
        : (value as number),
    }))
    .sort((a, b) => b.normalised - a.normalised)
    .slice(0, 2)
    .map((m) => labels[m.key])
    .filter(Boolean);

  if (ranked.length === 0) return '';
  if (ranked.length === 1) return `החוזק הבולט שלו הוא ${ranked[0]}.`;
  return `החוזקות הבולטות שלו הן ${ranked[0]} ו${ranked[1]}.`;
}
