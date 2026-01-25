import type { Product, SortState, SortField } from '@/types/product';
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead,
} from '@/components/ui/table';
import { SortableHeader } from './SortableHeader';
import { ProductRow } from './ProductRow';
import { LoadingSkeleton } from './LoadingSkeleton';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  sort: SortState;
  onSort: (field: SortField) => void;
}

export function ProductTable({ products, loading, error, sort, onSort }: ProductTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px]">Image</TableHead>
          <SortableHeader label="Product Name" field="name" sort={sort} onSort={onSort} />
          <TableHead>Category</TableHead>
          <SortableHeader label="CTR (%)" field="ctr" sort={sort} onSort={onSort} />
          <SortableHeader label="CVR (%)" field="cvr" sort={sort} onSort={onSort} />
          <SortableHeader label="CPA ($)" field="cpa" sort={sort} onSort={onSort} />
          <SortableHeader label="Popularity" field="popularityChange" sort={sort} onSort={onSort} />
          <SortableHeader label="Mfg Score" field="manufacturingScore" sort={sort} onSort={onSort} />
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <TableRow>
            <TableHead colSpan={8} className="text-center text-destructive py-8">
              {error}
            </TableHead>
          </TableRow>
        ) : products.length === 0 ? (
          <TableRow>
            <TableHead colSpan={8} className="text-center text-muted-foreground py-8">
              No products found. Select a category to get started.
            </TableHead>
          </TableRow>
        ) : (
          products.map(product => (
            <ProductRow key={product.id} product={product} />
          ))
        )}
      </TableBody>
    </Table>
  );
}
