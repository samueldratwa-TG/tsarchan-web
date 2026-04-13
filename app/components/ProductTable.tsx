"use client";

interface ProductData {
  id: string;
  name: string;
  category: string;
  base_price: number | null;
  avg_price?: number;
  change_pct?: number;
  chains: Record<string, number>;
}

interface Props {
  products: ProductData[];
  displayChains: string[];
  chainNames: Record<string, string>;
  categories: Record<string, string>;
}

export function ProductTable({ products, displayChains, chainNames, categories }: Props) {
  const grouped: Record<string, ProductData[]> = {};
  for (const p of products) {
    const cat = p.category || "other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-right py-2 px-2 font-semibold">מוצר</th>
            {displayChains.map((c) => (
              <th key={c} className="text-center py-2 px-1 font-semibold text-xs">{chainNames[c]}</th>
            ))}
            <th className="text-center py-2 px-2 font-semibold bg-blue-50">ממוצע</th>
            <th className="text-center py-2 px-2 font-semibold">שינוי</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([cat, prods]) => (
            <CategoryRows key={cat} category={categories[cat] || cat} products={prods} displayChains={displayChains} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CategoryRows({ category, products, displayChains }: { category: string; products: ProductData[]; displayChains: string[] }) {
  const colSpan = displayChains.length + 3;
  return (
    <>
      <tr>
        <td colSpan={colSpan} className="pt-4 pb-1 px-2 font-bold text-blue-700 text-base">{category}</td>
      </tr>
      {products.map((p) => {
        const chainPrices = displayChains.map((c) => p.chains[c]);
        const allPricesValid = chainPrices.filter((v) => v != null && v > 0);
        const minPrice = allPricesValid.length > 0 ? Math.min(...allPricesValid) : null;
        const maxPrice = allPricesValid.length > 0 ? Math.max(...allPricesValid) : null;

        return (
          <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="py-1.5 px-2 text-xs">{p.name}</td>
            {displayChains.map((c) => {
              const price = p.chains[c];
              const isMin = price != null && price === minPrice && minPrice !== maxPrice;
              const isMax = price != null && price === maxPrice && minPrice !== maxPrice;
              return (
                <td key={c} className={`py-1.5 px-1 text-center text-xs ${isMin ? "text-green-700 font-bold" : isMax ? "text-red-500" : "text-gray-500"}`}>
                  {price ? price.toFixed(2) : "-"}
                </td>
              );
            })}
            <td className="py-1.5 px-2 text-center font-medium bg-blue-50 text-xs">
              {p.avg_price ? p.avg_price.toFixed(2) : "-"}
            </td>
            <td className="py-1.5 px-2 text-center text-xs">
              {p.change_pct != null ? (
                <span className={p.change_pct > 0 ? "text-red-600" : p.change_pct < 0 ? "text-green-600" : "text-gray-400"}>
                  {p.change_pct > 0 ? "+" : ""}{p.change_pct.toFixed(1)}%
                </span>
              ) : "-"}
            </td>
          </tr>
        );
      })}
    </>
  );
}
