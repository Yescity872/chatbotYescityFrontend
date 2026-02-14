"use client";

import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Settings, Award, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

interface ProfileDropdownProps {
  user: {
    username: string;
    email?: string;
    profileImage?: string;
    contributionPoints?: number;
  };
  handleSignOut: () => void;
}

export default function ProfileDropdown({ user, handleSignOut }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-all duration-200 focus:outline-none"
      >
        <div className="relative w-10 h-10 rounded-full border-2 border-blue-500 overflow-hidden shadow-sm">
          <Image
            src={user.profileImage || "/images/default-avatar.png"}
            alt={user.username}
            fill
            className="object-cover"
          />
        </div>
        <ChevronDown 
          size={16} 
          className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            {/* User Info Header */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-white border-b border-gray-100">
              <p className="font-bold text-gray-800 truncate">{user.username}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              
              <div className="mt-3 flex items-center gap-2 bg-white/80 p-2 rounded-xl shadow-sm border border-blue-50">
                <Award size={16} className="text-blue-500" />
                <span className="text-sm font-semibold text-gray-700">
                  {user.contributionPoints ?? 0} <span className="text-xs font-normal text-gray-500">Points</span>
                </span>
              </div>
            </div>

            {/* Menu Links */}
            <div className="p-2">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <User size={18} />
                Profile
              </Link>
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <Settings size={18} />
                Settings
              </Link>
            </div>

            {/* Logout Action */}
            <div className="p-2 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleSignOut();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
