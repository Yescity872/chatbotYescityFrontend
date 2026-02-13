"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BsStar, BsFillGiftFill } from "react-icons/bs";
import { HiOutlineSparkles } from "react-icons/hi";
import LoginForm from "@/components/home/LoginForm"; // ✅ import your Login component
// import LoginForm from "@/components/home/LoginForm";
import { openRazorpayCheckout } from "@/utils/razorpayUtils";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface Plan {
  id: string;
  name: string;
  duration: string;
  credits: number;
  price: number;
  originalPrice?: number;
  isFree?: boolean;
  comingSoon?: boolean;
}

const PLANS: Plan[] = [
  { id: "plan_free", name: "FREE", duration: "Lifetime", credits: 50, price: 0 },
  {
    id: "plan_gold",
    name: "GOLD PREMIUM",
    duration: "3 Months",
    credits: 300,
    price: 499,
    originalPrice: 999,
    isFree: true,
  },
  {
    id: "plan_diamond",
    name: "DIAMOND PREMIUM",
    duration: "6 Months",
    credits: 1000,
    price: 999,
    comingSoon: true,
  },
];

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(false);
  const [userPremium, setUserPremium] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // ✅ Login modal
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingGoldUpgrade, setPendingGoldUpgrade] = useState(false);

  // ✅ Fetch user profile
  const fetchUserProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/profile`, {
        method: "GET",
        credentials: "include",
      });
      // const data = await res.json();

      // if (res.ok && data.user) {
      // Check if response is OK and has content
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // Check if response has content before parsing JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

      const text = await res.text();

      // Check if response body is not empty
      if (!text) {
        throw new Error("Empty response body");
      }

      const data = JSON.parse(text);

      if (data.user) {
        setIsAuthenticated(true);

        let premiumVal: string | null = null;
        if (typeof data.user.premiumType === "string" && data.user.premiumType) premiumVal = data.user.premiumType;
        else if (typeof data.user.premium === "string" && data.user.premium) premiumVal = data.user.premium;
        else if (typeof data.user.isPremium === "string" && data.user.isPremium) premiumVal = data.user.isPremium;
        else if (data.user.isPremium === true) premiumVal = "A";
        else premiumVal = "FREE";

        setUserPremium(premiumVal);
        console.log("Profile fetched. premium:", premiumVal);
      } else {
        setIsAuthenticated(false);
        setUserPremium(null);
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setIsAuthenticated(false);
      setUserPremium(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // ✅ Upgrade logic
  const upgradeToGold = async () => {
    if (profileLoading) return;

    if (!isAuthenticated) {
      setPendingGoldUpgrade(true);
      setShowLoginModal(true);
      return;
    }

    if (userPremium === "A") return;

    try {
      setLoading(true);
      // const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/premium/A`, {
      //   method: "POST",
      //   credentials: "include",
      // });
      // const data = await res.json();

      // if (res.ok) {
      //   alert("🎉 Successfully upgraded to GOLD PREMIUM!");
      //   setUserPremium("A");
      // } else {
      //   console.error("Upgrade failed:", data);
      //   alert("⚠ Could not upgrade, try again.");
      // }
      await openRazorpayCheckout({
        premiumType: "A",
        amount: 0,
        currency: "INR",
        description: "YesCity Gold Premium - 3 Months",
      });
    } catch (err) {
      console.error("Upgrade failed:", err);
      alert("⚠ Could not process payment, try again.");
    } finally {
      setLoading(false);
      setPendingGoldUpgrade(false);
    }
  };

  // ✅ run upgrade automatically after login + profile refresh
  useEffect(() => {
    if (pendingGoldUpgrade && isAuthenticated && !profileLoading) {
      upgradeToGold();
      setPendingGoldUpgrade(false);
    }
  }, [pendingGoldUpgrade, isAuthenticated, profileLoading]);

  // ✅ Login success handler
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowLoginModal(false);
    fetchUserProfile() // refresh local profile

    // 🔑 Tell Navbar to refresh itself
    window.dispatchEvent(new Event("userLoggedIn"))
  };

  // ✅ Icon generator
  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case "FREE":
        return <BsFillGiftFill className="w-8 h-8 text-green-600" />;
      case "GOLD PREMIUM":
        return <BsStar className="w-8 h-8 text-yellow-500" />;
      case "DIAMOND PREMIUM":
        return <HiOutlineSparkles className="w-8 h-8 text-silver-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 px-4 pt-32 pb-12">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-extrabold mb-4 text-center text-[#1E88E5]"
      >
        Upgrade to YesCity Premium
      </motion.h1>
      <p className="text-gray-600 text-center mb-12">Choose your plan and unlock exclusive features</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {PLANS.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: plan.comingSoon ? 1 : 1.03 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative rounded-2xl p-6 shadow-sm border flex flex-col items-center text-center">
              <div className="mb-4 flex flex-col items-center gap-2">
                {getPlanIcon(plan.name)}
                <h3
                  className={`text-lg font-semibold ${plan.name === "FREE"
                      ? "text-green-600"
                      : plan.name === "GOLD PREMIUM"
                        ? "text-yellow-600"
                        : "text-silver-600"
                    }`}
                >
                  {plan.name}
                </h3>

                {plan.comingSoon ? (
                  <span className="inline-block mt-2 px-3 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                    Coming Soon
                  </span>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-black flex items-center justify-center gap-2">
                      ₹{plan.price}
                      {plan.originalPrice && (
                        <span className="text-gray-400 line-through text-lg">₹{plan.originalPrice}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">per {plan.duration}</p>
                  </>
                )}
              </div>
              {/* 
              {plan.isFree && (
                <div className="text-center mb-4">
                  <span className="text-sm text-[#1E88E5] font-semibold">🎁 Free for first 5000 signups</span>
                </div>
              )} */}

              <ul className="text-sm text-gray-700 space-y-3 mb-6">
                <li className="flex items-center space-x-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1E88E5] text-white text-xs">✓</span>
                  <span>{plan.credits} tokens</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1E88E5] text-white text-xs">✓</span>
                  <span>Text response</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1E88E5] text-white text-xs">✓</span>
                  <span>Standard quality response</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1E88E5] text-white text-xs">✓</span>
                  <span>24-hour response time</span>
                </li>
              </ul>

              {/* ✅ Button logic */}
              {plan.id === "plan_gold" ? (
                <button
                  onClick={upgradeToGold}
                  disabled={
                    loading ||
                    profileLoading ||
                    (isAuthenticated && userPremium === "A")
                  }
                  className={`w-full py-2 px-4 rounded-full font-medium text-white shadow-sm ${loading || profileLoading || (isAuthenticated && userPremium === "A")
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#1E88E5] to-[#1565C0]"
                    }`}
                >
                  {profileLoading
                    ? "Checking..."
                    : loading
                      ? "Processing..."
                      : isAuthenticated && userPremium === "A"
                        ? "Already Active"
                        : "Upgrade to GOLD"}
                </button>
              ) : plan.comingSoon ? (
                <button disabled className="w-full py-2 px-4 rounded-full font-medium text-white bg-gray-400 shadow-sm cursor-not-allowed">
                  Coming Soon
                </button>
              ) : (
                <button disabled className="w-full py-2 px-4 rounded-full font-medium text-white bg-gray-400 shadow-sm cursor-not-allowed">
                  Already Active
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ✅ Login Modal */}
      {showLoginModal && (
        <LoginForm
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}