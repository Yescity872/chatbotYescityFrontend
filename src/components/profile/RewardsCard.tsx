// components/profile/RewardsCard.tsx
"use client";

import { FaGift, FaExternalLinkAlt, FaStar, FaRegStar } from "react-icons/fa";

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

interface RewardsCardProps {
  user: User;
}

export default function RewardsCard({ user }: RewardsCardProps) {
  return (
    <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 pb-16">
      <div className="flex items-center space-x-4 mb-5">
        <div className="bg-gradient-to-br from-blue-500 to-blue-400 p-3 rounded-2xl shadow-lg">
          <FaGift className="text-white text-2xl" />
        </div>
        <h2 className="text-blue-400 text-lg md:text-2xl font-bold">
          Rewards
        </h2>
        <a
          href="https://yc-contri.vercel.app/rewards"
          className="text-[#1E88E5] hover:text-yellow-400 transition-all duration-300 transform hover:scale-125"
        >
          <FaExternalLinkAlt className="text-lg" />
        </a>
      </div>

      <div className="space-y-2 md:space-y-4 mb-5">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-semibold text-lg">
            Points
          </span>
          <div className="flex items-center space-x-3">
            <span className="text-blue-400 font-bold text-4xl">
              {user.contributionPoints}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <span className="text-gray-600 text-base font-semibold">
            Level Progress
          </span>
          <span className="text-blue-400 text-base font-bold">
            {user.contributionPoints}/2000
          </span>
        </div>

        {/* Progress Bar with Milestones */}
        <div className="relative w-full">
          {/* Progress Bar */}
          <div className="w-full bg-gray-300 rounded-full h-5 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-[#1E88E5] via-blue-500 to-purple-500 h-5 rounded-full transition-all duration-1000 ease-out shadow-lg"
              style={{
                width: `${Math.min(
                  (user.contributionPoints / 2000) * 100,
                  100
                )}%`,
              }}
            ></div>

            {/* Milestone markers */}
            {[200, 500, 1000, 2000].map((milestone) => {
              const percent = (milestone / 2000) * 100;
              const reached = user.contributionPoints >= milestone;
              return (
                <div
                  key={milestone}
                  className="absolute top-1/2"
                  style={{
                    left: `${percent}%`,
                    transform: "translateX(-50%) translateY(-50%)",
                  }}
                >
                  <div
                    className={`w-3 h-5 rounded-full border-2 shadow-lg ${reached
                        ? "bg-[#1E88E5] border-white"
                        : "bg-white border-gray-400"
                      }`}
                  ></div>
                </div>
              );
            })}
          </div>

          {/* Icons under milestones */}
          {[200, 500, 1000, 2000].map((milestone) => {
            const percent = (milestone / 2000) * 100;
            const reached = user.contributionPoints >= milestone;
            return (
              <div
                key={milestone}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${percent}%`,
                  top: "2rem",
                  transform: "translateX(-50%)",
                }}
              >
                {reached ? (
                  <FaStar className="text-yellow-500 text-2xl mb-2 drop-shadow-lg" />
                ) : (
                  <FaRegStar className="text-gray-400 text-2xl mb-2" />
                )}
                <span className="text-sm font-bold text-gray-600">
                  {milestone}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
