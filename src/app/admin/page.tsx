import nextDynamic from "next/dynamic";
import { getAdminDashboardStats } from "@/app/actions/admin";
import { StorageMetricCard } from "@/components/admin/StorageMetricCard";
import { Users, UserCheck, FolderOpen, CheckCircle2, AlertOctagon } from "lucide-react";
import Link from "next/link";

const DynamicPostsChart = nextDynamic(
  () => import("@/components/admin/PostsChart").then((mod) => mod.PostsChart),
  {
    loading: () => (
      <div className="h-64 bg-surface rounded-card border-2.5 border-ink animate-pulse p-6" />
    ),
    ssr: false,
  }
);

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  const metrics = [
    {
      label: "Registered Students",
      value: stats.totalStudents,
      icon: Users,
      href: "/admin/students",
      color: "bg-sky",
    },
    {
      label: "Pending Verifications",
      value: stats.pendingVerifications,
      icon: UserCheck,
      href: "/admin/verifications",
      color: "bg-yellow",
      highlight: stats.pendingVerifications > 0,
    },
    {
      label: "Open Items",
      value: stats.openPosts,
      icon: FolderOpen,
      href: "/admin/posts",
      color: "bg-paper",
    },
    {
      label: "Items Returned",
      value: stats.returnedItems,
      icon: CheckCircle2,
      href: "/admin/posts?status=RETURNED",
      color: "bg-sage",
    },
    {
      label: "Open Reports",
      value: stats.openReports,
      icon: AlertOctagon,
      href: "/admin/reports",
      color: "bg-blush",
      highlight: stats.openReports > 0,
    },
  ];

  return (
    <div className="w-full px-[40px] sm:px-[48px] lg:px-[64px] space-y-8">
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          Moderator Dashboard
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          Monitor campus community activity, verify student ID cards, and watch database storage limits
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.label}
              href={m.href}
              className={`p-5 rounded-card border-2.5 border-ink bg-surface shadow-hard-card hover:-translate-y-0.5 transition space-y-3 ${
                m.highlight ? "ring-3 ring-coral" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-soft">{m.label}</span>
                <div className={`p-2 rounded-full border-1.5 border-ink ${m.color} text-ink`}>
                  <Icon className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <span className="font-serif text-3xl font-bold text-ink block">
                {m.value}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Database Image Storage Metric & Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StorageMetricCard
          totalBytes={stats.totalImageSizeBytes}
          totalCount={stats.totalImageCount}
        />
        <div className="bg-surface rounded-card border-2.5 border-ink p-6 shadow-hard-card">
          <DynamicPostsChart data={stats.chartData} />
        </div>
      </div>
    </div>
  );
}
