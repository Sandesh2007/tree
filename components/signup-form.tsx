"use client";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { ArrowRight, Loader2, TreePalm } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FaApple, FaGithub, FaGoogle } from "react-icons/fa";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await axios.post("/api/signup", {
        name,
        email,
        password,
      });

      if (res.data.success) {
        toast.success("Account created successfully");
        setTimeout(() => router.push("/dashboard"), 1500);
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Signup failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col w-full h-full", className)} {...props}>
      <Card className="flex-1 overflow-hidden p-0 rounded-none md:rounded-r-2xl border-0 bg-neutral-50 dark:bg-neutral-900">
        <CardContent className="flex flex-col h-full p-0">
          <div className="md:hidden flex justify-center pt-8">
            <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <TreePalm className="w-10 h-10 text-blue-400" />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center md:px-12 lg:px-16">
            <form className="max-w-md mx-auto w-full" onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center mt-8">
                  <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                    Create Account
                  </h1>
                  <p className="text-neutral-600 dark:text-gray-400">
                    Join Tree Org today
                  </p>
                </div>

                <Field className="space-y-2">
                  <FieldLabel className="text-sm text-neutral-700 dark:text-gray-300">
                    Full Name
                  </FieldLabel>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full h-14 bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl text-base text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </Field>

                <Field className="space-y-2">
                  <FieldLabel className="text-sm text-neutral-700 dark:text-gray-300">
                    Email
                  </FieldLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="m@example.com"
                    required
                    className="w-full h-14 bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl text-base text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </Field>

                <Field className="space-y-2">
                  <FieldLabel className="text-sm text-neutral-700 dark:text-gray-300">
                    Password
                  </FieldLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-14 bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl text-base text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <FieldDescription className="text-xs text-neutral-500 dark:text-gray-500">
                    Minimum 8 characters
                  </FieldDescription>
                </Field>

                <Field className="space-y-2">
                  <FieldLabel className="text-sm text-neutral-700 dark:text-gray-300">
                    Confirm Password
                  </FieldLabel>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-14 bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl text-base text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </Field>

                <Field className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full p-4 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-base font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Sign up
                        <ArrowRight size={18} />
                      </>
                    )}
                  </Button>
                </Field>

                <FieldSeparator className="my-6">
                  <span className="px-4 text-neutral-600 dark:text-gray-400 text-sm">
                    Or continue with
                  </span>
                </FieldSeparator>

                <Field className="grid grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="py-3 bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl hover:bg-neutral-50 dark:hover:bg-white/10"
                  >
                    <FaApple className="h-5 w-5 text-neutral-900 dark:text-white" />
                  </Button>
                  <Button
                    variant="outline"
                    className="py-3 bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl hover:bg-neutral-50 dark:hover:bg-white/10"
                  >
                    <FaGoogle className="h-5 w-5 text-neutral-900 dark:text-white" />
                  </Button>
                  <Button
                    variant="outline"
                    className="py-3 bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl hover:bg-neutral-50 dark:hover:bg-white/10"
                  >
                    <FaGithub className="h-5 w-5 text-neutral-900 dark:text-white" />
                  </Button>
                </Field>

                <FieldDescription className="text-center text-neutral-600 dark:text-gray-400 mt-6">
                  Already have an account?{" "}
                  <a
                    href="/login"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    Sign in
                  </a>
                </FieldDescription>
              </FieldGroup>
            </form>
          </div>

          <div className="px-6 py-6 text-center">
            <FieldDescription className="text-xs text-neutral-500 dark:text-gray-500">
              By clicking continue, you agree to our{" "}
              <a className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Terms
              </a>{" "}
              and{" "}
              <a className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Privacy Policy
              </a>
              .
            </FieldDescription>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
