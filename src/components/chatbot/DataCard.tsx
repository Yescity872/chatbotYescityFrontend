"use client";
import React from "react";
import { SiGooglemaps } from "react-icons/si";

interface DataCardProps {
  data: any;
  category: string;
}

export default function DataCard({ data, category }: DataCardProps) {
  const name =
    data.hotels ||
    data.foodPlace ||
    data.hiddenGem ||
    data.places ||
    data.shops ||
    "Unnamed";
    
  const image = data.images?.[0] || "/images/placeholder.jpg";
  const description = data.description || "Explore this amazing place.";
  const cityName = data.cityName || "Varanasi";

  return (
    <div className="group bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10 shadow-sm hover:shadow-md hover:border-blue-400/50 transition-all cursor-pointer flex gap-3 text-white">
      <div className="w-24 h-24 flex-shrink-0">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <div>
          <h4 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-blue-400 transition-colors">
            {name}
          </h4>
          <p className="text-xs text-white/50 line-clamp-2 mt-1">
            {description}
          </p>
        </div>

        <div className="flex gap-2 mt-2">
          <button
            className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 hover:text-blue-400 hover:border-blue-400/30 transition-colors flex items-center gap-1"
            onClick={(e) => {
              e.stopPropagation();
              if (data.locationLink) window.open(data.locationLink, "_blank");
            }}
          >
            <SiGooglemaps size={10} /> Maps
          </button>
          <button
            className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/20 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              alert("Details page coming soon!");
            }}
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
}
