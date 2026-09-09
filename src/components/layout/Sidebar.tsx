import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Briefcase, Leaf, Search, Sparkles } from 'lucide-react';
import {
  categoryIcons,
  categoryLabels,
  countSolutionsForChallenge,
  populatedCategories,
  type ChallengeCategory,
} from '@/data';
import { filterChallenges } from '@/lib/search';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  onSearch: (query: string) => void;
}

export default function Sidebar({ onSearch }: SidebarProps) {
  const [category, setCategory] = useState<ChallengeCategory | 'all'>('all');
  const [query, setQuery] = useState('');
  const { savedSolutions } = useWorkspace();
  const location = useLocation();

  const activeId = location.pathname.match(/\/challenges\/(.+)/)?.[1];

  const visible = useMemo(() => {
    const matches = filterChallenges(query);
    return category === 'all' ? matches : matches.filter((c) => c.category === category);
  }, [category, query]);

  const runSearch = () => {
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
            <Leaf className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="font-display font-bold text-sm text-gradient">BioUrban</span>
        </Link>
      </div>

      <div className="px-2 py-1.5">
        <div className="relative">
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="חפש אתגר או פתרון..."
            aria-label="חיפוש בספרייה"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            className="pr-8 h-7 text-xs bg-sidebar-accent border-sidebar-border"
          />
        </div>
      </div>

      <div className="px-2 pb-1.5 flex flex-wrap gap-1">
        <CategoryChip active={category === 'all'} onClick={() => setCategory('all')} label="הכל" />
        {populatedCategories.map(({ category: cat, count }) => (
          <CategoryChip
            key={cat}
            active={category === cat}
            onClick={() => setCategory(cat)}
            label={`${categoryIcons[cat]} ${categoryLabels[cat]} ${count}`}
          />
        ))}
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="px-1.5 py-1 space-y-0.5">
          {visible.length > 0 ? (
            visible.map((c) => (
              <Link
                key={c.id}
                to={`/challenges/${c.id}`}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs transition-all duration-200 ${
                  c.id === activeId
                    ? 'bg-primary/15 text-primary border border-primary/30'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`}
              >
                <span className="text-sm shrink-0">{categoryIcons[c.category]}</span>
                <span className="truncate font-medium">{c.title}</span>
                <span className="mr-auto shrink-0 text-[10px] text-muted-foreground">
                  {countSolutionsForChallenge(c.id)}
                </span>
              </Link>
            ))
          ) : (
            <div className="text-center py-6 space-y-2">
              <span className="text-2xl block">🔍</span>
              <p className="text-[11px] text-muted-foreground">אין אתגר בשם הזה בספרייה</p>
              {query.trim() && (
                <button
                  onClick={runSearch}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-accent/20 text-accent text-[11px] font-medium hover:bg-accent/30 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  חפש גם בתוך הפתרונות
                </button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="px-2 py-1.5 border-t border-sidebar-border">
        <Link
          to="/workspace"
          className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
            location.pathname === '/workspace'
              ? 'bg-primary/15 text-primary'
              : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>סביבת עבודה</span>
          {savedSolutions.length > 0 && (
            <span className="mr-auto bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {savedSolutions.length}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}

function CategoryChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`text-[11px] leading-tight px-2 py-0.5 rounded-full transition-all duration-200 ${
        active
          ? 'bg-primary/20 text-primary border border-primary/40'
          : 'bg-sidebar-accent text-sidebar-foreground/70 border border-transparent hover:border-sidebar-border hover:text-sidebar-foreground'
      }`}
    >
      {label}
    </button>
  );
}
