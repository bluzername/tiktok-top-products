import type { Category } from '@/constants/categories';
import { ALL_CATEGORIES_ID } from '@/constants/categories';
import { cn } from '@/lib/utils';

interface SidebarProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (id: string) => void;
}

export function Sidebar({ categories, selectedCategory, onCategoryChange }: SidebarProps) {
  return (
    <aside className="w-56 border-r border-border bg-card p-4 flex flex-col gap-1">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
        Categories
      </h2>
      <button
        onClick={() => onCategoryChange(ALL_CATEGORIES_ID)}
        className={cn(
          'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors',
          selectedCategory === ALL_CATEGORIES_ID
            ? 'bg-primary text-primary-foreground'
            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
        )}
      >
        All Categories
      </button>
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors',
            selectedCategory === category.id
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          {category.name}
        </button>
      ))}
    </aside>
  );
}
