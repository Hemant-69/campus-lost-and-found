"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { KeyIllustration } from "@/components/illustrations/Illustrations";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (!res?.error) {
        router.push("/posts");
        router.refresh();
      } else {
        setErrorMessage("Invalid college email or password. Please verify your credentials.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred during sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-[40px] sm:px-[48px] lg:px-[64px] py-8 sm:py-12">
      <div className="w-full max-w-md bg-surface border-2.5 border-ink rounded-card p-6 sm:p-8 shadow-hard-card space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <KeyIllustration size={56} />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink">Sign In</h1>
          <p className="text-sm text-ink-soft">
            Access the verified campus lost and found network
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="College Email Address"
            type="email"
            placeholder="student@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {errorMessage && (
            <div className="p-3 bg-blush border-2 border-ink text-coral text-xs rounded-input font-semibold">
              {errorMessage}
            </div>
          )}

          <Button
            type="submit"
            variant="accent"
            isLoading={isLoading}
            className="w-full mt-2"
          >
            Sign In
          </Button>
        </form>

        <div className="pt-4 border-t-2 border-paper text-center text-xs text-ink-soft">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/register"
            className="font-bold text-ink hover:text-coral underline"
          >
            Register with Student ID
          </Link>
        </div>
      </div>
    </div>
  );
}
