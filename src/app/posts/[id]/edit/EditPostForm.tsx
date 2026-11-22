"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { updatePost } from "@/app/actions/posts";
import { PostCategory, CampusLocation } from "@prisma/client";

const CATEGORIES: { value: PostCategory; label: string }[] = [
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "ID_CARDS", label: "ID Cards" },
  { value: "BOOKS", label: "Books & Study Material" },
  { value: "KEYS", label: "Keys" },
  { value: "BAGS", label: "Bags & Backpacks" },
  { value: "CLOTHING", label: "Clothing" },
  { value: "WALLET", label: "Wallets & Purses" },
  { value: "OTHER", label: "Other" },
];

const LOCATIONS: { value: CampusLocation; label: string }[] = [
  { value: "LIBRARY", label: "Central Library" },
  { value: "CANTEEN", label: "Campus Canteen" },
  { value: "BLOCK_A", label: "Block A" },
  { value: "BLOCK_B", label: "Block B" },
  { value: "BLOCK_C", label: "Block C" },
  { value: "SPORTS_GROUND", label: "Sports Ground" },
  { value: "AUDITORIUM", label: "Main Auditorium" },
  { value: "HOSTEL_BOYS", label: "Boys Hostel" },
  { value: "HOSTEL_GIRLS", label: "Girls Hostel" },
  { value: "MAIN_GATE", label: "Main Gate" },
  { value: "PARKING", label: "Parking Area" },
  { value: "OTHER", label: "Other Area" },
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
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
        label="Location Detail"
        value={locationDetail}
        onChange={(e) => setLocationDetail(e.target.value)}
        required
      />

      <Textarea
        label="Description"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      {post.type === "FOUND" && (
        <div className="p-4 bg-blush border-2 border-ink rounded-input space-y-2">
          <span className="font-bold text-xs uppercase tracking-wider text-coral block">
            Private Verification Detail
          </span>
          <Textarea
            rows={2}
            value={verificationDetail}
            onChange={(e) => setVerificationDetail(e.target.value)}
            hint="Only the poster and moderators can view this field."
          />
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-blush border-2 border-ink text-coral text-xs rounded-input font-semibold">
          {errorMessage}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t-2 border-paper">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="accent"
          isLoading={isSubmitting}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}
