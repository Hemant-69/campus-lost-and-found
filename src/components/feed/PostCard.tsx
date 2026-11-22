import Link from "next/link";
import { SafeImage } from "../image/SafeImage";
import { StatusLabel } from "../ui/Badge";
import { MapPin, Calendar } from "lucide-react";
import { PostFeedItem } from "@/types";
import { formatISTDate } from "@/lib/date";

export function PostCard({ post }: { post: PostFeedItem }) {
  const thumbImageId = post.images && post.images.length > 0 ? post.images[0].imageId : undefined;
  const formattedDate = formatISTDate(post.dateLostOrFound);

  // Single status label per card rule: if not OPEN, show status, else show LOST / FOUND type
  const displayStatus = post.status !== "OPEN" ? post.status : post.type;

  return (
    <Link
      href={`/posts/${post.id}`}
      className="group relative bg-surface border-2.5 border-ink rounded-card shadow-hard-card overflow-hidden flex flex-col transition-transform duration-150 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_#231F20]"
    >
      {/* Tape strip on top center */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 sm:w-14 h-3.5 sm:h-4 bg-sky border-b-2 border-x-2 border-ink opacity-90 z-10 pointer-events-none rounded-b-xs" />

      {/* Prominent Image container: Square on mobile so image takes the main space, 4:3 on desktop */}
      <div className="relative aspect-square sm:aspect-[4/3] w-full bg-paper border-b-2.5 border-ink overflow-hidden">
        <SafeImage
          imageId={thumbImageId}
          variant="thumb"
          category={post.category}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-102 transition duration-200"
        />

        {/* Single status badge in corner */}
        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10">
          <StatusLabel status={displayStatus} size="sm" className="text-[9px] sm:text-[11px] px-1.5 sm:px-2.5 py-0.5" />
        </div>
      </div>

      {/* Card Content: Streamlined on mobile so the image dominates the card */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between gap-1.5 sm:gap-3">
        <div>
          <span className="text-[10px] sm:text-xs font-semibold text-ink-soft uppercase tracking-wider block mb-0.5">
            {post.category.replace(/_/g, " ")}
          </span>
          <h3 className="font-serif font-bold text-ink group-hover:text-coral transition-colors line-clamp-1 text-xs sm:text-base">
            {post.title}
          </h3>
        </div>

        {/* Location (compact single line on mobile) */}
        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-ink-soft">
          <MapPin className="w-3 h-3 text-ink shrink-0" />
          <span className="truncate">
            {post.location.replace(/_/g, " ")} &bull; {post.locationDetail}
          </span>
        </div>

        {/* Date (hidden on mobile to save vertical space for the image) */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-ink-soft">
          <Calendar className="w-3.5 h-3.5 text-ink shrink-0" />
          <span>{formattedDate}</span>
        </div>

        {/* Poster Info (hidden on mobile to save vertical space for the image) */}
        <div className="hidden sm:flex pt-3 border-t-2 border-paper items-center justify-between text-xs text-ink-soft font-medium">
          <span>Posted by {post.user.name.split(" ")[0]}</span>
          <span className="truncate max-w-[120px]">{post.user.department}</span>
        </div>
      </div>
    </Link>
  );
}
