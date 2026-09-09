/**
 * Browser-local persistence.
 *
 * The published content lives in Git; anything a visitor produces (their saved
 * solutions, images they attach) stays on their own device. There is no server
 * to write to, so every read is defensive: private windows, blocked site data
 * and quota errors all have to degrade to "nothing stored" rather than throw.
 */

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage is full or unavailable — the app stays usable for this session.
  }
}

export const WORKSPACE_KEY = 'biourban-workspace';
export const THEME_KEY = 'biourban-theme';
const IMAGES_KEY = 'biourban-solution-images';

/** Images a visitor attaches to a solution card, kept as data URLs per solution. */
export function getStoredImage(solutionId: string): string | null {
  return readJSON<Record<string, string>>(IMAGES_KEY, {})[solutionId] ?? null;
}

export function storeImage(solutionId: string, dataUrl: string): void {
  const all = readJSON<Record<string, string>>(IMAGES_KEY, {});
  all[solutionId] = dataUrl;
  writeJSON(IMAGES_KEY, all);
}

export function clearStoredImage(solutionId: string): void {
  const all = readJSON<Record<string, string>>(IMAGES_KEY, {});
  delete all[solutionId];
  writeJSON(IMAGES_KEY, all);
}

/**
 * Turns an `image_url` from the data files into a URL the browser can load.
 *
 * A relative path like "solutions/termite-mound.jpg" would otherwise resolve
 * against the current route (/challenges/<id>/...) rather than the site root,
 * which on GitHub Pages also carries the repo prefix.
 */
export function resolveImageUrl(url: string | null): string | null {
  if (!url) return null;
  if (/^(https?:|data:|blob:)/.test(url)) return url;
  return `${import.meta.env.BASE_URL}${url.replace(/^\//, '')}`;
}

/** Triggers a browser download — used for the workspace exports. */
export function downloadFile(filename: string, contents: string, mimeType: string): void {
  const blob = new Blob([contents], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
