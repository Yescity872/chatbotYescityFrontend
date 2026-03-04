"use client";

import React, { useState } from "react";
import { FaMinus } from "react-icons/fa";
import { CategoryType } from "@/constants/categories";

interface WishlistItemData {
  _id: string;
  cityName: string;
  images?: string[];
  premium?: string;
  flagship?: boolean;
  hotels?: string;
  roomTypes?: string;
  topActivities?: string;
  stateOrUT?: string;
  alternateNames?: string[];
  coverImage?: string;
  nearestAirportStationBusStand?: string;
  distance?: string;
  foodPlace?: string;
  vegOrNonVeg?: string;
  menuSpecial?: string;
  hiddenGem?: string;
  day1?: string;
  day2?: string;
  day3?: string;
  hospital?: string;
  Police?: string;
  parking?: string;
  publicWashrooms?: string;
  locker?: string;
  places?: string;
  establishYear?: string;
  description?: string;
  shops?: string;
  famousFor?: string;
  from?: string;
  to?: string;
}

interface WishlistItemProps {
  _id: string;
  cityName: string;
  parentRef: string;
  onModel: CategoryType;
  data: WishlistItemData;
  onRemove?: (
    itemId: string,
    onModel: string,
    parentRef: string,
    cityName: string
  ) => Promise<void> | void;
  onClick?: () => void;
  isLoading?: boolean;
}

export default function WishlistItem({
  _id,
  cityName,
  parentRef,
  onModel,
  data,
  onRemove,
  onClick,
  isLoading = false,
}: WishlistItemProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [imgError, setImgError] = useState(false);

  const primaryImage = data.images?.[0] || data.coverImage || "/placeholder-image.jpg";

  const handleRemove = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (!onRemove) return;
    setIsRemoving(true);
    try {
      await onRemove(_id, onModel, parentRef, cityName);
    } catch (err) {
      console.error("Failed to remove wishlist item", err);
    } finally {
      setIsRemoving(false);
    }
  };

  const getTitle = () => {
    switch (onModel) {
      case "Accommodation":
        return data.hotels || "Hotel";
      case "Activity":
        return data.topActivities || "Activity";
      case "Food":
        return data.foodPlace || "Restaurant";
      case "HiddenGem":
        return data.hiddenGem || "Hidden Gem";
      case "Place":
      case "NearbySpot":
        return data.places || "Place";
      case "Shop":
        return data.shops || "Shop";
      default:
        return onModel;
    }
  };

  const getDescription = () => {
    switch (onModel) {
      case "Accommodation":
        return data.roomTypes || data.description || `${onModel} in ${cityName}`;
      case "Activity":
        return data.topActivities || `Activity in ${cityName}`;
      case "Food":
        return (
          `${data.vegOrNonVeg || ""} ${data.menuSpecial || ""}`.trim() || data.description
        );
      default:
        return data.description || `${onModel} in ${cityName}`;
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse w-full max-w-sm mx-auto rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 h-56" />
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick && onClick()}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick && onClick();
      }}
      className="group relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-900 transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-300"
    >
      {/* Image section */}
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={primaryImage}
          alt={getTitle()}
          onError={() => setImgError(true)}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            imgError ? "blur-sm" : ""
          }`}
        />

        {/* Premium badge */}
        {data.premium === "PREMIUM" && (
          <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white shadow">
            PREMIUM
          </span>
        )}

        {/* Remove button */}
        {onRemove && (
          <button
            onClick={handleRemove}
            aria-label={`Remove ${getTitle()} from wishlist`}
            title="Remove"
            disabled={isRemoving}
            className="absolute top-3 right-3 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/90 dark:bg-gray-800/70 text-red-600 hover:bg-red-50 shadow-sm border border-white/10 transition"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {isRemoving ? (
              <svg
                className="h-4 w-4 animate-spin text-red-600"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-25"
                />
                <path
                  d="M22 12a10 10 0 00-10-10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-75"
                />
              </svg>
            ) : (
              <FaMinus className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Text section */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate">
              {getTitle()}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {getDescription()}
            </p>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            {onModel}
          </span>
        </div>

        {/* Meta row */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            {data.flagship && (
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[11px]">
                Flagship
              </span>
            )}
            {data.establishYear && (
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                {data.establishYear}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick && onClick();
            }}
            className="px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}
