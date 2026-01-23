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
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FaApple, FaGithub, FaGoogle } from "react-icons/fa";

export default function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formdata = { email, password };

    try {
      const response = await axios.post("/api/login", formdata);

      if (response.data.success) {
        toast.success("Logged in successfully");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 401) {
          toast.error(
            error.response?.data.message ||
              "Invalid Credentials. Please try again.",
          );
        } else {
          toast.error(error.response.data.message || "Internal Server error");
        }
      } else {
        toast.error("Unable to connect to the Server");
      }
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

          <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-16">
            <form className="max-w-md mx-auto w-full" onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center mb-8">
                  <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                    Welcome back
                  </h1>
                  <p className="text-neutral-600 dark:text-gray-400">
                    Login to your Tree Org account
                  </p>
                </div>

                <Field className="space-y-2">
                  <FieldLabel
                    htmlFor="email"
                    className="text-sm text-neutral-700 dark:text-gray-300 text-md"
                  >
                    Email
                  </FieldLabel>

                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="
                      w-full
                      h-14
                      bg-white dark:bg-white/5
                      border border-neutral-300 dark:border-white/10
                      rounded-xl
                      text-base text-neutral-900 dark:text-white
                      placeholder-neutral-400 dark:placeholder-gray-500
                      focus:border-blue-500
                      focus:ring-2 focus:ring-blue-500/20
                      transition-all
                    "
                  />
                </Field>

                <Field className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FieldLabel
                      htmlFor="password"
                      className="text-neutral-700 dark:text-gray-300 text-md"
                    >
                      Password
                    </FieldLabel>
                    <a
                      href="#"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="
                    w-full
                    h-14
                    bg-white dark:bg-white/5
                    border border-neutral-300 dark:border-white/10
                    rounded-xl
                    text-base text-neutral-900 dark:text-white
                    placeholder-neutral-400 dark:placeholder-gray-500
                    focus:border-blue-500
                    focus:ring-2 focus:ring-blue-500/20
                    transition-all
                    "
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
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight size={18} />
                      </>
                    )}
                  </Button>
                </Field>

                <FieldSeparator className="my-6">
                  <span className="px-4 bg-transparent text-neutral-600 dark:text-gray-400 text-sm">
                    Or continue with
                  </span>
                </FieldSeparator>

                <Field className="grid grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    type="button"
                    className="py-3 bg-white dark:bg-white/5 hover:bg-neutral-50 dark:hover:bg-white/10 border border-neutral-300 dark:border-white/10 rounded-xl transition-all"
                  >
                    <FaApple className="h-5 w-5 text-neutral-900 dark:text-white" />
                    <span className="sr-only">Login with Apple</span>
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    className="py-3 bg-white dark:bg-white/5 hover:bg-neutral-50 dark:hover:bg-white/10 border border-neutral-300 dark:border-white/10 rounded-xl transition-all"
                  >
                    <FaGoogle className="h-5 w-5 text-neutral-900 dark:text-white" />
                    <span className="sr-only">Login with Google</span>
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    className="py-3 bg-white dark:bg-white/5 hover:bg-neutral-50 dark:hover:bg-white/10 border border-neutral-300 dark:border-white/10 rounded-xl transition-all"
                  >
                    <FaGithub className="h-5 w-5 text-neutral-900 dark:text-white" />
                    <span className="sr-only">Login with GitHub</span>
                  </Button>
                </Field>

                <FieldDescription className="text-center text-neutral-600 dark:text-gray-400 mt-6">
                  Don&apos;t have an account?{" "}
                  <a
                    href="/signup"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    Sign up
                  </a>
                </FieldDescription>
              </FieldGroup>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-6 text-center">
            <FieldDescription className="text-xs text-neutral-500 dark:text-gray-500">
              By clicking continue, you agree to our{" "}
              <a
                href="#"
                className="text-neutral-600 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="text-neutral-600 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
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
