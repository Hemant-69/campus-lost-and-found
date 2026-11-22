"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { updatePost } from "@/app/actions/posts";
import { PostCategory, CampusLocation } from "@prisma/client";
import { EyeOff, Sparkles, MapPin, FileEdit } from "lucide-react";

const CATEGORIES: { value: PostCategory; label: string }[] = [
  { value: "ELECTRONICS", label: "Electronics (Phone, Laptop, Charger, Headphones)" },
  { value: "ID_CARDS", label: "ID Cards & Campus Access Cards" },
  { value: "BOOKS", label: "Books, Notebooks & Stationary" },
  { value: "KEYS", label: "Keys (Hostel, Vehicle, Locker)" },
  { value: "BAGS", label: "Bags & Backpacks" },
  { value: "CLOTHING", label: "Clothing, Jackets & Accessories" },
  { value: "WALLET", label: "Wallets & Purses" },
  { value: "OTHER", label: "Other Belongings" },
];

const LOCATIONS: { value: CampusLocation; label: string }[] = [
  { value: "LIBRARY", label: "Central Library" },
  { value: "CANTEEN", label: "Campus Canteen" },
  { value: "BLOCK_A", label: "Academic Block A" },
  { value: "BLOCK_B", label: "Academic Block B" },
  { value: "BLOCK_C", label: "Academic Block C" },
  { value: "SPORTS_GROUND", label: "Sports Ground" },
  { value: "AUDITORIUM", label: "Main Auditorium" },
  { value: "HOSTEL_BOYS", label: "Boys Hostel" },
  { value: "HOSTEL_GIRLS", label: "Girls Hostel" },
  { value: "MAIN_GATE", label: "Main Campus Gate" },
  { value: "PARKING", label: "Vehicle Parking Area" },
  { value: "OTHER", label: "Other Campus Location" },
];

export function EditPostForm({
  post,
}: {
  post: {
    id: string;
    type: "LOST" | "FOUND";
    title: string;
    description: string;
    category: PostCategory;
    location: CampusLocation;
    locationDetail: string;
    verificationDetail?: string;
  };
}) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [description, setDescription] = useState(post.description);
  const [category, setCategory] = useState<PostCategory>(post.category);
  const [location, setLocation] = useState<CampusLocation>(post.location);
  const [locationDetail, setLocationDetail] = useState(post.locationDetail);
  const [verificationDetail, setVerificationDetail] = useState(
    post.verificationDetail || ""
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await updatePost(post.id, {
      title,
      description,
      category,
      location,
      locationDetail,
      verificationDetail: post.type === "FOUND" ? verificationDetail : undefined,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || "Failed to update post.");
    } else {
      router.push(`/posts/${post.id}`);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 2-Column Responsive Grid on Desktop and Tablets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Core item fields & Location */}
        <div className="lg:col-span-7 space-y-6">
          <Input
            label="Item Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as PostCategory)}
              options={CATEGORIES}
            />

            <Select
              label="Campus Location"
              value={location}
              onChange={(e) => setLocation(e.target.value as CampusLocation)}
              options={LOCATIONS}
            />
          </div>

          <Input
            label="Specific Location Detail"
            value={locationDetail}
            onChange={(e) => setLocationDetail(e.target.value)}
            required
          />

          <Textarea
            label="Observable Description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Right Column: Blind Verification & Helpful Context */}
        <div className="lg:col-span-5 space-y-6">
          {post.type === "FOUND" && (
            <div className="p-5 bg-blush border-2 border-ink rounded-input space-y-3 shadow-hard-btn">
              <div className="flex items-center gap-2 text-xs font-bold text-coral">
                <EyeOff className="w-4 h-4 stroke-[2.5]" />
                <span className="uppercase tracking-wider">
                  Private Verification Detail (Blind Check)
                </span>
              </div>
              <Textarea
                rows={3}
                value={verificationDetail}
                onChange={(e) => setVerificationDetail(e.target.value)}
                hint="Only the poster and campus moderators can view this field. Claimants answer blindly."
              />
            </div>
          )}

          <div className="p-5 bg-paper rounded-card border-2 border-ink space-y-2.5 text-xs sm:text-sm text-ink-soft">
            <div className="flex items-center gap-2 font-serif font-bold text-ink">
              <Sparkles className="w-4 h-4 text-coral stroke-[2.5]" />
              <span>Editing Guidelines</span>
            </div>
            <p>
              Updating your item notice will immediately reflect across search filters,
              category browses, and existing public comment threads.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-blush border-2 border-ink text-coral text-sm rounded-input font-semibold">
          {errorMessage}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t-2 border-paper">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="accent"
          size="md"
          isLoading={isSubmitting}
          className="min-w-[140px]"
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}
