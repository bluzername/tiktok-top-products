import { ArrowUp, ArrowDown } from 'lucide-react';
import type { Product } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { TableRow, TableCell } from '@/components/ui/table';

interface ProductRowProps {
  product: Product;
}

export function ProductRow({ product }: ProductRowProps) {
  return (
    <TableRow>
      <TableCell>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-12 h-12 object-cover rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '';
              (e.target as HTMLImageElement).className = 'w-12 h-12 rounded bg-muted';
            }}
          />
        ) : (
          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
            N/A
          </div>
        )}
      </TableCell>
      <TableCell className="font-medium max-w-[200px] truncate" title={product.name}>
        {product.name}
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{product.category}</Badge>
      </TableCell>
      <TableCell className="text-right">{product.ctr.toFixed(2)}%</TableCell>
      <TableCell className="text-right">{product.cvr.toFixed(2)}%</TableCell>
      <TableCell className="text-right">${product.cpa.toFixed(2)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {product.popularityChange > 0 ? (
            <ArrowUp className="h-3.5 w-3.5 text-green-500" />
          ) : product.popularityChange < 0 ? (
            <ArrowDown className="h-3.5 w-3.5 text-red-500" />
          ) : null}
          <span
            className={
              product.popularityChange > 0
                ? 'text-green-600'
                : product.popularityChange < 0
                  ? 'text-red-600'
                  : 'text-muted-foreground'
            }
          >
            {product.popularityChange > 0 ? '+' : ''}
            {product.popularityChange.toFixed(1)}%
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right font-mono">
        {product.manufacturingScore.toFixed(3)}
      </TableCell>
    </TableRow>
  );
}
