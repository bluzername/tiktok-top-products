import { Skeleton } from '@/components/ui/skeleton';
import { TableRow, TableCell } from '@/components/ui/table';

export function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="w-12 h-12 rounded" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[160px]" /></TableCell>
          <TableCell><Skeleton className="h-5 w-[70px] rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[50px] ml-auto" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[50px] ml-auto" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[60px] ml-auto" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[60px] ml-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}
