import { useRef } from 'react';
import { Download, FileJson, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { downloadFile } from '@/lib/storage';

export default function WorkspaceSummary() {
  const { savedSolutions, clearWorkspace, exportMarkdown, exportJSON, importJSON } = useWorkspace();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stamp = new Date().toISOString().slice(0, 10);

  const handleImport = async (file: File) => {
    const text = await file.text();
    const result = importJSON(text);
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  };

  const uniqueChallenges = new Set(savedSolutions.map((s) => s.challenge_id)).size;

  return (
    <div className="glass rounded-xl p-5 space-y-4">
      <h3 className="font-display font-bold text-foreground">סיכום</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-primary">{savedSolutions.length}</div>
          <div className="text-xs text-muted-foreground">פתרונות</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-accent">{uniqueChallenges}</div>
          <div className="text-xs text-muted-foreground">אתגרים</div>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => downloadFile(`biourban-${stamp}.md`, exportMarkdown(), 'text/markdown')}
          disabled={savedSolutions.length === 0}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          ייצוא Markdown
        </button>

        {/* JSON is the round-trippable format: export, keep it in Git, import elsewhere. */}
        <button
          onClick={() => downloadFile(`biourban-${stamp}.json`, exportJSON(), 'application/json')}
          disabled={savedSolutions.length === 0}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border/50 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FileJson className="w-4 h-4" />
          ייצוא JSON
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border/50 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
        >
          <Upload className="w-4 h-4" />
          ייבוא JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          aria-label="ייבוא קובץ סביבת עבודה"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleImport(file);
            e.target.value = '';
          }}
        />

        <button
          onClick={() => {
            if (savedSolutions.length === 0) return;
            if (!window.confirm('לרוקן את סביבת העבודה? הפעולה אינה הפיכה.')) return;
            clearWorkspace();
            toast.success('סביבת העבודה רוקנה');
          }}
          disabled={savedSolutions.length === 0}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          רוקן
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        הבחירות נשמרות בדפדפן הזה בלבד. ייצאו ל-JSON כדי לשמור אותן או להעביר למחשב אחר.
      </p>
    </div>
  );
}
