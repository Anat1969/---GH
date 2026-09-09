import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { BarChart3, Check, ChevronDown, Copy, CheckCheck, ImagePlus, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import {
  METRICS,
  sourceTypeColors,
  sourceTypeLabels,
  type ChallengeCategory,
  type Solution,
} from '@/data';
import { architecturalInterpretation } from '@/lib/interpretation';
import { buildImagePrompt } from '@/lib/image-prompt';
import { clearStoredImage, getStoredImage, resolveImageUrl, storeImage } from '@/lib/storage';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface SolutionCardProps {
  solution: Solution;
  challengeCategory?: ChallengeCategory;
}

/** Images larger than this are rejected — localStorage quota is a few megabytes. */
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export default function SolutionCard({ solution, challengeCategory }: SolutionCardProps) {
  const { addSolution, removeSolution, isSaved } = useWorkspace();
  const saved = isSaved(solution.id);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // A visitor's own image wins over the one shipped in the data file.
  useEffect(() => {
    setImageUrl(getStoredImage(solution.id) ?? solution.image_url);
  }, [solution.id, solution.image_url]);

  const prompt = useMemo(
    () => buildImagePrompt(solution, challengeCategory),
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

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast.success('הפרומפט הועתק');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('הדפדפן חסם את ההעתקה — סמנו והעתיקו ידנית');
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('יש לבחור קובץ תמונה');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('התמונה גדולה מ-2MB. בחרו קובץ קטן יותר.');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => toast.error('שגיאה בקריאת הקובץ');
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== 'string') return;
      setImageUrl(dataUrl);
      storeImage(solution.id, dataUrl);
      toast.success('התמונה נשמרה בדפדפן שלכם');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
      return;
    }
    const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    if (url?.startsWith('http')) {
      setImageUrl(url);
      storeImage(solution.id, url);
      toast.success('התמונה נשמרה בדפדפן שלכם');
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ''; // let the same file be picked again
  };

  const handleClearImage = () => {
    clearStoredImage(solution.id);
    setImageUrl(solution.image_url);
    toast.success('התמונה הוסרה');
  };

  const displayUrl = resolveImageUrl(imageUrl);
  const isCustomImage = !!imageUrl && imageUrl !== solution.image_url;

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <div
        className={`relative h-72 overflow-hidden bg-muted/20 cursor-pointer transition-all ${
          dragging ? 'ring-4 ring-primary ring-inset bg-primary/10' : ''
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onClick={() => fileInputRef.current?.click()}
        title="גררו תמונה לכאן, או לחצו כדי לבחור קובץ"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
          aria-label={`העלאת תמונה עבור ${solution.title}`}
        />

        {dragging ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 border-2 border-dashed border-primary rounded-lg m-2">
            <Upload className="w-10 h-10 text-primary animate-bounce" />
            <span className="text-sm font-medium text-primary">שחררו כאן</span>
          </div>
        ) : displayUrl ? (
          <>
            <img
              key={displayUrl}
              src={displayUrl}
              alt={solution.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <ImagePlus className="w-14 h-14 text-muted-foreground/30" />
            <span className="text-sm text-muted-foreground/50">לחצו להעלאה או גררו תמונה</span>
          </div>
        )}

        <span
          className={`absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full border backdrop-blur-md ${sourceTypeColors[solution.source_type]}`}
        >
          {sourceTypeLabels[solution.source_type]}
        </span>

        {isCustomImage && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClearImage();
            }}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors"
            aria-label="הסר את התמונה שהעליתם"
            title="הסר תמונה"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}

        {displayUrl && (
          <h3 className="absolute bottom-3 right-3 font-display font-bold text-2xl text-white drop-shadow-lg">
            {solution.title}
          </h3>
        )}
      </div>

      <div className="p-5 space-y-5">
        {!displayUrl && <h3 className="font-display font-bold text-2xl">{solution.title}</h3>}

        <div className="space-y-3 text-sm">
          <div className="glass rounded-lg p-4">
            <span className="font-semibold text-primary text-xs">מנגנון ביולוגי</span>
            <p className="text-muted-foreground mt-1 leading-relaxed">{solution.mechanism}</p>
          </div>
          <div className="glass rounded-lg p-4">
            <span className="font-semibold text-accent text-xs">יישום אדריכלי</span>
            <p className="text-muted-foreground mt-1 leading-relaxed">{solution.application}</p>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
          <h4 className="font-display font-bold text-base text-primary mb-3">פרשנות אדריכלית</h4>
          <p className="text-base text-foreground leading-relaxed">{interpretation}</p>
        </div>

        <div className="border border-border/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">פרומפט להמחשה</span>
            <button
              onClick={handleCopyPrompt}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'הועתק' : 'העתק'}
            </button>
          </div>
          <p
            className="text-xs text-muted-foreground/70 leading-relaxed font-mono bg-background/50 rounded p-2 select-all"
            dir="ltr"
          >
            {prompt}
          </p>
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
    </div>
  );
}
