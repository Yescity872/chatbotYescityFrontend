"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { memo } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useNavbarContext } from "@/lib/NavbarContext";
import { useRewardContext } from "@/lib/RewardContext";
import LoginForm from "@/components/login/LoginForm";
import { FaStar, FaUsers, FaHeart } from "react-icons/fa";
import ProfileDropdown from "./ProfileDropdown";
import {
  HiOutlineDocument,
  HiOutlineInformationCircle,
  HiOutlinePhone,
  HiSparkles,
} from "react-icons/hi";
import { GiFireBowl } from "react-icons/gi";
import { MdOutlineSmartToy } from "react-icons/md"; // chatbot icon

/* ✅ NavItem component to handle its own re-renders on path change */
function NavItem({ 
  href, 
  children, 
  className, 
  isExact = true,
  onClick
}: { 
  href: string; 
  children: React.ReactNode; 
  className?: (isActive: boolean) => string; 
  isExact?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const { pathname } = useNavbarContext();
  const isActive = isExact ? pathname === href : pathname.startsWith(href);
  
  const defaultClass = (active: boolean) => `font-medium text-[18px] p-1 border-b-2 transition-all duration-300 ${
    active
      ? "border-[#1E88E5] text-[#1E88E5]"
      : "border-transparent hover:border-black"
  }`;

  return (
    <Link href={href} className={className ? className(isActive) : defaultClass(isActive)} onClick={onClick}>
      {children}
    </Link>
  );
}

const Navbar = memo(function Navbar() {
  const router = useRouter();
  const { pathname } = useNavbarContext(); // Still needed for handleSignOut logic, or we can move it
  const { user, loading, logout } = useAuth();
  const { contributionPoints, addedPoints } = useRewardContext();

  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(
    null
  );


  // ✅ Protected route handler
  const handleProtectedClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    router.push(path);
    setIsOpen(false);
  };

  // ✅ Logout handler
  const handleSignOut = async () => {
    await logout();
    toast.success("Logged out successfully!", { duration: 2000 });
    
    if (
      pathname.includes("/wishlist") ||
      pathname.includes("/profile") ||
      pathname.includes("/premium") ||
      pathname.includes("/allConnect")
    ) {
      router.push("/");
    }
  };

  return (
    <>
      {/* Navbar */}
      <div className="fixed top-0 left-0 z-20 flex h-[80px] w-full items-center justify-between px-6 md:px-20 backdrop-blur-sm shadow-sm bg-white/70">
        <div className="flex items-center ">
          <Link href="/">
            <Image
              src="/images/logo.png"
              alt="Logo"
              height={100}
              width={120}
              priority
              unoptimized
            />
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex h-[42px] items-center gap-5">
          <NavItem href="/">
            Home
          </NavItem>
          <NavItem href="/blogs">
            Blogs
          </NavItem>

          <NavItem
            href="/allConnect"
            isExact={false}
            className={(isActive) => `flex items-center gap-2 font-medium text-[18px] p-1 border-b-2 transition-all duration-300 ${
              isActive
                ? "border-[#1E88E5] text-[#1E88E5]"
                : "border-transparent hover:border-black"
            }`}
          >
            Connect
          </NavItem>

          <NavItem href="/chatbot" className={(isActive) => ` ${isActive ? "border-[#1E88E5] text-[#1E88E5]" : "border-transparent hover:border-black"} font-medium text-[18px] p-1 border-b-2 transition-all duration-300 flex items-center gap-2 `}>
            Cities
            <motion.span
              initial={{ y: 0 }}
              animate={{ y: [0, -3, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
              className="bg-gradient-to-r from-pink-500 to-red-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-md"
            >
              NEW
            </motion.span>
          </NavItem>

          <NavItem href="/ai-chat" className={(isActive) => ` ${isActive ? "border-[#1E88E5] text-[#1E88E5]" : "border-transparent hover:border-black"} font-medium text-[18px] p-1 border-b-2 transition-all duration-300 flex items-center gap-2 `}>
            AI Chat
            <HiSparkles className="text-blue-500" />
          </NavItem>

          <NavItem
            href="/festivals"
            isExact={false}
            className={(isActive) => `flex items-center gap-2 font-medium text-[18px] p-1 border-b-2 transition-all duration-300 ${
              isActive
                ? "border-[#1E88E5] text-[#1E88E5]"
                : "border-transparent hover:border-black"
            }`}
          >
            Festivals
          </NavItem>

          <NavItem
            href="/wishlist"
            isExact={false}
            onClick={(e) => handleProtectedClick(e, "/wishlist")}
            className={(isActive) => `font-medium text-[18px] p-1 border-b-2 transition-all duration-300 ${
              isActive
                ? "border-[#1E88E5] text-[#1E88E5]"
                : "border-transparent hover:border-black"
            }`}
          >
            Wishlist
          </NavItem>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-5">
          <div className="relative flex items-center justify-center">
            <Link href="https://yc-contri.vercel.app/rewards">
              <div
                className="relative px-3 md:px-4 py-1.5 
                  rounded-full text-sm font-bold 
                  text-black flex items-center gap-1 md:gap-2
                  bg-white/60 backdrop-blur-md
                  shadow-[inset_2px_2px_6px_rgba(0,0,0,0.15),inset_-2px_-2px_6px_rgba(255,255,255,0.6)]
                  transition-transform duration-200 hover:scale-105"
              >
                <FaStar className="text-yellow-500 text-md md:text-lg" />
                {contributionPoints}
              </div>
            </Link>

            <AnimatePresence>
              {addedPoints !== null && (
                <motion.div
                  key={addedPoints}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: -20 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 1 }}
                  className="absolute text-blue-500 font-extrabold text-lg"
                >
                  +{addedPoints}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {user && <ProfileDropdown user={user} handleSignOut={handleSignOut} />}
          {!user && !loading && (
            <Link 
              href="/login" 
              className="px-4 py-2 rounded-full bg-sky-500 text-white text-sm font-bold hover:bg-sky-600 transition-all font-outfit"
            >
              Log In
            </Link>
          )}
        </div>

        <button
          className="flex md:hidden items-center justify-center w-11 h-11 
            rounded-full bg-white/70 backdrop-blur-md shadow-md 
            hover:scale-110 transition-transform duration-200"
          aria-label="open menu"
          onClick={() => setIsOpen(true)}
        >
          <Menu size={24} className="text-gray-700" />
        </button>
      </div>

      {isOpen && (
        <button
          aria-label="close menu"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/50"
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 right-0 z-40 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-white via-[#a8d8f0] to-[#76BFEC]">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button onClick={() => setIsOpen(false)}>
            <X size={26} />
          </button>
        </div>

        {user && (
          <motion.div
            key={isOpen ? "open" : "closed"}
            initial={{ opacity: 0, y: -20 }}
            animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center p-6 border-b text-center bg-gray-50"
          >
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={isOpen ? { rotate: 0, scale: 1 } : { rotate: -180, scale: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="rounded-full border-4 border-[#1E88E5] shadow-lg overflow-hidden"
            >
              <Link href="/profile" onClick={() => setIsOpen(false)}>
                <Image
                  src={user.profileImage || "/images/default-avatar.png"}
                  alt={user.username}
                  width={90}
                  height={90}
                  className="rounded-full"
                />
              </Link>
            </motion.div>

            <h3 className="mt-3 font-semibold text-lg">{user.username}</h3>
            {user.email && (
              <p className="text-sm text-gray-500">{user.email}</p>
            )}

            <div className="flex gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1 text-yellow-600 font-medium">
                <FaStar /> {contributionPoints} Points
              </span>
              {typeof user?.referralCount === "number" && (
                <span className="flex items-center gap-1 text-blue-600 font-medium">
                  <HiSparkles /> {user.referralCount} Referrals
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* mobile nav links */}
        <div className="flex flex-col p-4 gap-2">
          <NavItem
            href="/chatbot"
            onClick={() => setIsOpen(false)}
            className={(isActive) => `flex items-center gap-3 px-3 py-2 rounded-lg text-lg font-medium transition-all ${
              isActive
                ? "bg-blue-100 text-[#1E88E5]"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <MdOutlineSmartToy size={20} className="text-[#1E88E5]" />
            Cities
            <motion.span
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                ease: "easeInOut",
              }}
              className="ml-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-md"
            >
              NEW
            </motion.span>
          </NavItem>

          <NavItem
            href="/ai-chat"
            onClick={() => setIsOpen(false)}
            className={(isActive) => `flex items-center gap-3 px-3 py-2 rounded-lg text-lg font-medium transition-all ${
              isActive
                ? "bg-blue-100 text-[#1E88E5]"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <HiSparkles size={20} className="text-[#1E88E5]" />
            AI Chat
          </NavItem>

          <NavItem
            href="/festivals"
            isExact={false}
            onClick={() => setIsOpen(false)}
            className={(isActive) => `flex items-center gap-3 px-3 py-2 rounded-lg text-lg font-medium transition-all ${
              isActive
                ? "bg-blue-100 text-[#1E88E5]"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <GiFireBowl className="text-[#1E88E5]" size={20} />
            Festivals
          </NavItem>

          <NavItem
            href="/allConnect"
            isExact={false}
            onClick={() => setIsOpen(false)}
            className={(isActive) => `flex items-center gap-3 px-3 py-2 rounded-lg text-lg font-medium transition-all ${
              isActive
                ? "bg-blue-100 text-[#1E88E5]"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FaUsers className="text-[#1E88E5]" size={20} />
            Connect
          </NavItem>

          <NavItem
            href="/blogs"
            onClick={() => setIsOpen(false)}
            className={(isActive) => `flex items-center gap-3 px-3 py-2 rounded-lg text-lg font-medium transition-all ${
              isActive
                ? "bg-blue-100 text-[#1E88E5]"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <HiOutlineDocument size={20} className="text-[#1E88E5]" />
            Blogs
          </NavItem>

          <NavItem
            href="/about"
            onClick={() => setIsOpen(false)}
            className={(isActive) => `flex items-center gap-3 px-3 py-2 rounded-lg text-lg font-medium transition-all ${
              isActive
                ? "bg-blue-100 text-[#1E88E5]"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <HiOutlineInformationCircle size={20} className="text-[#1E88E5]" />
            About
          </NavItem>

          <NavItem
            href="/contact"
            onClick={() => setIsOpen(false)}
            className={(isActive) => `flex items-center gap-3 px-3 py-2 rounded-lg text-lg font-medium transition-all ${
              isActive
                ? "bg-blue-100 text-[#1E88E5]"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <HiOutlinePhone size={20} className="text-[#1E88E5]" />
            Contact
          </NavItem>

          <NavItem
            href="/wishlist"
            isExact={false}
            onClick={(e) => {
              handleProtectedClick(e, "/wishlist");
              setIsOpen(false);
            }}
            className={(isActive) => `flex items-center gap-3 px-3 py-2 rounded-lg text-lg font-medium transition-all ${
              isActive
                ? "bg-blue-100 text-[#1E88E5]"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FaHeart className="text-[#1E88E5]" size={20} />
            Wishlist
          </NavItem>
        </div>
      </div>

      {showLoginModal && (
        <LoginForm
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={() => {
            setShowLoginModal(false);
            setIsOpen(false);

            if (redirectAfterLogin) {
              router.push(redirectAfterLogin);
            }
            setRedirectAfterLogin(null);
          }}
        />
      )}
    </>
  );
});

export default Navbar;
