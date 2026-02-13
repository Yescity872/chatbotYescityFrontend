// components/profile/SubscriptionCard.tsx
"use client";

import { FaCrown, FaExternalLinkAlt } from "react-icons/fa";
import { getPremiumStatus, formatDate } from "@/utils/premiumUtils";

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

interface SubscriptionCardProps {
  user: User;
}

export default function SubscriptionCard({ user }: SubscriptionCardProps) {
  const premiumStatus = getPremiumStatus(
    user.isPremium,
    user.premiumExpiryDate || null
  );

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-3 rounded-2xl shadow-md">
          <FaCrown className="text-white text-2xl" />
        </div>
        <h2 className="text-yellow-600 text-xl md:text-2xl font-semibold">
          Subscription
        </h2>
            <a
            href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/premium`}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-yellow-100 text-yellow-600 hover:text-yellow-700 transition-all duration-300"
            >
            <FaExternalLinkAlt className="text-sm" />
            </a>

      </div>

      {/* Subscription Details */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <span className="text-gray-600 font-medium text-base sm:text-lg">
            Plan:
          </span>
            <div
            className={`px-4 py-1 rounded-full text-base font-semibold shadow-md ${
                user.isPremium !== "FREE"
                ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white"
                : "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700"
            }`}
            >
            {user.isPremium === "A" ? "GOLD" : premiumStatus.text}
            </div>

        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <span className="text-gray-600 font-medium text-base sm:text-lg">
            Start Date:
          </span>
          <span className="text-gray-700 font-semibold text-lg">
            {formatDate(user.premiumStartDate)}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <span className="text-gray-600 font-medium text-base sm:text-lg">
            Expires:
          </span>
          <span className="text-gray-700 font-semibold text-lg">
            {user.premiumExpiryDate
              ? formatDate(user.premiumExpiryDate)
              : "Never ♾️"}
          </span>
        </div>
      </div>
    </div>
  );
}
