import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  categoryLabels,
  categoryIcons,
  getChallenge,
  getSolutionsForChallenge,
  SOURCE_TYPES,
  sourceTypeIcons,
  sourceTypeLabels,
  type SourceType,
} from '@/data';
import SolutionCard from '@/components/solutions/SolutionCard';

const SOURCE_STYLES: Record<SourceType, string> = {
  animal: 'border-amber-500/50 bg-amber-500/10 text-amber-500',
  plant: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500',
  inanimate: 'border-slate-400/50 bg-slate-400/10 text-slate-400',
};

export default function ChallengeDetail() {
  const { id } = useParams<{ id: string }>();
  const challenge = getChallenge(id);
  const solutions = useMemo(() => getSolutionsForChallenge(id), [id]);
  const [selectedType, setSelectedType] = useState<SourceType | null>(null);

  // A challenge can hold several solutions from the same source, so the
  // selection shows all of them rather than only the first match.
  const shown = useMemo(
    () => (selectedType ? solutions.filter((s) => s.source_type === selectedType) : []),
    [solutions, selectedType],
  );

  if (!challenge) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center space-y-4">
          <span className="text-5xl block">❌</span>
          <p>האתגר לא נמצא</p>
          <Link
            to="/challenges"
            className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm"
          >
            חזרה לספריית האתגרים
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl">
      <div className="glass rounded-xl p-5 glow-primary">
        <div className="flex items-start gap-4">
          <span className="text-4xl">{categoryIcons[challenge.category]}</span>
          <div className="space-y-1.5">
            <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/30">
              {categoryLabels[challenge.category]}
            </span>
            <h1 className="font-display font-black text-2xl">{challenge.title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{challenge.description}</p>
          </div>
        </div>
      </div>

      {solutions.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground space-y-2">
          <span className="text-4xl block">🌱</span>
          <p>לאתגר הזה עוד לא נוספו פתרונות.</p>
        </div>
      ) : (
        <>
          <div>
            <h2 className="font-display font-bold text-lg mb-3">בחרו מקור השראה</h2>
            <div className="grid grid-cols-3 gap-3">
              {SOURCE_TYPES.map((type) => {
                const count = solutions.filter((s) => s.source_type === type).length;
                const isSelected = selectedType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(isSelected ? null : type)}
                    disabled={count === 0}
                    aria-pressed={isSelected}
                    className={`py-4 px-3 rounded-xl border text-center font-display font-bold text-lg transition-all duration-300 ${
                      count === 0
                        ? 'border-border/30 bg-muted/10 text-muted-foreground/30 cursor-not-allowed'
                        : isSelected
                          ? `${SOURCE_STYLES[type]} ring-2 ring-primary shadow-lg`
                          : `${SOURCE_STYLES[type]} opacity-70 hover:opacity-100`
                    }`}
                  >
                    <span className="ml-1">{sourceTypeIcons[type]}</span>
                    {sourceTypeLabels[type]}
                    {count > 0 && <span className="text-sm font-normal opacity-70"> ({count})</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedType === null ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              בחרו אחד משלושת מקורות ההשראה כדי לראות את הפתרונות.
            </p>
          ) : (
            <div className="space-y-6">
              {shown.map((solution) => (
                <SolutionCard key={solution.id} solution={solution} challengeCategory={challenge.category} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
