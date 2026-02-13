'use client';

import { JSX, useEffect, useState } from 'react';
import {
  FaUserPlus,
  FaCalendarAlt,
  FaMapMarkedAlt,
  FaGift,
  FaShareAlt,
} from 'react-icons/fa';

const popups = [
  // New additions
  { text: " Priya from Kolkata discovered a 200-year-old temple hidden in narrow bylanes", type: "local" },
  { text: " Diwali celebrations in Varanasi – Witness thousands of diyas lighting up the ghats!", type: "event" },
  { text: " Shreya just joined to explore hidden gems in Tamil Nadu", type: "signup" },
  { text: " Ananya from Kochi shared a secret beach only locals know about", type: "local" },
  { text: " Share YesCity with friends and earn premium days for every successful referral!", type: "referral" },
  { text: " Real travelers, real stories. No Instagram vs Reality here, just authentic India!", type: "insight" },
  { text: " Holi celebrations in Vrindavan – Join the colors of devotion!", type: "event" },
  { text: " Rahul from Udaipur found the perfect sunrise spot at Sajjangarh Palace", type: "local" },
  { text: " Karan signed up to connect with locals in Rajasthan", type: "signup" },
  { text: " Skip the tourist traps. Connect with locals who know the real hidden treasures.", type: "insight" },
  // Additional, site-relevant messages
  { text: "New guide: Best street food trails in Lucknow — crowdsourced and rated by locals", type: "insight" },
  { text: "Community meetup tonight in Pune — find like-minded travelers and local hosts!", type: "event" },
  { text: "Riya just referred 3 friends and earned 7 free premium days — referrals pay off!", type: "referral" },
  { text: "Local tip: Avoid peak hours at Connaught Place for a calmer stroll and better photos.", type: "local" },
  { text: "Meet our Verified Local: Arun — street food expert and trusted guide in Chennai.", type: "local" },
  { text: "Join micro-volunteering drives in your city — help tidy a neighborhood park this weekend.", type: "event" },
  { text: "Pro tip: Save posts to your travel list and share curated itineraries with friends.", type: "insight" },
];

const typeConfig: Record<
  string,
  { icon: JSX.Element; style: string; bgColor: string }
> = {
  signup: {
    icon: <FaUserPlus className="text-blue-500" />,
    style: "border-blue-300 text-blue-900",
    bgColor: "bg-blue-50"
  },
  event: {
    icon: <FaCalendarAlt className="text-green-500" />,
    style: "border-green-300 text-green-900",
    bgColor: "bg-green-50"
  },
  local: {
    icon: <FaMapMarkedAlt className="text-purple-500" />,
    style: "border-purple-300 text-purple-900",
    bgColor: "bg-purple-50"
  },
  offer: {
    icon: <FaGift className="text-yellow-500" />,
    style: "border-yellow-300 text-yellow-900",
    bgColor: "bg-yellow-50"
  },
  referral: {
    icon: <FaShareAlt className="text-pink-500" />,
    style: "border-pink-300 text-pink-900",
    bgColor: "bg-pink-50"
  },
  insight: {
    icon: <FaMapMarkedAlt className="text-indigo-500" />,
    style: "border-indigo-300 text-indigo-900",
    bgColor: "bg-indigo-50"
  },
};

export default function YesCityRandomPopups() {
  const [currentPopup, setCurrentPopup] = useState<null | {
    text: string;
    type: string;
  }>(null);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

useEffect(() => {
  const interval = setInterval(() => {
    const randomIndex = Math.floor(Math.random() * popups.length);
    const selected = popups[randomIndex];

    setIsVisible(false);

    setTimeout(() => {
      setCurrentPopup(selected);
      setTypedText('');
      setIsTyping(true);
      setIsVisible(true);

      let charIndex = 0;
      const baseTypingSpeed = 40;
      const typingRef = { text: '' }; // local ref buffer

      const typingInterval = setInterval(() => {
        if (charIndex < selected.text.length) {
          typingRef.text += selected.text.charAt(charIndex);

          // ✅ batch update less often to reduce re-renders
          if (charIndex % 2 === 0 || charIndex === selected.text.length - 1) {
            setTypedText(typingRef.text);
          }

          charIndex++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, baseTypingSpeed + Math.random() * 20);

      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setCurrentPopup(null), 300);
      }, selected.text.length * baseTypingSpeed + 3000);
    }, 300);
  }, 10000);

  return () => clearInterval(interval);
}, []);


  if (!currentPopup) return null;

  return (
    <div className="fixed ml-4 top-24 right-4 md:right-6 z-50 flex flex-col gap-4 max-w-sm">
      <div
        className={`relative border rounded-lg px-5 py-4 shadow-xl backdrop-blur-sm transform transition-all duration-500 ease-out ${
          isVisible
            ? 'translate-x-0 opacity-100 scale-100'
            : 'translate-x-full opacity-0 scale-95'
        } ${
          typeConfig[currentPopup.type]?.style || 'border-gray-300 text-gray-900'
        } ${
          typeConfig[currentPopup.type]?.bgColor || 'bg-white'
        }`}
      >
  
        <div className={`absolute -top-5 -right-2 border-2 p-2 rounded-full shadow-lg transform transition-all duration-500 ${
          isVisible ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
        } ${
          typeConfig[currentPopup.type]?.bgColor || 'bg-white'
        } border-current`}>
          <div className={`transform transition-transform duration-300 hover:scale-110 ${
            isVisible ? 'animate-pulse' : ''
          }`}>
            {typeConfig[currentPopup.type]?.icon}
          </div>
        </div>

      
        <div className="pr-8">
          <p className="text-sm font-medium leading-relaxed">
            <span className="inline-block">
              {typedText}
            </span>
            {isTyping && (
              <span className="inline-block w-0.5 h-5 bg-current ml-1 animate-pulse"></span>
            )}
          </p>
        </div>

      
        <div className="mt-3 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ease-linear ${
              currentPopup.type === 'signup' ? 'bg-blue-500' :
              currentPopup.type === 'event' ? 'bg-green-500' :
              currentPopup.type === 'local' ? 'bg-purple-500' :
              currentPopup.type === 'offer' ? 'bg-yellow-500' :
              currentPopup.type === 'referral' ? 'bg-pink-500' :
              'bg-indigo-500'
            }`}
            style={{
              animation: isVisible ? `progress ${8000}ms linear forwards` : 'none'
            }}
          ></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
