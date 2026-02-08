"use client";

import CategoryBarChart from "@/app/components/dashboard/CategoryBarChart";
import PriorityBarChart from "@/app/components/dashboard/PriorityBarChart";
import StatCard from "@/app/components/dashboard/StatCard";
import StatusDonutChart from "@/app/components/dashboard/StatusDonutChart";
import UpcomingDeadlines from "@/app/components/dashboard/UpcomingDeadlines";
import FloatingNav from "@/app/components/layout/FloatingNav";
import { useCategories } from "@/app/hooks/useCategories";
import { useDashboardStats } from "@/app/hooks/useDashboardStats";
import { useTaskManager } from "@/app/hooks/useTaskManager";

export default function DashboardPage() {
  const { tasks } = useTaskManager();
  const { categories } = useCategories();
  const stats = useDashboardStats(tasks, categories);

  const maxPriorityCount = Math.max(
    ...stats.priorityDistribution.map((b) => b.count),
    1,
  );

  const activeTasks = stats.summary.total - stats.summary.completed;

  return (
    <div className="min-h-screen bg-zinc-900">
      <FloatingNav currentPath="/dashboard" />

      <main className="mx-auto max-w-[60%] px-4 pb-12 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Track your productivity and task analytics.
          </p>
        </div>

        {stats.summary.total === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 py-20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-zinc-600"
            >
              <rect x="3" y="3" width="7" height="9" />
              <rect x="14" y="3" width="7" height="5" />
              <rect x="14" y="12" width="7" height="9" />
              <rect x="3" y="16" width="7" height="5" />
            </svg>
            <p className="mt-4 text-zinc-400">No tasks yet.</p>
            <p className="mt-1 text-sm text-zinc-500">
              Create tasks to see your analytics here.
            </p>
          </div>
        ) : (
          <>
            {/* Row 1: Stat Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                label="Total Tasks"
                value={stats.summary.total}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  </svg>
                }
              />
              <StatCard
                label="Completed"
                value={stats.summary.completed}
                subtitle={`${stats.summary.completionRate}% completion rate`}
                accentColor="text-emerald-400"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                }
              />
              <StatCard
                label="Overdue"
                value={stats.summary.overdue}
                accentColor="text-red-400"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                }
              />
              <StatCard
                label="In Progress"
                value={stats.summary.inProgress}
                accentColor="text-blue-400"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                }
              />
            </div>

            {/* Row 2: Charts */}
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <CategoryBarChart data={stats.categoryBreakdown} />
              <PriorityBarChart
                data={stats.priorityDistribution}
                maxCount={maxPriorityCount}
              />
            </div>

            {/* Row 3: Insights */}
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <StatusDonutChart
                data={stats.statusDistribution}
                total={activeTasks}
              />
              <UpcomingDeadlines tasks={stats.upcomingDeadlines} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
