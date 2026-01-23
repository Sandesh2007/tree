"use client";
import LoginForm from "@/components/login-form";
import LeftBlock from "@/components/left-block";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex bg-neutral-900">
      <div className="flex w-full min-h-screen">
        <LeftBlock />
        <div className="flex-1 flex min-h-screen">
          <LoginForm className="w-full h-full" />
        </div>
      </div>
    </main>
  );
}
