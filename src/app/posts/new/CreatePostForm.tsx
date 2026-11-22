"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/image/ImageUploader";
import { createPost } from "@/app/actions/posts";
import { PostType, PostCategory, CampusLocation } from "@prisma/client";
import { EyeOff, ShieldCheck, Sparkles, MapPin, Camera } from "lucide-react";

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

export function CreatePostForm() {
  const router = useRouter();
  const [type, setType] = useState<PostType>("FOUND");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<PostCategory>("ELECTRONICS");
  const [dateLostOrFound, setDateLostOrFound] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [location, setLocation] = useState<CampusLocation>("LIBRARY");
  const [locationDetail, setLocationDetail] = useState("");
  const [description, setDescription] = useState("");
  const [verificationDetail, setVerificationDetail] = useState("");
  const [imageIds, setImageIds] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageIds.length === 0) {
      setErrorMessage("Please upload at least one photograph of the item.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await createPost({
      type,
      title,
      description,
      category,
      dateLostOrFound: new Date(dateLostOrFound),
      location,
      locationDetail,
      verificationDetail: type === "FOUND" ? verificationDetail : undefined,
      imageIds,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || "Failed to create post.");
    } else if (res.data?.postId) {
      router.push(`/posts/${res.data.postId}`);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 2-Column Responsive Desktop & Tablet Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Essential Item Details & Location */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. What is it */}
          <div className="space-y-4">
            <span className="font-hand text-2xl text-coral font-semibold block">
              1. what is it
            </span>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType("FOUND")}
                className={`p-4 sm:p-5 rounded-input border-2.5 border-ink text-left transition select-none ${
                  type === "FOUND"
                    ? "bg-sage text-ink shadow-hard-btn -translate-y-0.5"
                    : "bg-surface text-ink-soft hover:bg-paper"
                }`}
              >
                <span className="block text-xs uppercase font-bold tracking-wider">
                  Found Something
                </span>
                <span className="block font-serif text-lg sm:text-xl font-bold mt-1 text-ink">
                  I found an item
                </span>
              </button>

              <button
                type="button"
                onClick={() => setType("LOST")}
                className={`p-4 sm:p-5 rounded-input border-2.5 border-ink text-left transition select-none ${
                  type === "LOST"
                    ? "bg-yellow text-ink shadow-hard-btn -translate-y-0.5"
                    : "bg-surface text-ink-soft hover:bg-paper"
                }`}
              >
                <span className="block text-xs uppercase font-bold tracking-wider">
                  Lost Something
                </span>
                <span className="block font-serif text-lg sm:text-xl font-bold mt-1 text-ink">
                  I lost an item
                </span>
              </button>
            </div>

            <Input
              label="Item Title"
              placeholder={
                type === "FOUND"
                  ? "e.g. Blue Titan Watch near canteen"
                  : "e.g. Black Dell laptop charger"
              }
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

              <Input
                label={type === "FOUND" ? "Date Found" : "Date Lost"}
                type="date"
                value={dateLostOrFound}
                onChange={(e) => setDateLostOrFound(e.target.value)}
                required
              />
            </div>

            <Textarea
              label="Observable Description"
              placeholder="Provide observable details: color, approximate dimensions, wear condition..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* 2. Where was it */}
          <div className="space-y-4 pt-6 border-t-2 border-paper">
            <span className="font-hand text-2xl text-coral font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-coral stroke-[2.5]" />
              2. where was it
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Campus Location"
                value={location}
                onChange={(e) => setLocation(e.target.value as CampusLocation)}
                options={LOCATIONS}
              />

              <Input
                label="Specific Location Detail"
                placeholder="e.g. 2nd floor reading hall table 14"
                value={locationDetail}
                onChange={(e) => setLocationDetail(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Right Column: Photographs, Blind Verification & Campus Tips */}
        <div className="lg:col-span-5 space-y-8">
          {/* 3. Photographs */}
          <div className="space-y-4">
            <span className="font-hand text-2xl text-coral font-semibold flex items-center gap-2">
              <Camera className="w-5 h-5 text-coral stroke-[2.5]" />
              3. photographs
            </span>

            <ImageUploader
              kind="POST"
              maxFiles={4}
              label="Item Photographs (1 to 4 images)"
              hint="Clear photos help identify the item. Uploaded images are automatically compressed to WebP."
              onImagesChange={(ids) => setImageIds(ids)}
            />
          </div>

          {/* 4. Secret question (found only) */}
          {type === "FOUND" && (
            <div className="space-y-4 pt-6 border-t-2 border-paper">
              <span className="font-hand text-2xl text-coral font-semibold block">
                4. secret question (blind check)
              </span>

              <div className="p-4 sm:p-5 bg-blush border-2 border-ink rounded-input space-y-3 shadow-hard-btn">
                <div className="flex items-center gap-2 text-xs font-bold text-coral">
                  <EyeOff className="w-4 h-4 stroke-[2.5]" />
                  <span className="uppercase tracking-wider">
                    Private Verification Detail (Never shown publicly)
                  </span>
                </div>
                <Textarea
                  placeholder="Specify a secret identifying mark only the genuine owner would know: e.g. wallpaper on phone lock screen, exact items inside pocket, serial number..."
                  rows={3}
                  value={verificationDetail}
                  onChange={(e) => setVerificationDetail(e.target.value)}
                  hint="Concealed from students. Claimants must answer blindly to prove authentic ownership."
                />
              </div>
            </div>
          )}

          {/* Helpful Campus Board Guidelines */}
          <div className="p-5 bg-paper rounded-card border-2 border-ink space-y-2.5 text-xs sm:text-sm text-ink-soft">
            <div className="flex items-center gap-2 font-serif font-bold text-ink">
              <Sparkles className="w-4 h-4 text-coral stroke-[2.5]" />
              <span>Campus Board Advice</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Upload clear, well-lit photos from different angles.</li>
              <li>Keep public titles concise (mention color, brand, and item type).</li>
              <li>If you found valuable belongings, safe handover spots include the <strong>Central Library Helpdesk</strong> or <strong>Campus Security</strong>.</li>
            </ul>
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
          disabled={imageIds.length === 0 || !title.trim() || !description.trim()}
          className="min-w-[140px]"
        >
          Publish Post
        </Button>
      </div>
    </form>
  );
}
