import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { categoryIcons, categoryLabels, challenges, populatedCategories, type ChallengeCategory } from '@/data';
import ChallengeCard from '@/components/challenges/ChallengeCard';

export default function ChallengeLibrary() {
  const [selected, setSelected] = useState<ChallengeCategory | null>(null);

  const visible = useMemo(
    () => (selected ? challenges.filter((c) => c.category === selected) : challenges),
    [selected],
  );

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl">
      <div>
        <h1 className="font-display font-bold text-3xl mb-2">ספריית אתגרים</h1>
        <p className="text-muted-foreground text-sm">בחרו קטגוריה כדי לסנן את האתגרים העירוניים</p>
      </div>

      <div className="flex flex-wrap gap-2 pb-2">
        <button
          onClick={() => setSelected(null)}
          aria-pressed={selected === null}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selected === null
              ? 'bg-primary text-primary-foreground'
              : 'border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50'
          }`}
        >
          כל הקטגוריות
        </button>

        {populatedCategories.map(({ category, count }) => (
          <button
            key={category}
            onClick={() => setSelected(category)}
            aria-pressed={selected === category}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selected === category
                ? 'bg-primary text-primary-foreground'
                : 'border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50'
            }`}
          >
            <span className="text-base">{categoryIcons[category]}</span>
            {categoryLabels[category]}
            <span className="opacity-60">{count}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="bg-muted/20 border border-primary/30 rounded-lg p-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-foreground">מסנן פעיל: {categoryLabels[selected]}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {visible.length === 1 ? 'מוצג אתגר אחד' : `מוצגים ${visible.length} אתגרים`} בקטגוריה זו
            </p>
          </div>
          <button
            onClick={() => setSelected(null)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="הסר מסנן"
            title="הסר מסנן"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {visible.map((c) => (
          <ChallengeCard key={c.id} challenge={c} />
        ))}
      </div>
    </div>
  );
}
