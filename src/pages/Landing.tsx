import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { categoryIcons, categoryLabels, challenges, populatedCategories, solutions } from '@/data';

export default function Landing() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-full px-4 py-16 overflow-hidden">
      <div className="absolute top-20 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl text-center space-y-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground rounded-lg border border-border/50">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>מנוע אינטליגנציה ביו-עירונית</span>
        </div>

        <div className="space-y-4">
          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl leading-tight text-foreground">
            פתרונות <span className="text-gradient">בהשראת הטבע</span>
            <br />
            לערים חכמות
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {solutions.length} פתרונות ביומימטיים ל-{challenges.length} אתגרים עירוניים — מקירור פסיבי ועד ניהול
            משאבים, בהשראת תהליכים טבעיים מוכחים.
          </p>
        </div>

        {/* Only categories that actually hold challenges are shown. */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4">
          {populatedCategories.map(({ category, count }) => (
            <Link
              key={category}
              to="/challenges"
              className="group p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-all duration-200"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 rounded-md bg-muted/50 group-hover:bg-primary/10 transition-colors text-xl">
                  {categoryIcons[category]}
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-foreground">{categoryLabels[category]}</div>
                  <div className="text-xs text-muted-foreground">{count}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link
          to="/challenges"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm"
        >
          התחל לחקור
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
