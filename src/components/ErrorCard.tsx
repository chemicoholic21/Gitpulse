"use client";

import { signIn } from"next-auth/react";
import Link from"next/link";

interface ErrorCardProps {
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function ErrorCard({ message, action }: ErrorCardProps) {
  const isRateLimit = message.toLowerCase().includes("rate limit");
  const isNotFound = message.toLowerCase().includes("not found");

  return (
    <div className="max-w-md mx-auto p-8 bg-gray-900 border border-gray-800 rounded-md shadow-2xl text-center animate-in zoom-in-95 duration-300">
      <div className="w-16 h-16 bg-gray-950 border border-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
        {isRateLimit ? (
          <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : isNotFound ? (
          <svg className="w-8 h-8 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
      </div>

      <h2 className="text-xl font-bold text-white mb-3">
        {isRateLimit ?"Limit Reached" : isNotFound ?"User Not Found" :"Analysis Failed"}
      </h2>
      
      <p className="text-gray-400 text-sm mb-8 leading-relaxed">
        {message}
      </p>

      <div className="flex flex-col gap-3">
        {isRateLimit && (
          <button
            onClick={() => signIn("github")}
 className="w-full bg-white text-gray-950 font-bold py-3 rounded hover:bg-gray-200 transition-colors shadow-lg"
          >
            Log in with GitHub
          </button>
        )}

        {action && (
          <button
            onClick={action.onClick}
 className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded border border-gray-700 transition-colors"
          >
            {action.label}
          </button>
        )}

        <Link
          href="/"
 className="text-xs text-gray-600 hover:text-gray-400 uppercase tracking-widest font-bold pt-2 transition-colors"
        >
          &larr; Back to search
        </Link>
      </div>

      {isRateLimit && (
        <p className="mt-6 text-[10px] text-gray-600 uppercase tracking-tighter font-bold">
          Unlock 5,000 requests/hr with OAuth
        </p>
      )}
    </div>
  );
}
