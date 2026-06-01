'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/') return null;

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleBack}
      aria-label="Go back"
      className="fixed top-4 left-4 z-[100] h-9 gap-1.5 rounded-lg border border-white/[0.06] bg-[hsl(222,47%,4%)]/80 px-3 text-[13px] text-white/50 backdrop-blur-xl hover:bg-white/[0.06] hover:text-white"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
}
