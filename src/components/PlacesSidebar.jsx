"use client";

import React, { useEffect, useState, useRef } from "react";
import { SiGooglemaps } from "react-icons/si";

// ✅ Distance helper
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


// ✅ Helper function to search/filter items
function filterItemsBySearch(items, searchQuery) {
    if (!searchQuery?.trim()) return items;

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

export default function PlacesSidebar({
    selectedCategory = "All",
    cityName,
    radius = 5,
    isNearbyMode = false,
    selectedItemId,
    onCardClick,
    searchQuery = "",
}) {
    const [data, setData] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [activeCategory, setActiveCategory] = useState("");
    const itemRefsDesktop = useRef({});
    const itemRefsMobile = useRef({});
    const categoryRefs = useRef({});
    const scrollContainerRef = useRef(null);
    const mobileScrollRef = useRef(null);


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
                    // Fallback
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
            setUserLocation({
                lat: 25.3176,
                lon: 82.9739,
            });
        }
    }, []);

    // ✅ Fetch Data
    useEffect(() => {
        if (!cityName) return;

        const fetchData = async () => {
            try {
                const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/maps/${cityName}`;

                const response = await fetch(url);
                if (!response.ok) throw new Error("Failed to fetch");

                const result = await response.json();
                setData(result.data || {});

            } catch (err) {
                console.error("Sidebar fetch error", err);
                setData(null);
            }
        };

        fetchData();
    }, [cityName]);

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
        handleScroll();

        return () => container.removeEventListener("scroll", handleScroll);
    }, [data]);

    // ✅ Auto-scroll and highlight when marker is clicked checks
    useEffect(() => {
        if (!selectedItemId) return;

        const isMobile = window.innerWidth < 1024;
        const mobileEl = itemRefsMobile.current[selectedItemId];
        const desktopEl = itemRefsDesktop.current[selectedItemId];

        const el = isMobile ? mobileEl : desktopEl;
        if (!el) return;

        // Remove previous highlights
        Object.values(itemRefsMobile.current).forEach((ref) => {
            // @ts-ignore
            ref?.classList.remove("ring-4", "ring-blue-500", "bg-blue-50");
        });
        Object.values(itemRefsDesktop.current).forEach((ref) => {
            // @ts-ignore
            ref?.classList.remove("ring-4", "ring-blue-500", "bg-blue-50");
        });

        // Add highlight
        el.classList.add("ring-4", "ring-blue-500", "bg-blue-50");

        setTimeout(() => {
            el.scrollIntoView({
                behavior: "smooth",
                block: isMobile ? "nearest" : "center",
                inline: isMobile ? "center" : "nearest"
            });
        }, 100);

        const timeout = setTimeout(() => {
            el.classList.remove("ring-4", "ring-blue-500", "bg-blue-50");
        }, 3000);

        return () => clearTimeout(timeout);
    }, [selectedItemId]);


    if (!data) return <div className="p-4 text-gray-600">Loading places...</div>;

    const visibleCategories =
        selectedCategory === "All" || !selectedCategory ? Object.keys(data) : [selectedCategory];

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
    if (searchQuery?.trim()) {
        allItems = filterItemsBySearch(allItems, searchQuery);
    }

    const hasAnyItems = allItems.length > 0;

    return (
        <div className="h-full w-full flex flex-col lg:h-full lg:overflow-hidden bg-gray-50">

            {/* Mobile: Horizontal Scroll (Only visible on small screens) */}
            <div
                ref={mobileScrollRef}
                className="lg:hidden w-full overflow-x-auto overflow-y-hidden scroll-smooth h-[220px] bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 absolute bottom-0 left-0"
            >
                {!hasAnyItems ? (
                    <div className="flex items-center justify-center h-full text-gray-500 px-4 w-full">
                        <p className="text-sm">No places found</p>
                    </div>
                ) : (
                    <div className="flex gap-3 p-3 h-full items-center">
                        {allItems.map((item) => (
                            <div
                                key={item._id}
                                ref={(el) => (itemRefsMobile.current[item._id] = el)}
                                onClick={() =>
                                    onCardClick && onCardClick(item._id, { lat: item.lat, lon: item.lon })
                                }
                                className={`relative flex-shrink-0 w-[280px] h-[190px] border rounded-xl p-3 shadow-sm bg-white cursor-pointer hover:shadow-md transition-all`}
                            >
                                <div className="flex gap-3 h-full">
                                    <img
                                        src={item.images?.[0] || "/images/placeholder.jpg"}
                                        alt={item.places || "Place"}
                                        className="w-1/3 h-full object-cover rounded-lg"
                                    />
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-semibold text-gray-800 text-sm line-clamp-2">
                                                {item.hotels || item.foodPlace || item.hiddenGem || item.places || item.shops || "Unnamed"}
                                            </h4>
                                            <p className="text-xs text-blue-500 mt-1">{item.category}</p>
                                        </div>
                                        <button
                                            className="self-start text-xs bg-gray-100 px-2 py-1 rounded border border-gray-300 hover:bg-gray-200 mt-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(item.locationLink, "_blank");
                                            }}
                                        >
                                            Open Maps ↗
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Desktop: Vertical List (Only visible on large screens) */}
            <div
                ref={scrollContainerRef}
                className="hidden lg:block h-full overflow-y-auto no-scrollbar scroll-smooth pb-20"
            >

                <div className="p-3 space-y-6">
                    {!hasAnyItems && (
                        <div className="text-center py-10 text-gray-500">
                            <p className="text-lg font-medium">No places found</p>
                        </div>
                    )}

                    {visibleCategories.map((category) => {
                        let items = data[category];
                        if (!items?.length) return null;

                        if (isNearbyMode && userLocation) {
                            items = items.filter(
                                (item) =>
                                    getDistanceKm(userLocation.lat, userLocation.lon, item.lat, item.lon) <=
                                    radius
                            );
                        }

                        if (searchQuery?.trim()) {
                            items = filterItemsBySearch(items, searchQuery);
                        }

                        if (!items.length) return null;

                        return (
                            <div
                                key={category}
                                ref={(el) => (categoryRefs.current[category] = el)}
                            >
                                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm py-2 px-1 mb-2 border-b border-gray-100 flex items-center gap-2">
                                    <img src={categoryIcons[category] || categoryIcons.Place} alt="" className="w-5 h-5" />
                                    <h3 className="font-bold text-gray-700">{category}</h3>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {items.map((item) => (
                                        <div
                                            key={item._id}
                                            ref={(el) => (itemRefsDesktop.current[item._id] = el)}
                                            onClick={() =>
                                                onCardClick && onCardClick(item._id, { lat: item.lat, lon: item.lon })
                                            }
                                            className="group bg-white rounded-xl p-3 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex gap-3"
                                        >
                                            <div className="w-24 h-24 flex-shrink-0">
                                                <img
                                                    src={item.images?.[0] || "/images/placeholder.jpg"}
                                                    alt={item.places || "Place"}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            </div>

                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                                                        {item.hotels || item.foodPlace || item.hiddenGem || item.places || item.shops || "Unnamed"}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                                        {item.description || "Explore this amazing place in " + cityName}
                                                    </p>
                                                </div>

                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        className="text-xs px-2 py-1 rounded bg-gray-50 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors flex items-center gap-1"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.open(item.locationLink, "_blank");
                                                        }}
                                                    >
                                                        <SiGooglemaps size={10} /> Maps
                                                    </button>
                                                    <button
                                                        className="text-xs px-2 py-1 rounded bg-gray-50 border border-gray-200 hover:bg-black hover:text-white transition-colors"
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
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
