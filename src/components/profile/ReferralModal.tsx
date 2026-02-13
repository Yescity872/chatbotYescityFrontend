// components/profile/ReferralModal.tsx
"use client";

import { FaShare, FaCopy, FaWhatsapp, FaTelegramPlane, FaInstagram } from "react-icons/fa";
import toast from "react-hot-toast";

interface ReferralModalProps {
  showModal: boolean;
  referralLink: string;
  onClose: () => void;
}

export default function ReferralModal({ showModal, referralLink, onClose }: ReferralModalProps) {
  const createShareMessages = (referralLink: string) => {
    const messages = {
      whatsapp: `🏞️ Join me on YesCity and discover amazing places in India!

I found this incredible app for exploring destinations. Join through my link and get special benefits:

${referralLink}

Let's discover India together! 🚀`,

      telegram: `🏞️ Discover amazing places in India with YesCity! Join through my referral link for exclusive benefits:`,
      
      generic: `Join YesCity - India's best travel discovery platform!

Your friend has invited you to explore incredible destinations across India.

Click here: ${referralLink}

Get exclusive benefits through this referral!`
    };
    
    return messages;
  };

  const copyReferralLink = async () => {
    const messages = createShareMessages(referralLink);
    
    try {
      await navigator.clipboard.writeText(messages.generic);
      toast.success("Referral message copied! Ready to share!", { duration: 2000 });
    } catch (err) {
      console.error("Failed to copy link:", err);
      // Fallback method
      const textArea = document.createElement("textarea");
      textArea.value = messages.generic;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success("Referral message copied!", { duration: 2000 });
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-gray-500/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-slideInUp">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-[#1E88E5]/10 p-2 rounded-xl">
              <FaShare className="text-[#1E88E5] text-lg" />
            </div>
            <h3 className="text-[#1E88E5] text-2xl font-bold">Share & Earn</h3>
          </div>
        </div>

        {/* Body */}
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Invite 3 friends and get a month extension!
          </p>

          {/* Magic link with copy icon */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex items-center justify-between">
            <div className="flex-1 text-sm text-gray-800 font-mono break-all">
              {referralLink}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(referralLink);
                toast.success("Link copied!", { duration: 1500 });
              }}
              className="ml-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FaCopy className="text-lg" />
            </button>
          </div>
        </div>

        {/* Actions row */}
        <div className="flex justify-between items-center space-x-3">
          
          {/* WhatsApp Share */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(referralLink)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-3 rounded-full bg-green-500 hover:bg-green-600 text-white transition"
          >
            <FaWhatsapp className="text-2xl" />
          </a>

          {/* Telegram Share */}
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition"
          >
            <FaTelegramPlane className="text-2xl" />
          </a>

          {/* Instagram DM */}
          <a
            href="https://www.instagram.com/direct/new/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white transition"
          >
            <FaInstagram className="text-2xl" />
          </a>

          {/* Close button */}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}