import MetricsChart from '@/components/solutions/MetricsChart';
import WorkspaceCart from '@/components/workspace/WorkspaceCart';
import WorkspaceSummary from '@/components/workspace/WorkspaceSummary';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export default function Workspace() {
  const { savedSolutions } = useWorkspace();

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl">
      <div>
        <h1 className="font-display font-bold text-3xl mb-2">סביבת עבודה</h1>
        <p className="text-muted-foreground text-sm">ניהול והשוואה של הפתרונות שבחרתם לפרויקט</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <WorkspaceCart />
          {/* The chart compares up to three series before the colours run out. */}
          {savedSolutions.length >= 2 && <MetricsChart solutions={savedSolutions.slice(0, 3)} />}
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <WorkspaceSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
