import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { CheckCheck, Copy, ImagePlus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { ImageSlot } from '@/lib/image-prompt';
import { clearStoredImage, getStoredImage, resolveImageUrl, storeImage } from '@/lib/storage';

interface SolutionImageFrameProps {
  solutionId: string;
  slot: ImageSlot;
  /** The image committed to the repository, if one has been generated. */
  publishedUrl: string | null;
  prompt: string;
  alt: string;
}

/** localStorage holds a few megabytes in total, so one image cannot be huge. */
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

/**
 * One picture frame on a solution card.
 *
 * It shows the image committed to the repo, or the one this visitor attached,
 * and always exposes the prompt that produced it so the picture can be
 * regenerated. Attached images live only in this browser; the published set
 * comes from `data/solutions.json` and is the same for everyone.
 */
export default function SolutionImageFrame({
  solutionId,
  slot,
  publishedUrl,
  prompt,
  alt,
}: SolutionImageFrameProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // A visitor's own image wins over the published one.
  useEffect(() => {
    setImageUrl(getStoredImage(solutionId, slot) ?? publishedUrl);
  }, [solutionId, slot, publishedUrl]);

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
      storeImage(solutionId, slot, dataUrl);
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
      storeImage(solutionId, slot, url);
      toast.success('התמונה נשמרה בדפדפן שלכם');
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ''; // allow re-picking the same file
  };

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

  const displayUrl = resolveImageUrl(imageUrl);
  const isAttached = !!imageUrl && imageUrl !== publishedUrl;

  return (
    <div className="space-y-2">
      <div
        className={`relative aspect-[4/3] overflow-hidden rounded-lg bg-muted/20 border border-border/40 cursor-pointer transition-all ${
          dragging ? 'ring-2 ring-primary ring-inset bg-primary/10' : ''
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
          aria-label={`העלאת תמונה: ${alt}`}
        />

        {dragging ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <Upload className="w-8 h-8 text-primary animate-bounce" />
            <span className="text-sm font-medium text-primary">שחררו כאן</span>
          </div>
        ) : displayUrl ? (
          <img key={displayUrl} src={displayUrl} alt={alt} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 px-4 text-center">
            <ImagePlus className="w-10 h-10 text-muted-foreground/30" />
            <span className="text-xs text-muted-foreground/60">לחצו להעלאה או גררו תמונה</span>
          </div>
        )}

        {isAttached && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearStoredImage(solutionId, slot);
              setImageUrl(publishedUrl);
              toast.success('התמונה הוסרה');
            }}
            className="absolute top-2 left-2 p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors"
            aria-label="הסר את התמונה שהעליתם"
            title="הסר תמונה"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowPrompt((v) => !v)}
          aria-expanded={showPrompt}
          className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {showPrompt ? 'הסתר פרומפט' : 'הצג פרומפט להמחשה'}
        </button>
        <button
          onClick={handleCopyPrompt}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'הועתק' : 'העתק'}
        </button>
      </div>

      {showPrompt && (
        <p
          className="text-[11px] text-muted-foreground/70 leading-relaxed font-mono bg-background/50 border border-border/30 rounded p-2 select-all"
          dir="ltr"
        >
          {prompt}
        </p>
      )}
    </div>
  );
}
