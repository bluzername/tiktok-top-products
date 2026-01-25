import { useProducts } from '@/hooks/useProducts';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ProductTable } from '@/components/dashboard/ProductTable';
import { Card, CardContent } from '@/components/ui/card';

function App() {
  const {
    products,
    loading,
    error,
    categories,
    selectedCategory,
    setSelectedCategory,
    thailandMode,
    setThailandMode,
    sort,
    handleSort,
    refresh,
  } = useProducts();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          thailandMode={thailandMode}
          onThailandModeChange={setThailandMode}
          onRefresh={refresh}
          loading={loading}
        />
        <main className="flex-1 overflow-auto p-6">
          <Card>
            <CardContent className="p-0">
              <ProductTable
                products={products}
                loading={loading}
                error={error}
                sort={sort}
                onSort={handleSort}
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

export default App;
