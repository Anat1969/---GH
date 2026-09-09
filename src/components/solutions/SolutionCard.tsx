import { useMemo, useState } from 'react';
import { BarChart3, Check, ChevronDown, Plus } from 'lucide-react';
import {
  METRICS,
  sourceTypeColors,
  sourceTypeLabels,
  type ChallengeCategory,
  type Solution,
} from '@/data';
import { architecturalInterpretation } from '@/lib/interpretation';
import { buildApplicationPrompt, buildMechanismPrompt } from '@/lib/image-prompt';
import SolutionImageFrame from './SolutionImageFrame';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface SolutionCardProps {
  solution: Solution;
  challengeCategory?: ChallengeCategory;
}

export default function SolutionCard({ solution, challengeCategory }: SolutionCardProps) {
  const { addSolution, removeSolution, isSaved } = useWorkspace();
  const saved = isSaved(solution.id);
  const [showMetrics, setShowMetrics] = useState(false);

  const mechanismPrompt = useMemo(() => buildMechanismPrompt(solution), [solution]);
  const applicationPrompt = useMemo(
    () => buildApplicationPrompt(solution, challengeCategory),
    [solution, challengeCategory],
  );

  const interpretation = useMemo(
    () => architecturalInterpretation(solution, challengeCategory),
    [solution, challengeCategory],
  );

  const metricEntries = useMemo(
    () => METRICS.filter((m) => solution.metrics[m.key] != null),
    [solution.metrics],
  );

  return (
    <article className="border border-border/50 rounded-xl overflow-hidden">
      <header className="flex items-start justify-between gap-3 p-5 pb-0">
        <h3 className="font-display font-bold text-2xl leading-tight">{solution.title}</h3>
        <span
          className={`shrink-0 text-xs px-2.5 py-1 rounded-full border ${sourceTypeColors[solution.source_type]}`}
        >
          {sourceTypeLabels[solution.source_type]}
        </span>
      </header>

      {/* Each half gets its own picture: the mechanism as it appears in nature,
          and the architectural application it inspires. */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        <section className="space-y-3">
          <h4 className="font-semibold text-primary text-sm">מנגנון ביולוגי</h4>
          <SolutionImageFrame
            solutionId={solution.id}
            slot="mechanism"
            publishedUrl={solution.image_mechanism}
            prompt={mechanismPrompt}
            alt={`המנגנון הביולוגי: ${solution.title}`}
          />
          <p className="text-sm text-muted-foreground leading-relaxed">{solution.mechanism}</p>
        </section>

        <section className="space-y-3">
          <h4 className="font-semibold text-accent text-sm">יישום אדריכלי</h4>
          <SolutionImageFrame
            solutionId={solution.id}
            slot="application"
            publishedUrl={solution.image_application}
            prompt={applicationPrompt}
            alt={`היישום האדריכלי: ${solution.title}`}
          />
          <p className="text-sm text-muted-foreground leading-relaxed">{solution.application}</p>
        </section>
      </div>

      <div className="px-5 pb-5 space-y-5">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
          <h4 className="font-display font-bold text-base text-primary mb-3">פרשנות אדריכלית</h4>
          <p className="text-base text-foreground leading-relaxed">{interpretation}</p>
        </div>

        {metricEntries.length > 0 && (
          <div>
            <button
              onClick={() => setShowMetrics((v) => !v)}
              aria-expanded={showMetrics}
              className="flex items-center justify-between w-full py-2.5 px-4 rounded-lg border border-border/50 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
            >
              <span className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                מדדי ביצוע
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showMetrics ? 'rotate-180' : ''}`} />
            </button>

            {showMetrics && (
              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
                {metricEntries.map((m) => {
                  const value = solution.metrics[m.key] ?? 0;
                  return (
                    <div key={m.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{m.label}</span>
                        <span className="font-semibold text-primary">
                          {value}
                          {m.suffix}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-l from-primary to-accent transition-all duration-1000 ease-out"
                          style={{ width: `${(value / m.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => (saved ? removeSolution(solution.id) : addSolution(solution))}
          className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            saved
              ? 'bg-primary/20 text-primary border border-primary/30'
              : 'border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30'
          }`}
        >
          {saved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {saved ? 'נשמר בסביבת העבודה' : 'הוסף לסביבת העבודה'}
        </button>
      </div>
    </article>
  );
}
