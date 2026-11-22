import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/posts");
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <AdminNav />
      <div className="flex-1 py-8 sm:py-10">{children}</div>
    </div>
  );
}
