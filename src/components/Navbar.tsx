"use client";

import Link from"next/link";
import AuthButton from"./AuthButton";
import { useState } from"react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 bg-gray-950/80 backdrop-blur-xl">
      <div className="container mx-auto px-6 h-24 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center group shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="Git Pull Talent" width={120} height={120} className="w-16 lg:w-[120px] h-auto group-hover:scale-110 transition-all duration-500 drop-shadow-lg" />
            <span className="text-white  text-lg lg:text-2xl tracking-tight -ml-2 lg:-ml-4 whitespace-nowrap">Git Pull Talent</span>
          </Link>

          <div className="hidden lg:flex items-center gap-10">
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

        <div className="hidden lg:flex items-center gap-8">
           <AuthButton />
        </div>

        {/* Mobile Hamburger Button */}
        <button
 className="lg:hidden text-white focus:outline-none p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-24 left-0 right-0 bg-gray-950/95 border-b border-white/5 backdrop-blur-xl flex flex-col items-center py-6 gap-6 shadow-2xl">
          <Link href="/" onClick={() => setIsOpen(false)} className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-all">
            Identity
          </Link>
          <Link href="/discover" onClick={() => setIsOpen(false)} className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-all">
            Discover
          </Link>
          <Link href="/leaderboard" onClick={() => setIsOpen(false)} className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-all">
            Leaderboard
          </Link>
          <div className="pt-4 border-t border-white/10 w-full flex justify-center">
            <AuthButton />
          </div>
        </div>
      )}
    </nav>
  );
}
