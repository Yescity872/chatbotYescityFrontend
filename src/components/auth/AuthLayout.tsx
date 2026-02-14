"use client";

import Link from "next/link";
import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  footerContent?: React.ReactNode;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  footerContent,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-white overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          href="/"
          className="mb-6 flex items-center text-sky-600 hover:text-sky-700 transition-colors font-medium"
        >
          ← Back to Home
        </Link>

        <div className="rounded-3xl bg-white shadow-2xl border border-sky-100 overflow-hidden">
          <div className="px-8 py-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
              <p className="text-sky-600">{subtitle}</p>
              <div className="w-16 h-1 bg-gradient-to-r from-sky-400 to-blue-500 mx-auto rounded-full mt-4"></div>
            </div>

            {children}
          </div>

          {/* Footer */}
          {footerContent && (
            <div className="border-t border-gray-100 bg-sky-50 px-8 py-4 text-center">
              {footerContent}
            </div>
          )}
        </div>

        {/* Legal Footer */}
        <footer className="mt-8 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} YesCity. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
