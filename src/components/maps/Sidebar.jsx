"use client";

import React, { useEffect, useState, useRef } from "react";
import { SiGooglemaps } from "react-icons/si";

// ✅ Distance helper (Haversine formula) - same as MapComponent
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ✅ Category icon mapping
const categoryIcons = {
  Accommodation: "/images/leaflet/icon-accommodation.png",
  Food: "/images/leaflet/icon-food.png",
  HiddenGem: "/images/leaflet/icon-hidden.png",
  NearbySpot: "/images/leaflet/icon-nearby.png",
  Place: "/images/leaflet/icon-place.png",
  Shop: "/images/leaflet/icon-shop.png",
};

// ✅ Transform wishlist data
function transformWishlistData(wishlistResponse) {
  const transformed = {};
  
  wishlistResponse.forEach(item => {
    const category = item.onModel;
    const itemData = {
      ...item.data,
      _id: item.data._id,
      category: category
    };
    
    if (!transformed[category]) {
      transformed[category] = [];
    }
    transformed[category].push(itemData);
  });
  
  return transformed;
}

// ✅ Helper to get auth token from cookies
function getAuthToken() {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(c => c.trim().startsWith('token='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
}


// ✅ Helper function to search/filter items
function filterItemsBySearch(items, searchQuery) {
  if (!searchQuery.trim()) return items;
  
  const query = searchQuery.toLowerCase();
  return items.filter(item => {
    const name = (
      item.places || 
      item.hotels || 
      item.hiddenGem || 
      item.foodPlace || 
      item.shops || 
      ""
    ).toLowerCase();
    
    return name.includes(query);
  });
}

export default function Sidebar({
  selectedCategory,
  cityName,
  radius,
  isNearbyMode,
  selectedItemId,
  onCardClick,
  isWishlistMode = false,
  searchQuery = "", // Add this prop
  user,                  // ← ADD THIS
  setShowLoginModal,     // ← ADD THIS
  setRedirectAfterLogin  // ← ADD THIS

}) {
  const [data, setData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [activeCategory, setActiveCategory] = useState("");
  const itemRefsDesktop = useRef({});
  const itemRefsMobile = useRef({});
  const categoryRefs = useRef({});
  const highlightTimeoutRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const mobileScrollRef = useRef(null);
  
const handleProtectedAction = (action, redirectLink) => {
  if (!user) {
    setRedirectAfterLogin(redirectLink); // or specific place
    setShowLoginModal(true);
    return;
  }
  else action(); // run real action
};

// ✅ Get user's actual current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to default location if geolocation fails
          setUserLocation({
            lat: 25.3176,
            lon: 82.9739,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      console.warn("Geolocation not supported");
      // Fallback for browsers that don't support geolocation
      setUserLocation({
        lat: 25.3176,
        lon: 82.9739,
      });
    }
  }, []);

  useEffect(() => {
    if (!cityName) return;
    
    const fetchData = async () => {
      try {
        const url = isWishlistMode 
          ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/maps/wishlist/${cityName}`
          : `${process.env.NEXT_PUBLIC_BASE_URL}/api/maps/${cityName}`;
        
        const token = getAuthToken();
        
        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        
        const result = await response.json();
        
        if (isWishlistMode) {
          const transformedData = transformWishlistData(result.wishlist);
          setData(transformedData);
        } else {
          // Normalize categories in regular data
          const normalizedData = {};
          Object.entries(result.data).forEach(([category, items]) => {
            let normalizedCategory = category;
            if (category.toLowerCase() === 'foodplace') normalizedCategory = 'Food';
            if (category.toLowerCase() === 'shops') normalizedCategory = 'Shop';
            if (category.toLowerCase() === 'hotels') normalizedCategory = 'Accommodation';
            if (category.toLowerCase() === 'places') normalizedCategory = 'Place';

            if (!normalizedData[normalizedCategory]) {
              normalizedData[normalizedCategory] = [];
            }
            
            normalizedData[normalizedCategory].push(
              ...items.map(item => ({ ...item, category: normalizedCategory }))
            );
          });
          setData(normalizedData);
        }
      } catch (err) {
        console.error("Sidebar fetch error", err);
        setData(null);
      }
    };
    
    fetchData();
  }, [cityName, isWishlistMode]);

  // ✅ Detect active category while scrolling (Desktop only)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const categories = Object.keys(categoryRefs.current);
      let currentCategory = "";

      for (const category of categories) {
        const el = categoryRefs.current[category];
        if (el) {
          const rect = el.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          
          // Check if category header is in view
          if (rect.top <= containerRect.top + 100 && rect.bottom >= containerRect.top) {
            currentCategory = category;
            break;
          }
        }
      }

      if (currentCategory) {
        setActiveCategory(currentCategory);
      }
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => container.removeEventListener("scroll", handleScroll);
  }, [data]);

  // ✅ Auto-scroll and highlight when marker is clicked
useEffect(() => {
  if (!selectedItemId) return;

  const isMobile = window.innerWidth < 1024;

  const mobileEl = itemRefsMobile.current[selectedItemId];
  const desktopEl = itemRefsDesktop.current[selectedItemId];

  const el = isMobile ? mobileEl : desktopEl;
  if (!el) return;

  // Remove previous highlights
  Object.values(itemRefsMobile.current).forEach((ref) => {
    ref?.classList.remove("ring-4", "ring-blue-500", "bg-blue-50");
  });
  Object.values(itemRefsDesktop.current).forEach((ref) => {
    ref?.classList.remove("ring-4", "ring-blue-500", "bg-blue-50");
  });

  // Add highlight
  el.classList.add("ring-4", "ring-blue-500", "bg-blue-50");

  setTimeout(() => {
    if (isMobile) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    } else {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, 100);

  // Remove highlight after 3 seconds
  const timeout = setTimeout(() => {
    el.classList.remove("ring-4", "ring-blue-500", "bg-blue-50");
  }, 3000);

  return () => clearTimeout(timeout);
}, [selectedItemId]);


  if (!data) return <div className="p-4 text-gray-600">Loading...</div>;

  const visibleCategories =
    selectedCategory === "All" ? Object.keys(data) : [selectedCategory];

    //  Flatten all items for mobile horizontal scroll
    let allItems = visibleCategories.flatMap((category) => {
      let items = data[category] || [];
      if (isNearbyMode && userLocation) {
        items = items.filter(
          (item) =>
            getDistanceKm(userLocation.lat, userLocation.lon, item.lat, item.lon) <=
            radius
        );
      }
      return items.map(item => ({ ...item, category }));
    });

    //  Apply search filter to all items
    if (searchQuery.trim()) {
      allItems = filterItemsBySearch(allItems, searchQuery);
    }

    const hasAnyItems = allItems.length > 0;

  return (
    <>
      {/* Mobile: Horizontal Scroll */}
      <div 
        ref={mobileScrollRef}
        className="lg:hidden h-full overflow-x-auto overflow-y-hidden scroll-smooth"
      >
        {!hasAnyItems && isNearbyMode ? (
          <div className="flex items-center justify-center h-full text-gray-500 px-4">
            <div className="text-center">
              <p className="text-sm font-medium">No places found</p>
              <p className="text-xs mt-1">Try increasing the radius</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 p-3 h-full">
            {allItems.map((item) => (
              <div
                key={item._id}
                ref={(el) => (itemRefsMobile.current[item._id] = el)}
                onClick={() =>
                  onCardClick({ lat: item.lat, lon: item.lon }, item._id)
                }
                className={`relative flex-shrink-0 w-[200px] border rounded-xl p-3 shadow-sm hover:shadow-md
                  transition-all duration-300 cursor-pointer 
                  ${item.premium === "A" ? "bg-gradient-to-br from-yellow-300 to-yellow-90 border-yellow-400 shadow-xl" : "bg-white border-gray-200"}`}
              >
                {/* Category Icon on Image */}
                <div className="absolute top-1 right-1 p-1 z-1 flex justify-center items-center bg-white rounded-full border">
                  <img
                    src={categoryIcons[item.category] || categoryIcons.Place}
                    alt={item.category}
                    className="w-5 h-5 drop-shadow-lg"
                  />
                </div>

                <div className="relative">
                  <img
                    src={item.images?.[0] || "/images/placeholder.jpg"}
                    alt={item.places || item.hiddenGem || "Place"}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                  {/* ==== BUTTONS AT BOTTOM ==== */}
                  <div 
                    className="absolute bottom-1 flex justify-between text-sm px-2.5 w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    
                    {/* KNOW MORE BUTTON */}
                    <button
                      className="rounded bg-black/80 px-2 py-0.5 text-gray-100 border-gray-300 border-2 hover:bg-black/90 active:scale-95 transition"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleProtectedAction(() => {
                            window.open(`/city/${cityName}/${item.category}/${item._id}`, "_blank");
                          },
                          `/city/${cityName}/${item.category}/${item._id}`
                        );
                      }}
                    >
                      Know More
                    </button>


                    {/* GOOGLE MAP BUTTON */}
                    <button
                      className="rounded bg-black/70 px-2 py-0.5 text-green-300 border-green-600 border-2 hover:bg-black active:scale-95 transition"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(item.locationLink, "_blank");
                      }}
                    >
                      <SiGooglemaps />
                    </button>
                  </div>
                </div>

                <p className="font-medium text-gray-800 text-sm truncate">
                  {item.hotels ||
                    item.foodPlace ||
                    item.hiddenGem ||
                    item.places ||
                    item.shops ||
                    "Unnamed"}
                </p>
                <p className="text-xs text-gray-500 mt-1">Category: {item.category}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: Vertical Scroll with Sticky Headers */}
      <div 
        ref={scrollContainerRef}
        className="hidden lg:block h-full overflow-y-auto relative no-scrollbar "
      >
        {/* Sticky Category Indicator */}
        {activeCategory && (
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-300 via-blue-500 to-blue-600 px-4 py-2 shadow-md flex items-center justify-between gap-2">
            <div className="p-1 z-1 flex justify-center items-center bg-white rounded-full shadow-lg border border-blue-500"> 
            <img
              src={categoryIcons[activeCategory] || categoryIcons.Place}
              alt={activeCategory}
              className="w-5 h-5"
            />
            </div>
            <span className="font-semibold text-sm text-gray-100">{activeCategory}</span>
          </div>
        )}

        <div className="p-3 space-y-6">
          {!hasAnyItems && isNearbyMode ? (
            <div className="text-center py-10 text-gray-500">
              <p className="text-lg font-medium">No places found</p>
              <p className="text-sm mt-2">
                Try increasing the radius or disable "Search Nearby"
              </p>
            </div>
          ) :
          !hasAnyItems && (
            <div className="text-center py-10 text-gray-500">
              <p className="text-lg font-medium">No places found</p>
              <p className="text-sm mt-2">
                This category does not have any items. 
              </p>
            </div>
          )}
          
          {visibleCategories.map((category) => {
            let items = data[category];
            if (!items?.length) return null;

            // ✅ Filter by radius if Nearby Mode is enabled
            if (isNearbyMode && userLocation) {
              items = items.filter(
                (item) =>
                  getDistanceKm(userLocation.lat, userLocation.lon, item.lat, item.lon) <=
                  radius
              );
            }

            // ✅ Filter by search query
            if (searchQuery.trim()) {
              items = filterItemsBySearch(items, searchQuery);
            }

            // If no items left after filtering, don't show the category
            if (!items.length) return null;
            
            return (
              <div 
                key={category}
                ref={(el) => (categoryRefs.current[category] = el)}
              >
                <h2 className="text-lg font-semibold mb-2 text-gray-800 border-b pb-1 flex items-center gap-2">
                  <img
                    src={categoryIcons[category] || categoryIcons.Place}
                    alt={category}
                    className="w-5 h-5"
                  />
                  {category}
                </h2>
                <div className="flex flex-col gap-3">
                  {items.map((item) => (
                    <div
                      key={item._id}
                      ref={(el) => (itemRefsDesktop.current[item._id] = el)}
                      onClick={() =>
                        onCardClick({ lat: item.lat, lon: item.lon }, item._id)
                      }
                      className={`rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-105 
                        ${item.premium === "A" ? "bg-gradient-to-br from-yellow-300 to-yellow-90 border-yellow-500 border-2 shadow-xl" : "bg-white border border-gray-200"}`}
                    >
                      <div className="relative">
                        <img
                          src={item.images?.[0] || "/images/placeholder.jpg"}
                          alt={item.places || item.hiddenGem || "Place"}
                          className="w-full h-28 object-cover rounded-lg mb-2"
                        />

                        {/* Category Icon */}
                        <div className="absolute top-1 right-1 p-1 z-1 flex justify-center items-center bg-white rounded-full">
                          <img
                            src={categoryIcons[category] || categoryIcons.Place}
                            alt={category}
                            className="w-5 h-5 drop-shadow-lg"
                          />
                        </div>

                        {/* ==== BUTTONS AT BOTTOM ==== */}
                        <div className="absolute bottom-1 flex justify-between text-sm px-2.5 w-full">
                          
                          {/* KNOW MORE BUTTON */}
                          <button
                            className={`rounded bg-black/70 px-2 py-0.5 text-gray-100 border-gray-200 border-2 hover:border-white hover:scale-104 hover:bg-black/90
                              ${item.premium=="A" ? "text-yellow-400":""}
                              `}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProtectedAction(() => {
                                  window.open(`/city/${cityName}/${category}/${item._id}`, "_blank");
                                },
                                `/city/${cityName}/${category}/${item._id}`
                              );
                            }}
                          >
                            Know More
                          </button>


                          {/* GOOGLE MAP BUTTON */}
                          <button
                            className="rounded bg-black/60 px-2 py-0.5 text-green-300 border-green-600 border-2 hover:bg-black hover:border-green-200 hover:scale-103 transition duration-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(item.locationLink, "_blank");
                            }}
                          >
                            <SiGooglemaps />
                          </button>
                        </div>
                      </div>

                      <p className="font-medium text-gray-800 text-sm truncate">
                        {item.hotels ||
                          item.foodPlace ||
                          item.hiddenGem ||
                          item.places ||
                          item.shops ||
                          "Unnamed"}
                      </p>

                      <p className="text-xs text-gray-500">Category: {category}</p>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

