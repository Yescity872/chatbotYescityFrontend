// components/profile/ProfileHeader.tsx
"use client";

import { useRef } from "react";
import { FaCamera, FaPen, FaFileUpload, FaPhoneAlt, FaSignOutAlt, FaCrown, FaMailBulk } from "react-icons/fa";
import { getPremiumStatus } from "@/utils/premiumUtils";
import { handleImageUpload } from "@/utils/uploadImage";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type User = {
  _id: string;
  email: string;
  username: string;
  phone: string;
  profileImage?: string;
  isPremium: "FREE" | "A" | "B";
  premiumStartDate?: string;
  premiumExpiryDate?: string | null;
  referralCode?: string;
  referredBy?: string;
  contributionPoints: number;
  referralCount: number;
};

interface ProfileHeaderProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  uploading: boolean;
  setUploading: React.Dispatch<React.SetStateAction<boolean>>;
  setUploadError: React.Dispatch<React.SetStateAction<string>>;
}

export default function ProfileHeader({ 
  user, 
  setUser, 
  uploading, 
  setUploading, 
  setUploadError 
}: ProfileHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && fileInputRef.current) {
      const nonNullRef = { current: fileInputRef.current };
      handleImageUpload(
        file,
        setUser,
        setUploadError,
        setUploading,
        nonNullRef
      );
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success) {
        localStorage.removeItem("token")      // ✅ remove token
        localStorage.removeItem("user");
        localStorage.removeItem("isPremium");

        toast.success("Logged out successfully!", { duration: 2000 });

        setTimeout(() => {
          window.location.reload();
          router.push("/");
        }, 1000);
      } else {
        toast.error(data.message || "Logout failed!");
      }
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Logout failed. Please try again.");
    }
  };

  const premiumStatus = getPremiumStatus(
    user.isPremium,
    user.premiumExpiryDate || null
  );

  // Helper to mask email: first 2 letters + *** + domain
  const maskEmail = (email: string) => {
    const [local, domain] = email.split("@");
    if (!domain) return email;
    if (local.length <= 2) return `${local}***@${domain}`;
    const firstTwo = local.slice(0, 2);
    return `${firstTwo}***@${domain}`;
  };

  return (
    <div className="bg-[#2D79C5] rounded-3xl p-8 mb-5 relative shadow-xl border border-gray-100 col-span-1">
      <div className="flex flex-col items-center space-y-8">
        {/* Profile Image */}
        <div className="relative group">
          <div className="relative w-40 h-40 lg:w-48 lg:h-48 rounded-full border-4 border-gradient-to-r from-blue-400 to-purple-500 p-1 overflow-hidden shadow-2xl transform transition-all duration-300 hover:scale-105 hover:rotate-2">
            <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
              <img
                src={user.profileImage || "/assets/default-avatar.jpg"}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div
            className="absolute bottom-3 right-8 z-10 bg-white p-2 rounded-full"
            onClick={triggerFileSelect}
          >
            {uploading ? (
              <FaFileUpload className="animate-pulse" />
            ) : (
              <FaPen className="h-5 w-5 relative z-10" />
            )}
          </div>

          <div
            className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm"
            onClick={triggerFileSelect}
          >
            {uploading ? (
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <span className="text-white text-sm font-semibold">
                  Uploading...
                </span>
              </div>
            ) : (
              <div className="text-center">
                <FaCamera className="text-white text-3xl mb-2 mx-auto drop-shadow-lg" />
                <span className="text-white text-sm font-semibold">
                  Change Photo
                </span>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </div>

        {/* User Info */}
        <div className="text-white text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <h1 className="text-4xl lg:text-4xl font-extrabold bg-gradient-to-r text-white bg-clip-text">
              {user.username}
            </h1>
          </div>

          <p className="text-white text-lg font-medium">
            <span><FaMailBulk className="inline mr-2" /></span>
            {maskEmail(user.email)}
          </p>

          {user.phone && (
            <p className="text-white text-base font-medium flex items-center justify-center space-x-2">
              <span><FaPhoneAlt /></span>
              <span>{user.phone}</span>
            </p>
          )}


          <div className="flex items-center justify-center space-x-4 pt-4">
            <div
              className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-base font-bold border-2 shadow-lg transform transition-all duration-300 hover:scale-105 ${user.isPremium !== "FREE"
                ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white border-yellow-400"
                : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300 shadow-gray-200"
                }`}
            >
              {user.isPremium !== "FREE" && (
                <FaCrown className="inline mr-2 text-white drop-shadow-sm" />
              )}
              {user.isPremium === "A" ? "GOLD" : premiumStatus.text}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-4 md:px-6 py-2 md:py-3 bg-red-100 hover:bg-red-500 text-gray-700 hover:text-white border-2 border-gray-300 hover:border-red-500 rounded-full font-bold transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
