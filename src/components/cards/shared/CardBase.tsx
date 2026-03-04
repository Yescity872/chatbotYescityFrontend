'use client';
import React from 'react';
import { motion } from 'framer-motion';

export interface BaseCardProps {
  data: any;
  imageSrc: string;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  category: string;
  showImage?: boolean;
  isSelected?: boolean;
}

export const CardBase: React.FC<{
  children: React.ReactNode;
  imageSrc: string;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  category: string;
  premium?: string;
  showImage?: boolean;
  imageOverlay?: React.ReactNode;
  isSelected?: boolean;
  imageClassName?: string; // New prop for custom image styling
  imageWrapperClassName?: string; // New prop for custom wrapper styling
}> = ({ children, imageSrc, onImageError, category, premium, showImage = true, imageOverlay, isSelected, imageClassName, imageWrapperClassName }) => {
  const isPremium = premium && premium !== "FREE";
  const isShiny = premium === "A"; // ✨ Only A gets shine

  const cardClass = isSelected 
    ? "bg-gradient-to-r from-[#0858A3] to-[#0B5ED7] text-white shadow-xl " 
    : isPremium
    ? "bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 border-yellow-400 shadow-xl"
    : "bg-white border-gray-100 shadow-lg shadow-gray-400 pb-4";
  
  const borderClass = isSelected
    ? "border-transparent"
    : isPremium
    ? "border-2 border-yellow-500"
    : "border";

  // console.log("category", category);
  
  const minHeightCardCategories = ["Accomodation", "Activity", "Connectivity", "Food", "HiddenGem", "Place", "Shop", "NearbySpot"]

  return (
    <div
      className={`rounded-2xl transition-all duration-300 overflow-hidden w-full h-full min-w-0 flex flex-col ${cardClass} ${borderClass} ${isSelected ? 'scale-105 transform z-10 shadow-2xl' : ''} ${minHeightCardCategories.includes(category)?"min-h-[280px]":""}`}
    >
      {/* Conditionally render Image Section */}
      {showImage && (
        <div className={`relative overflow-hidden shrink-0 ${imageWrapperClassName || 'p-2'}`}>
          <img
            src={imageSrc}
            alt={`${category} image`}
            className={`w-full h-[152px] rounded-xl transition-transform duration-500 hover:scale-105 ${
              imageClassName || "object-cover bg-white" // Default if not provided
            } ${isPremium ? "brightness-110" : ""}`}
            onError={onImageError}
          />

          {/* ✨ Shine overlay only for premium="A" */}
          {isShiny && (
            <motion.div
              initial={{ x: "-150%" }}
              animate={{ x: "150%" }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(75deg, transparent 30%, rgba(255,255,255,0.8) 50%, transparent 70%)",
              }}
            />
          )}

          {/* Category Tag */}
          {/* <div className="flex gap-2 absolute top-3 left-3 z-10">
            <span
              className={`items-center backdrop-blur-md px-2 py-1 md:px-3 md:py-1 rounded-full text-[6px] font-light md:font-semibold shadow-sm ${
                isPremium
                  ? "bg-yellow-500/90 text-white"
                  : "bg-white/90 text-gray-800"
              }`}
            >
              {category === "City" && "🏙️"}
              {category === "Hotel" && "🏨"}
              {category === "Attraction" && "🎡"}
              {category}
            </span>
          </div> */}

          {/* Custom image overlay (e.g., flagship badge) */}
          {imageOverlay}
        </div>
      )}

      {/* Content */}
      <div
        className={`p-2 md:p-3 flex flex-col justify-between h-full min-w-0 ${
          !showImage ? "pt-1" : ""
        }`}
      >
        {/* Category tag for cards without images */}
        {!showImage && (
          <div className="mb-1 md:mb-2">
            <span
              className={`inline-flex items-center px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-semibold ${
                isPremium
                  ? "bg-yellow-500/20 text-yellow-800 border border-yellow-300"
                  : "bg-gray-100 text-gray-800 border border-gray-200"
              }`}
            >
              {category === "Connectivity" && "📡 "}
              {category === "Transport" && "🚌 "}
              {category === "Itinerary" && "📅 "}
              {category === "Misc" && "ℹ️ "}
              {category === "CityInfo" && "🏙️ "}
              {category}
            </span>
          </div>
        )}

        <div className="space-y-2">{children}</div>
      </div>
    </div>
  );
};
