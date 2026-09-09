import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-full items-center justify-center p-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-display font-bold text-primary">404</h1>
        <p className="text-lg text-muted-foreground">הדף שחיפשתם לא קיים</p>
        <Link
          to="/"
          className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          חזרה לדף הראשי
        </Link>
      </div>
    </div>
  );
}
