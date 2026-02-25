"use client";
import React, { useState, useEffect, useRef } from "react";

export default function FilterBar({
  selectedCategory,
  onCategoryChange,
  radius,
  onRadiusChange,
  isNearbyMode,
  onNearbyToggle,
  onWishlistClick,
  isWishlistMode,
  searchQuery,
  onSearchChange,
  cityName,
  allItems = [],
  onSearchSelect,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  // Filter search
  useEffect(() => {
    if (!searchQuery.trim() || !allItems.length) {
      setRecommendations([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allItems
      .filter((item) => {
        const name =
          item.places ||
          item.hotels ||
          item.hiddenGem ||
          item.foodPlace ||
          item.shops ||
          "";
        return name.toLowerCase().includes(query);
      })
      .slice(0, 8);

    setRecommendations(filtered);
  }, [searchQuery, allItems]);

  // Close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectRecommendation = (item) => {
    const name =
      item.places ||
      item.hotels ||
      item.hiddenGem ||
      item.foodPlace ||
      item.shops ||
      "Location";

    onSearchChange(name);
    setIsFocused(false);
    onSearchSelect?.(item);
  };

  return (
    <div className="bg-white shadow-md rounded-2xl border border-gray-200">

      {/* ---------------- MOBILE SECTION ---------------- */}
      <div className="lg:hidden flex justify-between px-4 py-2 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-[#1E88E5]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {cityName ? decodeURIComponent(cityName) : ""}
        </h1>

        {/* Mobile search */}
        <div className="relative ml-2" ref={mobileDropdownRef}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search places..."
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          {isFocused && recommendations.length > 0 && (
            <div 
              className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              style={{ zIndex: 9999 }}
            >
              {recommendations.map((item) => (
                <button
                  key={item._id}
                  onClick={() => handleSelectRecommendation(item)}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleSelectRecommendation(item);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-[#1E88E5]/10 active:bg-[#1E88E5]/20 transition border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-800 text-sm">
                    {item.places ||
                      item.hotels ||
                      item.hiddenGem ||
                      item.foodPlace ||
                      item.shops}
                  </div>
                  <div className="text-xs text-gray-500">{item.category}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE LAYOUT BODY */}
      <div className="lg:hidden p-3 space-y-3">
        {/* row1 */}
        <div className="flex justify-between items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#1E88E5]"
          >
            <option value="All">All Categories</option>
            <option value="Accommodation">Accommodation</option>
            <option value="Food">Food</option>
            <option value="HiddenGem">Hidden Gem</option>
            <option value="NearbySpot">Nearby Spot</option>
            <option value="Place">Place</option>
            <option value="Shop">Shop</option>
          </select>

          {/* wishlist */}
          <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-lg">
            <span className="text-xs text-gray-600">All</span>
            <button
              onClick={onWishlistClick}
              className={`relative w-12 h-6 rounded-full transition ${
                isWishlistMode ? "bg-red-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isWishlistMode ? "translate-x-6" : "translate-x-0"
                }`}
              >
                {isWishlistMode && "❤️"}
              </span>
            </button>
            <span className="text-xs text-gray-600">❤️</span>
          </div>
        </div>

        {/* row2 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isNearbyMode}
              onChange={(e) => onNearbyToggle(e.target.checked)}
              className="w-3 h-4 accent-[#1E88E5]"
            />
            <span className="text-sm text-gray-700">Search Nearby</span>
          </div>

          {/* radius */}
          <div
            className={`flex items-center gap-2 flex-1 ${
              !isNearbyMode ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <span className="text-xs text-gray-600">Radius:</span>
            <input
              type="range"
              min="1"
              max="100"
              value={radius}
              onChange={(e) => onRadiusChange(e.target.value)}
              className="flex-1 accent-[#1E88E5]"
            />
            <span className="text-xs font-medium text-gray-700 min-w-[40px]">
              {radius} km
            </span>
          </div>
        </div>
      </div>

      {/* -------------------------- DESKTOP LAYOUT START -------------------------- */}
      <div className="hidden lg:flex items-center gap-6 p-4">

        {/* City */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#1E88E5]/10 rounded-lg border border-[#1E88E5]/30">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-[#1E88E5]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h1 className="text-lg font-bold">
            {cityName ? decodeURIComponent(cityName) : ""}
          </h1>
        </div>

        {/* Category */}
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#1E88E5]"
        >
          <option value="All">All Categories</option>
          <option value="Accommodation">Accommodation</option>
          <option value="Food">Food</option>
          <option value="HiddenGem">Hidden Gem</option>
          <option value="NearbySpot">Nearby Spot</option>
          <option value="Place">Place</option>
          <option value="Shop">Shop</option>
        </select>

        {/* CENTER AREA — Search Nearby + Radius */}
        <div className="flex items-center gap-5 flex-1 justify-center">

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isNearbyMode}
              onChange={(e) => onNearbyToggle(e.target.checked)}
              className="w-4 h-4 accent-[#1E88E5]"
            />
            <span className="text-sm text-gray-700">Search Nearby</span>
          </div>

          <div
            className={`flex items-center gap-3 min-w-[220px] ${
              !isNearbyMode ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <span className="text-sm text-gray-600">Radius:</span>
            <input
              type="range"
              min="1"
              max="100"
              value={radius}
              onChange={(e) => onRadiusChange(e.target.value)}
              className="w-36 accent-[#1E88E5]"
            />
            <span className="text-sm font-medium text-gray-700">{radius} km</span>
          </div>
        </div>

        {/* Right: Search box + Wishlist */}
        <div className="flex items-center gap-6">

          {/* Desktop Search */}
          <div className="relative w-64" ref={dropdownRef}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Search places..."
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-[#1E88E5]"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            {isFocused && recommendations.length > 0 && (
              <div 
                className="absolute w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-72 overflow-y-auto"
                style={{ zIndex: 9999 }}
              >
                {recommendations.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => handleSelectRecommendation(item)}
                    className="w-full px-4 py-2.5 text-left hover:bg-[#1E88E5]/10 transition border-b border-gray-100 last:border-b-0"
                  >
                    <div className="text-sm font-medium text-gray-800">
                      {item.places ||
                        item.hotels ||
                        item.hiddenGem ||
                        item.foodPlace ||
                        item.shops}
                    </div>
                    <div className="text-xs text-gray-500">{item.category}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Wishlist */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
            <span className="text-sm text-gray-600">All</span>

            <button
              onClick={onWishlistClick}
              className={`relative w-14 h-7 rounded-full transition ${
                isWishlistMode ? "bg-red-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  isWishlistMode ? "translate-x-7" : "translate-x-0"
                }`}
              >
                {isWishlistMode && "❤️"}
              </span>
            </button>

            <span className="text-sm text-gray-600">❤️</span>
          </div>
        </div>
      </div>

      {/* -------------------------- DESKTOP END -------------------------- */}
    </div>
  );
}