import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { getChallenge, sourceTypeColors, sourceTypeLabels } from '@/data';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export default function WorkspaceCart() {
  const { savedSolutions, removeSolution } = useWorkspace();

  if (savedSolutions.length === 0) {
    return (
      <div className="glass rounded-xl p-10 text-center">
        <span className="text-5xl mb-4 block">🧪</span>
        <h3 className="font-display font-bold text-foreground mb-2">סביבת העבודה ריקה</h3>
        <p className="text-sm text-muted-foreground mb-4">
          הוסיפו פתרונות מספריית האתגרים כדי להתחיל לבנות את הפרויקט שלכם.
        </p>
        <Link
          to="/challenges"
          className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          לספריית האתגרים
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {savedSolutions.map((solution) => {
        const challenge = getChallenge(solution.challenge_id ?? undefined);
        return (
          <div key={solution.id} className="glass rounded-xl p-4 flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${sourceTypeColors[solution.source_type]}`}>
                  {sourceTypeLabels[solution.source_type]}
                </span>
                {challenge && (
                  <Link
                    to={`/challenges/${challenge.id}`}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors truncate"
                  >
                    {challenge.title}
                  </Link>
                )}
              </div>
              <h4 className="font-semibold text-foreground truncate">{solution.title}</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{solution.application}</p>
            </div>
            <button
              onClick={() => removeSolution(solution.id)}
              className="text-muted-foreground hover:text-destructive transition-colors p-1"
              aria-label={`הסר את ${solution.title} מסביבת העבודה`}
              title="הסר"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
