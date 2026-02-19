"use client";

import React, { useEffect, useState, useRef } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
    Circle,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default Leaflet icons in Next.js
// Fix for default Leaflet icons in Next.js (will be handled inside component)


// ✅ Helper to validate coordinates
function isValidCoordinate(lat, lon) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    return (
        lat != null &&
        lon != null &&
        !isNaN(latitude) &&
        !isNaN(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        latitude >= -180 &&
        latitude <= 180
    );
}

// ✅ Helper to normalize coordinate data
function normalizeCoordinates(item) {
    const lat = item.lat || item.latitude;
    const lon = item.lon || item.longitude || item.lng;

    return {
        lat: lat != null ? parseFloat(lat) : null,
        lon: lon != null ? parseFloat(lon) : null
    };
}

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

// ✅ My Location Button Component
function MyLocationButton({ userLocation }) {
    const map = useMap();

    const handleClick = () => {
        if (userLocation && isValidCoordinate(userLocation.lat, userLocation.lon)) {
            map.flyTo([userLocation.lat, userLocation.lon], 13, {
                duration: 1.5,
            });
        }
    };

    return (
        <button
            onClick={handleClick}
            className="absolute bottom-6 right-6 z-[1000] bg-white hover:bg-gray-100 text-gray-700 font-medium p-3 rounded-full shadow-lg border-2 border-gray-300 transition-all duration-200 hover:scale-110"
            title="Go to my location"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
        </button>
    );
}

// Helper to fit bounds to visible markers when category changes
function FitBoundsOnCategoryChange({ selectedCategory, visibleMarkers, userLocation }) {
    const map = useMap();
    const prevCategoryRef = useRef(selectedCategory);

    useEffect(() => {
        // Only fit bounds if category actually changed
        if (prevCategoryRef.current !== selectedCategory && prevCategoryRef.current !== null) {
            if (visibleMarkers.length > 0) {
                // Create bounds from all visible markers with valid coordinates
                const validMarkers = visibleMarkers.filter(m =>
                    isValidCoordinate(m.lat, m.lon)
                );

                if (validMarkers.length > 0) {
                    const bounds = L.latLngBounds(
                        validMarkers.map((m) => [m.lat, m.lon])
                    );

                    // Add user location to bounds if available and valid
                    if (userLocation && isValidCoordinate(userLocation.lat, userLocation.lon)) {
                        bounds.extend([userLocation.lat, userLocation.lon]);
                    }

                    // Fit map to bounds with padding
                    map.fitBounds(bounds, {
                        padding: [50, 50],
                        maxZoom: 12,
                        duration: 1.5
                    });
                } else {
                    // If no valid markers, reset to default view
                    map.flyTo([20.5937, 78.9629], 5, { duration: 1.5 });
                }
            } else {
                // If no markers, reset to default view
                map.flyTo([20.5937, 78.9629], 5, { duration: 1.5 });
            }
        }
        prevCategoryRef.current = selectedCategory;
    }, [selectedCategory, visibleMarkers, userLocation, map]);

    return null;
}

// Helper to fly to a specific location
function FlyToLocation({ focusCoords, selectedItemId }) {
    const map = useMap();

    useEffect(() => {
        if (focusCoords && selectedItemId && isValidCoordinate(focusCoords.lat, focusCoords.lon)) {
            map.flyTo([focusCoords.lat, focusCoords.lon], 15, {
                duration: 1.5,
            });
        }
    }, [focusCoords, selectedItemId, map]);

    return null;
}

// ✅ Helper to auto-fit the search circle in view
function FitRadius({ userLocation, radius, isNearbyMode }) {
    const map = useMap();

    useEffect(() => {
        if (!userLocation || !isNearbyMode || !isValidCoordinate(userLocation.lat, userLocation.lon)) return;

        const center = L.latLng(userLocation.lat, userLocation.lon);
        const bounds = center.toBounds(radius * 2000);
        map.fitBounds(bounds, { padding: [50, 50] });
    }, [userLocation, radius, isNearbyMode, map]);

    return null;
}

// ✅ Distance helper (Haversine formula)
function getDistanceKm(lat1, lon1, lat2, lon2) {
    // Validate all coordinates before calculating
    if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
        return Infinity; // Return infinity for invalid coordinates
    }

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


export default function MapComponent({
    selectedCategory = "All",
    cityName,
    isNearbyMode = false,
    radius = 5,
    selectedItemId,
    focusCoords,
    onMarkerClick,
    searchQuery = "",
    markers = [],
}) {
    const [data, setData] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const markerRefs = useRef({});

    // ✅ Fix for default Leaflet icons in Next.js
    useEffect(() => {
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        });
    }, []);


    // ✅ Icons per category
    const icons = {
        Accommodation: new L.Icon({
            iconUrl: "/images/leaflet/icon-accommodation.png",
            iconSize: [30, 45],
        }),
        Food: new L.Icon({
            iconUrl: "/images/leaflet/icon-food.png",
            iconSize: [30, 45],
        }),
        HiddenGem: new L.Icon({
            iconUrl: "/images/leaflet/icon-hidden.png",
            iconSize: [30, 45],
        }),
        NearbySpot: new L.Icon({
            iconUrl: "/images/leaflet/icon-nearby.png",
            iconSize: [30, 45],
        }),
        Place: new L.Icon({
            iconUrl: "/images/leaflet/icon-place.png",
            iconSize: [30, 45],
        }),
        Shop: new L.Icon({
            iconUrl: "/images/leaflet/icon-shop.png",
            iconSize: [30, 45],
        }),
        User: new L.Icon({
            iconUrl: "/images/leaflet/user-marker.png",
            iconSize: [32, 48],
        }),
    };

    // ✅ Get user's actual current location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    };

                    if (isValidCoordinate(coords.lat, coords.lon)) {
                        setUserLocation(coords);
                    } else {
                        console.error("Invalid geolocation coordinates received");
                        setUserLocation({ lat: 25.3176, lon: 82.9739 });
                    }
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setUserLocation({ lat: 25.3176, lon: 82.9739 });
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        } else {
            console.warn("Geolocation not supported");
            setUserLocation({ lat: 25.3176, lon: 82.9739 });
        }
    }, []);

    // ✅ Fetch data
    useEffect(() => {
        if (!cityName) return;

        const fetchData = async () => {
            try {
                const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/maps/${cityName}`;

                const response = await fetch(url);

                if (!response.ok) throw new Error(`Error ${response.status}`);
                const result = await response.json();

                // Validate and normalize regular data
                const validatedData = {};

                if (result.data) {
                    Object.entries(result.data).forEach(([category, items]) => {
                        validatedData[category] = items
                            .map(item => {
                                const coords = normalizeCoordinates(item);
                                return { ...item, lat: coords.lat, lon: coords.lon };
                            })
                            .filter(item => isValidCoordinate(item.lat, item.lon));
                    });
                    setData(validatedData);
                } else {
                    setData({});
                }

            } catch (error) {
                console.error("Error fetching map data:", error);
                setData(null);
            }
        };

        fetchData();
    }, [cityName]);

    // ✅ Auto-open popup when card is clicked
    useEffect(() => {
        if (selectedItemId && markerRefs.current[selectedItemId]) {
            const marker = markerRefs.current[selectedItemId];
            // Leaflet markers don't always have openPopup immediately available if not added to map yet?
            // But usually fine.
            marker.openPopup();
        }
    }, [selectedItemId]);

    if (!data) return <div className="text-center py-10">Loading map for {cityName}...</div>;

    // ✅ Flatten all markers and ensure they have valid coordinates
    const allMarkers = [
        ...Object.entries(data)
            .flatMap(([category, items]) =>
                items
                    .map((item) => ({ ...item, category }))
            ),
        ...markers.map(m => ({ ...m, category: m.category || "Place" }))
    ].filter(item => isValidCoordinate(item.lat, item.lon));

    // ✅ Category filtering
    let visibleMarkers =
        selectedCategory === "All" || !selectedCategory
            ? allMarkers
            : allMarkers.filter((m) => m.category === selectedCategory);

    // ✅ Radius filtering (Nearby Mode)
    if (isNearbyMode && userLocation && isValidCoordinate(userLocation.lat, userLocation.lon)) {
        visibleMarkers = visibleMarkers.filter(
            (m) =>
                getDistanceKm(userLocation.lat, userLocation.lon, m.lat, m.lon) <=
                radius
        );
    }

    // ✅ Search filtering
    if (searchQuery?.trim()) {
        visibleMarkers = filterItemsBySearch(visibleMarkers, searchQuery);
    }

    return (
        <div className="relative h-full w-full">
            <MapContainer
                center={[20.5937, 78.9629]}
                zoom={5}
                style={{ height: "100%", width: "100%" }}
                className="rounded-xl shadow-md z-0"
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                />

                <FitBoundsOnCategoryChange
                    selectedCategory={selectedCategory}
                    visibleMarkers={visibleMarkers}
                    userLocation={userLocation}
                />

                <FitRadius
                    userLocation={userLocation}
                    radius={radius}
                    isNearbyMode={isNearbyMode}
                />

                <FlyToLocation focusCoords={focusCoords} selectedItemId={selectedItemId} />

                {isNearbyMode && userLocation && isValidCoordinate(userLocation.lat, userLocation.lon) && (
                    <Circle
                        center={[userLocation.lat, userLocation.lon]}
                        radius={radius * 1000}
                        pathOptions={{
                            color: "#007BFF",
                            weight: 1.5,
                            opacity: 0.8,
                            fillColor: "#007BFF",
                            fillOpacity: 0.15,
                        }}
                        interactive={false}
                    />
                )}

                {userLocation && isValidCoordinate(userLocation.lat, userLocation.lon) && (
                    <Marker
                        position={[userLocation.lat, userLocation.lon]}
                        icon={icons.User}
                    >
                        <Popup>📍 You are here</Popup>
                    </Marker>
                )}

                {visibleMarkers.map((m, i) => (
                    <Marker
                        key={m._id || i}
                        position={[m.lat, m.lon]}
                        icon={icons[m.category] || icons.Place}
                        ref={(ref) => {
                            if (ref) markerRefs.current[m._id] = ref;
                        }}
                        eventHandlers={{
                            click: () => {
                                if (onMarkerClick) {
                                    onMarkerClick(m._id, { lat: m.lat, lon: m.lon });
                                }
                            },
                        }}
                    >
                        <Popup autoPan>
                            <strong>
                                {m.places ||
                                    m.hotels ||
                                    m.hiddenGem ||
                                    m.foodPlace ||
                                    m.shops ||
                                    "Location"}
                            </strong>
                            <br />
                            <span className="text-sm text-gray-500">
                                Category: {m.category}
                            </span>
                        </Popup>
                    </Marker>
                ))}

                {visibleMarkers.length === 0 && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 px-6 py-4 rounded-xl shadow-lg z-[1000] text-center border border-gray-200 backdrop-blur-sm">
                        <p className="text-gray-800 font-medium">No results for this category</p>
                        <p className="text-sm text-gray-500 mt-1">Try selecting "All" or a different search.</p>
                    </div>
                )}

                <MyLocationButton userLocation={userLocation} />
            </MapContainer>
        </div>
    );
}
