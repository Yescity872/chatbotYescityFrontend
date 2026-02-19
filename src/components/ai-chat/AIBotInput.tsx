"use client";
import React, { useState } from "react";
import { Menu, Mic, ChevronRight, Utensils, Bed, ShoppingBag, Car } from "lucide-react";

const SUGGESTIONS = [
  { label: "Food", icon: Utensils, query: "Best places to eat" },
  { label: "Accommodation", icon: Bed, query: "Top hotels and stays" },
  { label: "Shop", icon: ShoppingBag, query: "Where to shop" },
  { label: "Transport", icon: Car, query: "How to get around" },
];

export default function AIBotInput({
  onSend,
  disabled,
}: {
  onSend: (q: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value);
    setValue("");
  };

  return (
    <>
      {/* Search Bar Container */}
      <div className="w-full max-w-2xl mx-auto relative group px-3 sm:px-4">

        <div 
          className="
            flex items-center 
            bg-white/[0.08] backdrop-blur-[30px] 
            border border-white/10 
            rounded-full
            px-4 py-1.5 sm:px-6 sm:py-2
            shadow-xl
            transition-all duration-300
            hover:bg-white/[0.12]
            focus-within:bg-white/[0.12] focus-within:border-white/20
          "
        >
          {/* Menu Icon */}
          <div className="pr-3 border-r border-white/10 mr-3">
            <Menu className="w-5 h-5 text-white/40 cursor-pointer hover:text-white transition-colors" />
          </div>

          {/* Input */}
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Explore the dream places with chatbot..."
            className="
              flex-1 bg-transparent border-none outline-none
              text-white placeholder-gray-300/80 
              text-sm sm:text-base py-1 sm:py-1.5
              font-light
            "
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={disabled}
          />

          {/* Right Icons */}
          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <Mic className="w-4 h-4 text-white/40 cursor-pointer hover:text-white transition-colors" />
            
            <button
              onClick={handleSend}
              disabled={disabled || !value.trim()}
              className="
                bg-white/10 hover:bg-white/20 
                disabled:opacity-20
                text-white p-1.5 rounded-full 
                transition-all duration-300 transform hover:scale-105
                border border-white/10
              "
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Suggestions Section - More compact */}
      <div className="mt-4 px-2 pb-4 flex justify-center">
        <div className="flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              onClick={() => onSend(s.query)}
              disabled={disabled}
              className="
                flex items-center gap-2
                px-3 py-1.5
                rounded-full 
                bg-white/[0.04] backdrop-blur-sm
                border border-white/[0.08] 
                text-white/50 text-[10px] sm:text-xs
                hover:bg-white/[0.1] hover:text-white hover:border-white/20
                active:scale-95
                transition-all duration-300
              "
            >
              <s.icon className="w-3 h-3" />
              <span className="font-light tracking-wide">{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
