"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ImageUploader } from "@/components/image/ImageUploader";
import { registerStudent } from "@/app/actions/auth";
import { IdCardIllustration } from "@/components/illustrations/Illustrations";

const YEARS = [
  { value: "1", label: "1st Year (Freshman)" },
  { value: "2", label: "2nd Year (Sophomore)" },
  { value: "3", label: "3rd Year (Junior)" },
  { value: "4", label: "4th Year (Senior)" },
  { value: "5", label: "5th Year (Postgraduate / Integrated)" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("1");
  const [password, setPassword] = useState("");
  const [idCardImageId, setIdCardImageId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idCardImageId) {
      setErrorMessage("Please upload a photograph of your student ID card.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await registerStudent({
      name,
      email,
      rollNumber,
      department,
      year: parseInt(year, 10),
      password,
      idCardImageId,
    });

    if (!res.success) {
      setIsLoading(false);
      setErrorMessage(res.error || "Failed to create account.");
      return;
    }

    // Auto sign in with credentials
    const loginRes = await signIn("credentials", {
      redirect: false,
      email: email.trim().toLowerCase(),
      password,
    });

    setIsLoading(false);

    if (loginRes?.ok) {
      router.push("/verify-pending");
      router.refresh();
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-[40px] sm:px-[48px] lg:px-[64px] py-8 sm:py-12">
      <div className="w-full max-w-lg bg-surface border-2.5 border-ink rounded-card p-6 sm:p-8 shadow-hard-card space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <IdCardIllustration size={64} />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink">
            Student Registration
          </h1>
          <p className="text-sm text-ink-soft">
            Join the campus lost and found network with your verified student identity
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Rahul Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="College Email"
              type="email"
              placeholder="rahul.s@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Roll Number / Student ID"
              placeholder="e.g. 21CS042"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Department / Branch"
              placeholder="e.g. Computer Science"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            />
            <Select
              label="Academic Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              options={YEARS}
            />
          </div>

          <Input
            label="Password (min 6 characters)"
            type="password"
            placeholder="Create a secure password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <div className="pt-2">
            <ImageUploader
              kind="ID_CARD"
              maxFiles={1}
              label="Student ID Card Photograph (Mandatory)"
              hint="Take a clear, legible photo of your physical student ID card to prevent spam."
              onImagesChange={(ids) => setIdCardImageId(ids[0] || null)}
            />
          </div>

          {errorMessage && (
            <div className="p-3 bg-blush border-2 border-ink text-coral text-xs rounded-input font-semibold">
              {errorMessage}
            </div>
          )}

          <Button
            type="submit"
            variant="accent"
            isLoading={isLoading}
            disabled={!idCardImageId}
            className="w-full mt-2"
          >
            Create Account
          </Button>
        </form>

        <div className="pt-4 border-t-2 border-paper text-center text-xs text-ink-soft">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-bold text-ink hover:text-coral underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
