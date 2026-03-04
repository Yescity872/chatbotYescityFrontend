'use client';

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import LoginPortal from "./LoginPortal";
import {jwtDecode} from "jwt-decode";

interface WishlistButtonProps {
  onModel: string;
  parentRef: string;
  cityName: string;
}

// ✅ Type for decoded JWT payload
interface JWTPayload {
  exp?: number;
  [key: string]: any;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ onModel, parentRef, cityName }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // ✅ Ref to store pending wishlist action after login
  const pendingActionRef = useRef<(() => void) | null>(null);

  // ✅ Check login status from JWT
  const checkLogin = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoggedIn(false);
      return false;
    }

    try {
      const decoded: JWTPayload = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < now) {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        return false;
      }
      setIsLoggedIn(true);
      return true;
    } catch (err) {
      console.error("Invalid token:", err);
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      return false;
    }
  };

  // ✅ Check if this item is already in wishlist (only if logged in)
  useEffect(() => {
    const checkWishlist = async () => {
      if (!checkLogin()) return; // ✅ skip if not logged in

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/wishlist/check`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ onModel, parentRef, cityName }),
        });

        if (res.ok) {
          const data = await res.json();
          setIsInWishlist(data.exists || false);
        }
      } catch (err) {
        console.error("Wishlist check failed", err);
      }
    };

    checkWishlist();
  }, [onModel, parentRef, cityName]);

  const handleWishlistToggle = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    if (loading) return;
    setLoading(true);

    try {
      if (!checkLogin()) {
        // ✅ Not logged in, show login popup
        pendingActionRef.current = () => handleWishlistToggle();
        setShowLoginPopup(true);
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");

      if (isInWishlist) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/wishlist`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ onModel, parentRef, cityName }),
        });

        if (res.ok) {
          setIsInWishlist(false);
          toast.success("Removed from wishlist");
        }
      } else {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/wishlist`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ onModel, parentRef, cityName }),
        });

        if (res.ok) {
          setIsInWishlist(true);
          toast.success("Added to wishlist");
        }
      }
    } catch (err) {
      console.error("Wishlist operation failed:", err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ After login success
  const handleLoginSuccess = () => {
    setShowLoginPopup(false);
    checkLogin(); // ✅ update login state
    window.dispatchEvent(new Event("userLoggedIn"));

    // ✅ Retry pending wishlist action if exists
    if (pendingActionRef.current) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      setTimeout(() => action(), 0);
    }
  };

  return (
    <>
      <button
        onClick={handleWishlistToggle}
        disabled={loading}
        className={`absolute top-1 right-1 bg-white p-1 rounded-full text-xl transition-all duration-200 ${
          loading ? "cursor-not-allowed opacity-50" : "hover:scale-110"
        }`}
        title={loading ? "Updating..." : isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        ) : isInWishlist ? (
          <span className="text-blue-500 drop-shadow-sm">💙</span>
        ) : (
          <span className="text-gray-400 hover:text-blue-500 transition-colors">💜</span>
        )}
      </button>

      {/* Full-page LoginForm via portal */}
      <LoginPortal
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default WishlistButton;
