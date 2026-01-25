import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface HeaderProps {
  thailandMode: boolean;
  onThailandModeChange: (value: boolean) => void;
  onRefresh: () => void;
  loading: boolean;
}

export function Header({ thailandMode, onThailandModeChange, onRefresh, loading }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <h1 className="text-xl font-bold text-foreground">TikTok Top Products</h1>
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
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          <span className="ml-1">Refresh</span>
        </Button>
      </div>
    </header>
  );
}

