"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const APP_SHELL_ROUTES = [
  "/dashboard",
  "/problems",
  "/analytics",
  "/recommendations",
  "/integrations",
  "/leaderboard",
  "/settings",
];

function isAppShellRoute(pathname: string) {
  return APP_SHELL_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/" || isAppShellRoute(pathname)) {
    return null;
  }

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleBack}
      aria-label="Go back"
      className="fixed top-4 left-4 z-[100] h-9 gap-1.5 bg-transparent px-2 text-[13px] text-white/50 shadow-none hover:bg-transparent hover:text-white"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
}
