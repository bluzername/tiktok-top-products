import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { formatFetchedAt } from '@/utils/format-date';

interface HeaderProps {
  thailandMode: boolean;
  onThailandModeChange: (value: boolean) => void;
  onRefresh: () => void;
  loading: boolean;
  fetchedAt: string | null;
  weekDate: string | null;
}

function DataFreshness({ fetchedAt, weekDate }: Pick<HeaderProps, 'fetchedAt' | 'weekDate'>) {
  const fetchedLabel = formatFetchedAt(fetchedAt);
  if (!fetchedLabel) return null;
  return (
    <p className="text-xs text-muted-foreground" data-testid="data-freshness">
      Data as of {fetchedLabel}
      {weekDate && <span> (week of {weekDate})</span>}
    </p>
  );
}

export function Header({ thailandMode, onThailandModeChange, onRefresh, loading, fetchedAt, weekDate }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-xl font-bold text-foreground">TikTok Top Products</h1>
        <DataFreshness fetchedAt={fetchedAt} weekDate={weekDate} />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="thailand-mode" className="text-sm font-medium text-muted-foreground">
            Thailand
          </label>
          <Switch
            id="thailand-mode"
            checked={thailandMode}
            onCheckedChange={onThailandModeChange}
          />
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading} title="Reload the cached weekly snapshot">
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          <span className="ml-1">Refresh</span>
        </Button>
      </div>
    </header>
  );
}
