// components/profile/PersonalInfoCard.tsx
"use client";

import { useState } from "react";
import { FaUser, FaEdit, FaCheck, FaTimes } from "react-icons/fa";

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

interface PersonalInfoCardProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export default function PersonalInfoCard({ user, setUser }: PersonalInfoCardProps) {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [usernameUpdating, setUsernameUpdating] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  const handleUsernameEdit = () => {
    setIsEditingUsername(true);
    setNewUsername(user?.username || "");
    setUsernameError("");
  };

const handleUsernameSave = async () => {
  if (!newUsername.trim()) {
    setUsernameError("Username cannot be empty");
    return;
  }

  if (newUsername === user?.username) {
    setIsEditingUsername(false);
    return;
  }

  setUsernameUpdating(true);
  setUsernameError("");

  try {
    const token = localStorage.getItem("token"); // 🔑 get token

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/profile/updateUsername`,
      {
        method: "PUT",
        credentials: "include", // ✅ send cookies
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}), // 🔑 send token if available
        },
        body: JSON.stringify({ username: newUsername.trim() }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setUsernameError(data.error || "Failed to update username");
      return;
    }

    setUser((prevUser) =>
      prevUser ? { ...prevUser, username: newUsername.trim() } : null
    );
    setIsEditingUsername(false);
  } catch (err) {
    console.error("Error updating username:", err);
    setUsernameError("Failed to update username");
  } finally {
    setUsernameUpdating(false);
  }
};


  const handleUsernameCancel = () => {
    setIsEditingUsername(false);
    setNewUsername("");
    setUsernameError("");
  };

  // Helper to mask email: first 2 letters + *** + domain
  const maskEmail = (email: string) => {
    const [local, domain] = email.split("@");
    if (!domain) return email; // fallback
    if (local.length <= 2) return `${local}***@${domain}`;
    const firstTwo = local.slice(0, 2);
    return `${firstTwo}***@${domain}`;
  };

  return (
    <div className="bg-[#008EA7] border border-gray-200 rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Header Section */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="bg-gradient-to-br from-yellow-500 to-blue-600 p-3 rounded-2xl shadow-md">
          <FaUser className="text-white text-2xl" />
        </div>
        <h2 className="text-white text-xl md:text-2xl font-semibold">
          Personal Info
        </h2>
      </div>

      {/* Error Message */}
      {usernameError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
          {usernameError}
        </div>
      )}

      {/* Info Fields */}
      <div className="space-y-4">
        {/* Phone */}
        {
          user.phone && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <span className="text-white font-medium text-base sm:text-lg">Phone:</span>
            <span className="text-white font-mono font-semibold text-lg">{user.phone}</span>
          </div>
          )
        }


        {/* Username (editable) */}
        {!isEditingUsername ? (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <span className="text-white font-medium text-base sm:text-lg">Username:</span>
            <div className="flex items-center space-x-3 mt-2 sm:mt-0">
              <span className="text-white  font-semibold text-lg">{user.username}</span>
              <button
                onClick={handleUsernameEdit}
                className="text-white hover:text-yellow-400 p-2 rounded-lg transition-transform transform hover:scale-110 shadow-sm"
              >
                <FaEdit />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <span className="text-white font-medium text-base sm:text-lg">Username:</span>
            <div className="flex items-center space-x-2 mt-2 sm:mt-0 relative w-full sm:w-auto">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="flex-1 bg-[#008EA7] border border-blue-300 rounded-lg px-4 py-2 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                disabled={usernameUpdating}
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleUsernameSave()}
              />
              <div className="flex items-center space-x-2 ml-2 absolute right-3">
                <button
                  onClick={handleUsernameSave}
                  disabled={usernameUpdating}
                  className="text-green-600 hover:text-green-500 p-2 rounded-lg shadow-sm transition-transform transform hover:scale-110 disabled:opacity-50"
                >
                  {usernameUpdating ? (
                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FaCheck />
                  )}
                </button>
                <button
                  onClick={handleUsernameCancel}
                  disabled={usernameUpdating}
                  className="text-red-500 hover:text-red-400 p-2 rounded-lg shadow-sm transition-transform transform hover:scale-110 disabled:opacity-50"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <span className="text-white font-medium text-base sm:text-lg">Email:</span>
          <span className="text-white font-semibold text-base sm:text-lg break-all">
            {maskEmail(user.email)}
          </span>
        </div>
      </div>
    </div>
  );
}
