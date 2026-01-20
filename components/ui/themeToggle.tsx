"use client";
import { useTheme } from "next-themes";

import { Moon, Sun } from "lucide-react";
import Button from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      className="hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-950 dark:text-neutral-50"
      tooltip={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      onClick={() => {
        setTheme(theme === "dark" ? "light" : "dark");
      }}
    >
      {/* <SunMoon size={32} /> */}
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  );
}
