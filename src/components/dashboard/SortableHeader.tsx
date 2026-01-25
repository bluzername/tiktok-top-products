import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import type { SortField, SortState } from '@/types/product';
import { TableHead } from '@/components/ui/table';

interface SortableHeaderProps {
  label: string;
  field: SortField;
  sort: SortState;
  onSort: (field: SortField) => void;
}

export function SortableHeader({ label, field, sort, onSort }: SortableHeaderProps) {
  const isActive = sort.field === field;

  return (
    <TableHead
      className="cursor-pointer select-none hover:bg-accent/50 transition-colors"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {isActive ? (
          sort.direction === 'asc' ? (
            <ArrowUp className="h-3.5 w-3.5" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5" />
          )
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>
    </TableHead>
  );
}
