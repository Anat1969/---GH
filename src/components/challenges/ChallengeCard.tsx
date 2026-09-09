import { Link } from 'react-router-dom';
import {
  categoryColors,
  categoryIcons,
  categoryLabels,
  countSolutionsForChallenge,
  type Challenge,
} from '@/data';

export default function ChallengeCard({ challenge }: { challenge: Challenge }) {
  // Counted from the bundled data — the old version fired one database query
  // per card, which meant 24 round trips just to render the library page.
  const solutionCount = countSolutionsForChallenge(challenge.id);

  return (
    <Link
      to={`/challenges/${challenge.id}`}
      className="group rounded-lg border border-border/50 p-3 flex flex-col gap-2 hover:border-primary/50 hover:bg-muted/20 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="p-1.5 rounded-md bg-muted/50 group-hover:bg-primary/10 transition-colors">
          <span className="text-lg block">{categoryIcons[challenge.category]}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColors[challenge.category]}`}>
          {categoryLabels[challenge.category]}
        </span>
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-tight">
          {challenge.title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{challenge.description}</p>
      </div>

      <div className="mt-auto flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
        <span className="font-semibold">{solutionCount}</span>
        <span>{solutionCount === 1 ? 'פתרון' : 'פתרונות'}</span>
      </div>
    </Link>
  );
}
