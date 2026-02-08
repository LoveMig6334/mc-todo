import { CategoryStat } from "@/app/lib/dashboardUtils";

interface CategoryBarChartProps {
  data: CategoryStat[];
}

export default function CategoryBarChart({ data }: CategoryBarChartProps) {
  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-5">
      <h3 className="text-sm font-medium text-zinc-400">Tasks by Category</h3>

      {data.length === 0 ? (
        <p className="mt-6 text-center text-sm text-zinc-500">
          No categorized tasks yet.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {data.map((cat) => {
            const totalPct = (cat.total / maxTotal) * 100;
            const completedPct =
              cat.total > 0 ? (cat.completed / cat.total) * 100 : 0;

            return (
              <div key={cat.categoryId}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-zinc-300">{cat.name}</span>
                  </div>
                  <span className="text-zinc-500">
                    {cat.completed}/{cat.total}
                  </span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-zinc-700"
                  style={{ width: `${totalPct}%` }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${completedPct}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
