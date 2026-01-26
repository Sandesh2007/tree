"use client";

import { SignupForm } from "@/components/signup-form";
import LeftBlock from "@/components/left-block";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex bg-neutral-900">
      <div className="flex w-full">
        <LeftBlock />
        <div className="flex-1 flex">
          <SignupForm className="w-full h-full" />
        </div>
      </div>
    </main>
  );
}
