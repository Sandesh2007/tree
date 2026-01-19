"use client";
import React from "react";
import { useTheme } from "next-themes";

import { Moon, Sun } from "lucide-react";
import Button from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // const [mounted, setMounted] = React.useState(false);
  // useEffect(() => {
  //   setMounted(true);
  // }, []);

  // if (!mounted) {
  //   return null;
  // }

  return (
    <Button
      // className="outline-none text-black dark:text-white"
      variant={"ghost"}
      size="md"
      tooltip={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      onClick={() => {
        setTheme(theme === "dark" ? "light" : "dark");
      }}
    >
      {/* <SunMoon size={32} /> */}
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
