import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, X } from 'lucide-react';
import { categoryIcons, categoryLabels, sourceTypeColors, sourceTypeLabels } from '@/data';
import { search } from '@/lib/search';

interface SearchModalProps {
  /** The query to run, or null when the modal is closed. */
  query: string | null;
  onClose: () => void;
}

export default function SearchModal({ query, onClose }: SearchModalProps) {
  // Escape closes the modal, matching the backdrop click.
  useEffect(() => {
    if (query === null) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [query, onClose]);

  const results = useMemo(() => (query ? search(query) : null), [query]);

  if (query === null || !results) return null;

  const empty = results.challenges.length === 0 && results.solutions.length === 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-16" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={onClose} />

      <div className="relative glass rounded-2xl glow-accent max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6 md:p-8 space-y-6">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
          aria-label="סגור חיפוש"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-accent">
          <Search className="w-5 h-5" />
          <span className="text-sm font-medium">תוצאות עבור "{results.query}"</span>
        </div>

        {empty ? (
          <div className="text-center py-12 space-y-3">
            <span className="text-5xl block">🔍</span>
            <p className="font-display font-bold text-lg">לא נמצאו תוצאות</p>
            <p className="text-sm text-muted-foreground">
              נסו מונח כללי יותר — למשל "קירור", "מים", "בידוד" או "אנרגיה".
            </p>
          </div>
        ) : (
          <>
            {results.challenges.length > 0 && (
              <section className="space-y-2">
                <h3 className="font-display font-bold text-sm text-muted-foreground">אתגרים</h3>
                {results.challenges.map(({ challenge }) => (
                  <Link
                    key={challenge.id}
                    to={`/challenges/${challenge.id}`}
                    onClick={onClose}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/20 transition-all"
                  >
                    <span className="text-xl shrink-0">{categoryIcons[challenge.category]}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm truncate">{challenge.title}</h4>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {categoryLabels[challenge.category]}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{challenge.description}</p>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                  </Link>
                ))}
              </section>
            )}

            {results.solutions.length > 0 && (
              <section className="space-y-2">
                <h3 className="font-display font-bold text-sm text-muted-foreground">פתרונות</h3>
                {results.solutions.map(({ solution, challenge }) => (
                  <Link
                    key={solution.id}
                    to={challenge ? `/challenges/${challenge.id}` : '/challenges'}
                    onClick={onClose}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/20 transition-all"
                  >
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 mt-0.5 ${sourceTypeColors[solution.source_type]}`}
                    >
                      {sourceTypeLabels[solution.source_type]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm truncate">{solution.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{solution.application}</p>
                      {challenge && (
                        <p className="text-[11px] text-muted-foreground/70 mt-1">בתוך: {challenge.title}</p>
                      )}
                    </div>
                    <ArrowLeft className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                  </Link>
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
