"use client";

import { SignupForm } from "@/components/signup-form";
import LeftBlock from "@/components/left-block";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex bg-neutral-900">
      <div className="flex w-full min-h-screen">
        <LeftBlock />
        <div className="flex-1 flex min-h-screen">
          <SignupForm className="w-full h-full" />
        </div>
      </div>
    </main>
  );
}
