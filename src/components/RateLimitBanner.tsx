"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { Github, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RateLimitBanner() {
  const { status } = useSession();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem("rate-limit-banner-dismissed");
    if (status === "unauthenticated" && !isDismissed) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [status]);

  const handleDismiss = () => {
    sessionStorage.setItem("rate-limit-banner-dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl z-50 animate-in slide-in-from-bottom-12 duration-700 ease-out">
      <div className="bg-neutral-900 border border-neutral-800 shadow-2xl shadow-black/50 p-5 rounded-md flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
        {/* Subtle accent line */}
        <div className="absolute top-0 left-0 w-1 h-full bg-green-500/50" />
        
        <div className="w-12 h-12 bg-neutral-950 border border-neutral-800 rounded flex items-center justify-center shrink-0 group-hover:border-green-500/30 transition-colors duration-500">
          <ShieldAlert className="w-6 h-6 text-green-400 opacity-80" />
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-1">
          <h4 className="text-white text-xs font-mono font-bold uppercase tracking-[0.2em]">Shared Protocol Active</h4>
          <p className="text-neutral-500 text-[11px] leading-relaxed uppercase tracking-wider font-medium">
            Anonymous users share a global rate limit. <br className="hidden md:block" />
            Authenticate for <span className="text-white font-mono font-bold">5,000</span> units/hr and priority analysis.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button
            onClick={() => signIn("github")}
            className="flex-1 md:flex-none bg-white text-black hover:bg-neutral-200 text-[10px] font-black uppercase tracking-[0.2em] h-10 px-6 rounded-none transition-all"
          >
            <Github className="mr-2 h-3.5 w-3.5" />
            Authorize
          </Button>
          
          <button
            onClick={handleDismiss}
            className="text-neutral-600 hover:text-white p-2 transition-colors absolute top-2 right-2 md:relative md:top-0 md:right-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
