import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChevronDown } from 'lucide-react';
import { METRICS, type Solution } from '@/data';

const COLORS = ['hsl(160, 60%, 45%)', 'hsl(175, 70%, 35%)', 'hsl(40, 80%, 55%)'];

export default function MetricsChart({ solutions }: { solutions: Solution[] }) {
  const [chartType, setChartType] = useState<'radar' | 'bar'>('radar');
  const [showLegend, setShowLegend] = useState(false);

  // The radar puts every axis on a single 0-100 scale, so the metrics recorded
  // out of 10 are scaled up; the bar chart keeps each metric's own scale.
  const radarData = METRICS.map((m) => {
    const row: Record<string, string | number> = { metric: m.label };
    solutions.forEach((s, i) => {
      const raw = s.metrics[m.key] ?? 0;
      row[`s${i}`] = m.max === 10 ? raw * 10 : raw;
    });
    return row;
  });

  const barData = METRICS.map((m) => {
    const row: Record<string, string | number> = { metric: m.label };
    solutions.forEach((s, i) => {
      row[`s${i}`] = s.metrics[m.key] ?? 0;
    });
    return row;
  });

  return (
    <div className="border border-border/50 rounded-lg p-4 space-y-3 bg-card/30 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-sm text-foreground">השוואת מדדים</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {solutions.length} הפתרונות הראשונים בסביבת העבודה
          </p>
        </div>
        <div className="flex gap-1">
          {(['radar', 'bar'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setChartType(t)}
              aria-pressed={chartType === t}
              className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                chartType === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'radar' ? 'רדאר' : 'עמודות'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {solutions.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
            <span className="text-muted-foreground">{s.title.split('(')[0].trim()}</span>
          </div>
        ))}
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'radar' ? (
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              {solutions.map((s, i) => (
                <Radar
                  key={s.id}
                  dataKey={`s${i}`}
                  stroke={COLORS[i]}
                  fill={COLORS[i]}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              ))}
            </RadarChart>
          ) : (
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="metric" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))',
                }}
              />
              {solutions.map((s, i) => (
                <Bar key={s.id} dataKey={`s${i}`} fill={COLORS[i]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div>
        <button
          onClick={() => setShowLegend((v) => !v)}
          aria-expanded={showLegend}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showLegend ? 'rotate-180' : ''}`} />
          מה כל מדד אומר
        </button>

        {showLegend && (
          <dl className="mt-2 space-y-1.5">
            {METRICS.map((m) => (
              <div key={m.key} className="text-xs">
                <dt className="inline font-semibold text-foreground">
                  {m.label} ({m.max === 10 ? 'סולם 0–10' : 'אחוזים'}):{' '}
                </dt>
                <dd className="inline text-muted-foreground">{m.description}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
