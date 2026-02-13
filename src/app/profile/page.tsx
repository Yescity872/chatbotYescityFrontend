// Main Profile Page - pages/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { HiSparkles } from "react-icons/hi";
import toast from "react-hot-toast";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PersonalInfoCard from "@/components/profile/PersonalInfoCard";
import SubscriptionCard from "@/components/profile/SubscriptionCard";
import ReferralCard from "@/components/profile/ReferralCard";
import RewardsCard from "@/components/profile/RewardsCard";
import ReferralModal from "@/components/profile/ReferralModal";

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

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Referral modal states
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralLink, setReferralLink] = useState("");
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/profile`, {
          method: "GET",
          credentials: "include",
          headers: {
            ...(localStorage.getItem("token")
              ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
              : {}),
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Login please");
          return;
        }

        console.log(data.user);
        setUser(data.user);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);


  const generateReferralLink = () => {
    if (!user?.referralCode) return;

    console.log(process.env.NEXT_PUBLIC_FRONTEND_URL);
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
    console.log("Base URL:", baseUrl);

    // Encode phone number for referral tracking
    const encodedCode = btoa(user.referralCode); // base64 encoding

    const link = `${baseUrl}/signup?ref=${encodedCode}`;
    setReferralLink(link);
    setShowReferralModal(true);
  };

  const closeReferralModal = () => {
    setShowReferralModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-gray-100 to-blue-50"></div>
        <div className="relative z-10 text-center">
          <div className="mb-5">
            <div className="flex items-center justify-center space-x-2">
              <HiSparkles className="text-[#1E88E5] text-xl animate-pulse" />
              <span className="text-black text-xl font-semibold">
                Loading your vibe...
              </span>
              <HiSparkles className="text-[#1E88E5] text-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded-3xl p-8 text-center backdrop-blur-xl">
          <div className="text-6xl mb-4">💀</div>
          <p className="text-red-400 text-xl font-semibold mb-2">
            Oops! Something went wrong
          </p>
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-white/10 border border-white/20 rounded-3xl p-8 text-center backdrop-blur-xl">
          <p className="text-white text-xl">No user data found 🤷‍♂️</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden pt-8">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#1E88E5]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#1E88E5]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
      </div>

      {/* Error Messages */}
      {uploadError && (
        <div className="fixed top-4 left-4 right-4 z-50">
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-4 rounded-2xl backdrop-blur-xl animate-slideInTop">
            <div className="flex items-center space-x-2">
              <span className="text-xl">⚠️</span>
              <span>{uploadError}</span>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 min-h-screen pt-20 pb-8 px-4 items-center">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">

          {/* Profile Header */}
          <ProfileHeader
            user={user}
            setUser={setUser}
            uploading={uploading}
            setUploading={setUploading}
            setUploadError={setUploadError}
          />

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-4 mb-5 col-span-2">

            {/* Personal Info Card */}
            <PersonalInfoCard
              user={user}
              setUser={setUser}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5 col-span-2">
              {/* Subscription Card */}
              <SubscriptionCard user={user} />

              {/* Rewards Card */}
              <RewardsCard user={user} />
            </div>

          </div>

        </div>
        <div className="max-w-6xl items-center mx-auto">
          {/* Referral Card */}
          <ReferralCard
            user={user}
            onGenerateReferralLink={generateReferralLink}
          />
        </div>
      </div>

      {/* Referral Modal */}
      <ReferralModal
        showModal={showReferralModal}
        referralLink={referralLink}
        onClose={closeReferralModal}
      />

      <style jsx>{`
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: float 6s ease-in-out infinite 3s;
        }
        .animate-slideInTop {
          animation: slideInTop 0.5s ease-out;
        }
        .animate-slideInUp {
          animation: slideInUp 0.3s ease-out;
        }
        .border-3 {
          border-width: 3px;
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }
        @keyframes slideInTop {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slideInUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}