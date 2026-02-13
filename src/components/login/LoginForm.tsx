'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaLock, FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa"; // 👁️ Added icons
import toast from "react-hot-toast";
import { useAuth } from "@/lib/AuthContext";

interface LoginFormProps {
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function LoginForm({ onClose, onLoginSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👁️ Added show/hide password state

  useEffect(() => {
    setShowPopup(true);
  }, []);

  // Lock background scroll when popup is open
  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showPopup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // ✅ Prevent bubbling
    setIsLoading(true);

    try {
      const result = await login(emailOrUsername, password);
      
      if (result.success) {
        toast.success(result.message);
        onLoginSuccess();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = (e: React.MouseEvent) => {
    e.stopPropagation(); // ✅ Prevent bubbling
    const params = new URLSearchParams();
    params.set("state", JSON.stringify({ 
      isLogin: true,
      from: window.location.origin 
    })); // ✅ Mark as login flow and pass origin

    window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google?${params.toString()}`;
  };

  return (
    <div
      className="fixed inset-0 z-1100 flex items-center justify-center bg-black/40 backdrop-blur-md xs:p-5"
      onClick={onClose} // click outside closes modal
    >
      <div
        className={`relative w-full max-w-md transform transition-all duration-500 ease-out
          ${showPopup ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"}`}
        onClick={(e) => e.stopPropagation()} // ✅ stop clicks inside modal from bubbling
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} // ✅ stop bubbling for close
          className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center bg-red-500 text-white rounded-full p-2 shadow-lg 
                     transition-all duration-300 ease-in-out transform hover:bg-red-700 hover:scale-110 hover:rotate-12 focus:outline-none"
        >
          ✕
        </button>

        <div className="rounded-3xl bg-white px-6 py-8 shadow-2xl ring-1 ring-sky-100 sm:px-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800">Login to Continue</h1>
            <p className="mt-2 text-sky-600">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email or Username
              </label>
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
                className="block w-full rounded-xl border border-sky-200 bg-sky-50/30 py-3 pl-3 pr-3 text-gray-800 placeholder-sky-400 shadow-sm focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200 transition-all"
                placeholder="Enter your email or username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaLock className="text-sky-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"} // 👁️ Toggle password visibility
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full rounded-xl border border-sky-200 bg-sky-50/30 py-3 pl-10 pr-10 text-gray-800 placeholder-sky-400 shadow-sm focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200 transition-all"
                  placeholder="Enter your password"
                />

                {/* 👁️ Show/Hide Password Icon — appears only when user types */}
                {password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-sky-500 hover:text-sky-700 focus:outline-none"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                )}
              </div>

              <div className="mt-2 text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-sky-600 hover:text-sky-500 font-medium transition-colors"
                  onClick={(e) => {
                    onClose();
                    e.stopPropagation();
                  }}
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`flex w-full justify-center rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 font-medium text-white shadow-lg transition-all hover:from-sky-600 hover:to-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 active:scale-[0.98] transform ${isLoading ? "cursor-not-allowed opacity-70" : ""
                }`}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-sky-200" />
            <span className="mx-4 text-sky-500 text-sm font-medium">Or continue with</span>
            <div className="flex-grow border-t border-sky-200" />
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-xl border-2 border-sky-200 bg-white px-4 py-3 text-gray-700 shadow-sm hover:bg-sky-50 hover:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 transition-all"
          >
            <FaGoogle className="mr-2 text-red-500" />
            <span className="font-medium">Sign in with Google</span>
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-sky-600 hover:text-sky-500 transition-colors"
              >
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
