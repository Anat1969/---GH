import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { getChallenge, METRICS, type Solution } from '@/data';
import { readJSON, WORKSPACE_KEY, writeJSON } from '@/lib/storage';

interface WorkspaceContextType {
  savedSolutions: Solution[];
  addSolution: (solution: Solution) => void;
  removeSolution: (solutionId: string) => void;
  isSaved: (solutionId: string) => boolean;
  clearWorkspace: () => void;
  exportMarkdown: () => string;
  exportJSON: () => string;
  importJSON: (raw: string) => { ok: boolean; message: string };
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [savedSolutions, setSavedSolutions] = useState<Solution[]>(() =>
    readJSON<Solution[]>(WORKSPACE_KEY, []),
  );

  useEffect(() => {
    writeJSON(WORKSPACE_KEY, savedSolutions);
  }, [savedSolutions]);

  const addSolution = useCallback((solution: Solution) => {
    setSavedSolutions((prev) => {
      if (prev.some((s) => s.id === solution.id)) return prev;
      toast.success('הפתרון נוסף לסביבת העבודה');
      return [...prev, solution];
    });
  }, []);

  const removeSolution = useCallback((solutionId: string) => {
    setSavedSolutions((prev) => prev.filter((s) => s.id !== solutionId));
  }, []);

  const savedIds = useMemo(() => new Set(savedSolutions.map((s) => s.id)), [savedSolutions]);

  const isSaved = useCallback((solutionId: string) => savedIds.has(solutionId), [savedIds]);

  const clearWorkspace = useCallback(() => setSavedSolutions([]), []);

  const exportMarkdown = useCallback(() => {
    const lines = [
      '# סיכום פרויקט — BioUrban',
      '',
      `תאריך: ${new Date().toLocaleDateString('he-IL')}`,
      `סה"כ פתרונות שנבחרו: ${savedSolutions.length}`,
      '',
      '---',
      '',
    ];

    savedSolutions.forEach((s, i) => {
      const challenge = getChallenge(s.challenge_id ?? undefined);
      lines.push(`## ${i + 1}. ${s.title}`);
      if (challenge) lines.push(`**אתגר:** ${challenge.title}`);
      lines.push(`**מנגנון ביולוגי:** ${s.mechanism}`);
      lines.push(`**יישום אדריכלי:** ${s.application}`);

      const present = METRICS.filter((m) => s.metrics[m.key] != null);
      if (present.length > 0) {
        lines.push('', '**מדדי השפעה:**');
        present.forEach((m) => lines.push(`- ${m.label}: ${s.metrics[m.key]}${m.suffix}`));
      }
      lines.push('', '---', '');
    });

    return lines.join('\n');
  }, [savedSolutions]);

  /**
   * The JSON export is the round-trippable one: a visitor can keep it, commit it
   * to a repo, or hand it to a colleague who imports it on their own machine.
   */
  const exportJSON = useCallback(
    () =>
      JSON.stringify(
        {
          format: 'biourban-workspace',
          version: 1,
          exportedAt: new Date().toISOString(),
          solutions: savedSolutions,
        },
        null,
        2,
      ),
    [savedSolutions],
  );

  const importJSON = useCallback((raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      const incoming: unknown = parsed?.solutions ?? parsed;

      if (!Array.isArray(incoming)) {
        return { ok: false, message: 'הקובץ אינו קובץ סביבת עבודה תקין' };
      }

      const valid = incoming.filter(
        (s): s is Solution =>
          !!s && typeof s === 'object' && typeof (s as Solution).id === 'string' && typeof (s as Solution).title === 'string',
      );

      if (valid.length === 0) {
        return { ok: false, message: 'לא נמצאו פתרונות בקובץ' };
      }

      // Merge outside the state updater so the count reported back to the caller
      // is accurate and the updater itself stays free of side effects.
      const seen = new Set(savedSolutions.map((s) => s.id));
      const additions: Solution[] = [];
      for (const s of valid) {
        if (seen.has(s.id)) continue;
        seen.add(s.id);
        additions.push({ ...s, metrics: s.metrics ?? {} });
      }

      if (additions.length > 0) {
        setSavedSolutions((prev) => [...prev, ...additions]);
      }

      return {
        ok: true,
        message:
          additions.length > 0
            ? `יובאו ${additions.length} פתרונות`
            : 'כל הפתרונות בקובץ כבר קיימים',
      };
    } catch {
      return { ok: false, message: 'שגיאה בקריאת הקובץ' };
    }
  }, [savedSolutions]);

  const value = useMemo(
    () => ({
      savedSolutions,
      addSolution,
      removeSolution,
      isSaved,
      clearWorkspace,
      exportMarkdown,
      exportJSON,
      importJSON,
    }),
    [savedSolutions, addSolution, removeSolution, isSaved, clearWorkspace, exportMarkdown, exportJSON, importJSON],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
