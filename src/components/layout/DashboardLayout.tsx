import { useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Menu, Moon, Sun } from 'lucide-react';
import Sidebar from './Sidebar';
import SearchModal from '@/components/search/SearchModal';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/contexts/ThemeContext';

export default function DashboardLayout() {
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setMobileOpen(false);
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="h-12 flex items-center justify-between px-4 border-b border-border/30 glass shrink-0 z-50">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          aria-label={theme === 'dark' ? 'עבור למצב בהיר' : 'עבור למצב כהה'}
          title={theme === 'dark' ? 'מצב בהיר' : 'מצב כהה'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-2">
        {isMobile && (
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors" aria-label="פתח תפריט ניווט">
                <Menu className="w-5 h-5 text-muted-foreground" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-72 bg-sidebar-background border-sidebar-border">
              <VisuallyHidden>
                <SheetTitle>ניווט</SheetTitle>
              </VisuallyHidden>
              <div className="h-full" onClick={() => setMobileOpen(false)}>
                <Sidebar onSearch={handleSearch} />
              </div>
            </SheetContent>
          </Sheet>
        )}
        <ai-menu />
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {!isMobile && (
          <aside className="w-[240px] shrink-0 border-l border-sidebar-border bg-sidebar-background overflow-hidden flex flex-col">
            <Sidebar onSearch={handleSearch} />
          </aside>
        )}

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <SearchModal query={searchQuery} onClose={() => setSearchQuery(null)} />
    </div>
  );
}
