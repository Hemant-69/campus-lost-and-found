import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StatusLabel } from "@/components/ui/Badge";
import { SafeImage } from "@/components/image/SafeImage";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Plus, Eye } from "lucide-react";

export default async function MyPostsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const posts = await prisma.post.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      images: {
        select: { imageId: true },
        take: 1,
        orderBy: { sortOrder: "asc" },
      },
      _count: {
        select: {
          claims: true,
          comments: true,
        },
      },
    },
  });

  return (
    <div className="w-full px-[40px] sm:px-[48px] lg:px-[64px] py-8 sm:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="font-hand text-2xl text-coral font-semibold">your notices</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            My Posts
          </h1>
          <p className="text-sm text-ink-soft">
            Manage your reported lost and found items and review incoming claims
          </p>
        </div>
        <Link href="/posts/new">
          <Button variant="accent">
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            New Post
          </Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          title="You haven't posted anything yet"
          description="Report an item you lost or picked up on campus to get the community's help."
          action={{
            label: "Create First Post",
            href: "/posts/new",
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-surface rounded-card border-2.5 border-ink overflow-hidden shadow-hard-card flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/10] bg-paper border-b-2.5 border-ink overflow-hidden">
                  <SafeImage
                    imageId={post.images[0]?.imageId}
                    variant="thumb"
                    category={post.category}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <StatusLabel status={post.status !== "OPEN" ? post.status : post.type} />
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-coral block">
                    {post.category.replace(/_/g, " ")}
                  </span>
                  <h3 className="font-serif font-bold text-ink line-clamp-1 text-lg">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-soft line-clamp-2">
                    {post.description}
                  </p>
                </div>
              </div>

              <div className="p-5 border-t-2 border-paper bg-paper/30 flex items-center justify-between text-xs font-medium">
                <span className="text-ink-soft">
                  {post._count.claims} claims &bull; {post._count.comments} questions
                </span>
                <Link href={`/posts/${post.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
                    Manage
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
