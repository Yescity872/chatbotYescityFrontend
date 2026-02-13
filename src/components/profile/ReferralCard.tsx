// components/profile/ReferralCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { FaUsers, FaShare } from "react-icons/fa";
import toast from "react-hot-toast";
import ref from "../../../public/images/ref.png";

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

interface ReferralCardProps {
  user: User;
  onGenerateReferralLink: () => void;
}

export default function ReferralCard({ user, onGenerateReferralLink }: ReferralCardProps) {
  return (
    <div className="bg-[#E6FFEE] border border-gray-200 rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-2xl shadow-md">
          <FaUsers className="text-white text-2xl" />
        </div>
        <h2 className="text-green-600 text-xl md:text-2xl font-semibold">Referrals</h2>
      </div>
      <div className="flex space-y-6 justify-between items-center mb">
        {/* Referral Info */}
        <div className="space-y-4 mb-6 ">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-gray-600 font-medium text-base sm:text-lg">Your Code:</span>
            <span className="text-gray-700 font-mono font-bold text-xl">{user.referralCode || "Not Set"}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-gray-600 font-medium text-base sm:text-lg">Referred By:</span>
            <span className="text-gray-700 font-bold text-lg">{user.referredBy || "Nobody"}</span>
          </div>
        </div>
        <div>
          <Image src={ref} alt="ref" width={150} height={150} />
        </div>
        <div className="space y-8 flex flex-col gap-4">
          <div className="bg-[#75CE88] p-1 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-md hover:shadow-lg transform hover:scale-105">
            <span className="text-gray-600 font-medium text-base sm:text-lg">Total Referrals:</span>
            <span className="text-gray-700 font-bold text-2xl">{user.referralCount}</span>
          </div>

          {/* Action Button */}
          <button
            onClick={onGenerateReferralLink}
            className="w-full bg-[#037746] p-2 text-white rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <FaShare className="text-xl" />
            <span>Share & Earn</span>
          </button>
        </div>

      </div>
    </div>
  );
}