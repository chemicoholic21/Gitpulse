"use client";

import Link from "next/link";
import AuthButton from "./AuthButton";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 bg-[#0d1117]/80 backdrop-blur-xl">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-2xl shadow-white/20">
              <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-white font-serif text-2xl tracking-tight">GitPulse</span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-all">
              Identity
            </Link>
            <Link href="/discover" className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-all">
              Discover
            </Link>
            <Link href="/leaderboard" className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-all">
              Leaderboard
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-8">
           <AuthButton />
        </div>
      </div>
    </nav>
  );
}
