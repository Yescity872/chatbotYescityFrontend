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
    longitude >= -180 && 
    longitude <= 180
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
  // Alias support
  foodPlace: new L.Icon({
    iconUrl: "/images/leaflet/icon-food.png",
    iconSize: [30, 45],
  }),
  shops: new L.Icon({
    iconUrl: "/images/leaflet/icon-shop.png",
    iconSize: [30, 45],
  }),
  User: new L.Icon({
    iconUrl: "/images/leaflet/user-marker.png",
    iconSize: [32, 48],
  }),
};

// ✅ Transform wishlist data to match regular map data structure
function transformWishlistData(wishlistResponse) {
  const transformed = {};
  let skippedCount = 0;
  
  wishlistResponse.forEach(item => {
    const category = item.onModel;
    const coords = normalizeCoordinates(item.data);
    
    // Validate coordinates before adding
    if (!isValidCoordinate(coords.lat, coords.lon)) {
      console.warn('Skipping wishlist item without valid coordinates:', {
        id: item.data._id,
        name: item.data.places || item.data.hotels || item.data.hiddenGem || item.data.foodPlace || item.data.shops || 'Unknown',
        lat: coords.lat,
        lon: coords.lon
      });
      skippedCount++;
      return;
    }
    
    const itemData = {
      ...item.data,
      _id: item.data._id,
      category: category,
      lat: coords.lat,
      lon: coords.lon
    };
    
    if (!transformed[category]) {
      transformed[category] = [];
    }
    transformed[category].push(itemData);
  });
  
  if (skippedCount > 0) {
    console.warn(`Skipped ${skippedCount} wishlist items with invalid/missing coordinates`);
  }
  
  return transformed;
}

// ✅ Helper to get auth token from cookies
function getAuthToken() {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(c => c.trim().startsWith('token='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
}

/**
 * @typedef {Object} MapComponentProps
 * @property {string} cityName
 * @property {string} [selectedCategory]
 * @property {boolean} [isNearbyMode]
 * @property {number} [radius]
 * @property {string | null} [selectedItemId]
 * @property {{lat: number, lon: number} | null} [focusCoords]
 * @property {Function} [onMarkerClick]
 * @property {boolean} [isWishlistMode]
 * @property {string} [searchQuery]
 * @property {any[]} [markers]
 */

/** @param {MapComponentProps} props */
export default function MapComponent({
  selectedCategory = "All",
  cityName,
  isNearbyMode = false,
  radius = 5,
  selectedItemId,
  focusCoords,
  onMarkerClick,
  isWishlistMode = false,
  searchQuery = "",
  markers = [], // ✅ New prop for direct markers
}) {
  const [data, setData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const markerRefs = useRef({});

  // ✅ Get user's actual current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          
          // Validate the coordinates before setting
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

  // ✅ Fetch data based on wishlist mode or regular mode
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
        
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const result = await response.json();
        
        if (isWishlistMode) {
          const transformedData = transformWishlistData(result.wishlist);
          setData(transformedData);
        } else {
          // Validate and normalize regular data
          const validatedData = {};
          let totalSkipped = 0;
          
          Object.entries(result.data).forEach(([category, items]) => {
            // Normalize category name
            let normalizedCategory = category;
            if (category.toLowerCase() === 'foodplace') normalizedCategory = 'Food';
            if (category.toLowerCase() === 'shops') normalizedCategory = 'Shop';
            if (category.toLowerCase() === 'hotels') normalizedCategory = 'Accommodation';
            if (category.toLowerCase() === 'places') normalizedCategory = 'Place';

            validatedData[normalizedCategory] = items
              .map(item => {
                const coords = normalizeCoordinates(item);
                return { ...item, lat: coords.lat, lon: coords.lon, category: normalizedCategory };
              })
              .filter(item => {
                if (isValidCoordinate(item.lat, item.lon)) {
                  return true;
                }
                console.warn(`Skipping ${normalizedCategory} item without valid coordinates:`, {
                  id: item._id,
                  name: item.places || item.hotels || item.hiddenGem || item.foodPlace || item.shops || 'Unknown',
                  lat: item.lat,
                  lon: item.lon
                });
                totalSkipped++;
                return false;
              });
          });
          
          if (totalSkipped > 0) {
            console.warn(`Skipped ${totalSkipped} items with invalid/missing coordinates`);
          }
          
          setData(validatedData);
        }
      } catch (error) {
        console.error("Error fetching map data:", error);
        setData(null);
      }
    };
    
    fetchData();
  }, [cityName, isWishlistMode]);

  // ✅ Auto-open popup when card is clicked
  useEffect(() => {
    if (selectedItemId && markerRefs.current[selectedItemId]) {
      const marker = markerRefs.current[selectedItemId];
      marker.openPopup();
    }
  }, [selectedItemId]);

  if (!data) return <div className="text-center py-10">Loading map...</div>;

  // ✅ Flatten all markers and ensure they have valid coordinates
  const allMarkers = Object.entries(data)
    .flatMap(([category, items]) =>
      items
        .map((item) => ({ ...item, category }))
        .filter(item => isValidCoordinate(item.lat, item.lon))
    );

  // ✅ Category filtering
  let visibleMarkers =
    selectedCategory === "All"
      ? allMarkers
      : allMarkers.filter((m) => m.category === selectedCategory);

  // ✅ Search Query filtering (IMPORTANT: This fixes "No places found")
  if (searchQuery && searchQuery.trim()) {
    visibleMarkers = filterItemsBySearch(visibleMarkers, searchQuery);
  }

  // ✅ Ensure selected item is ALWAYS visible (overrides search filter)
  if (selectedItemId) {
    const selectedItem = allMarkers.find(m => m._id === selectedItemId);
    if (selectedItem && !visibleMarkers.some(m => m._id === selectedItemId)) {
      visibleMarkers.push(selectedItem);
    }
  }

  // ✅ Radius filtering (Nearby Mode)
  if (isNearbyMode && userLocation && isValidCoordinate(userLocation.lat, userLocation.lon)) {
    visibleMarkers = visibleMarkers.filter(
      (m) =>
        getDistanceKm(userLocation.lat, userLocation.lon, m.lat, m.lon) <=
        radius
    );
  }

  // ✅ Combine with passed markers if any (Fixes research-only items)
  if (markers && Array.isArray(markers)) {
    const validPassedMarkers = markers
      .map(m => {
        const coords = normalizeCoordinates(m);
        return { 
          ...m, 
          lat: coords.lat, 
          lon: coords.lon,
          category: m.category || (isShopOrFood(m) ? "Food" : "Place") // Simple heuristic
        };
      })
      .filter(m => isValidCoordinate(m.lat, m.lon));
    
    // Add passed markers if not already in visibleMarkers
    validPassedMarkers.forEach(pm => {
      if (!visibleMarkers.some(vm => vm._id === pm._id)) {
        visibleMarkers.push(pm);
      }
    });
  }

  // Helper for marker category detection
  function isShopOrFood(item) {
    const name = (item.shops || item.name || "").toLowerCase();
    const reason = (item.aiReason || item.reason || item.description || "").toLowerCase();
    return name.includes('food') || name.includes('restaurant') || 
           reason.includes('food') || reason.includes('taste');
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        className="rounded-xl shadow-md"
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        />

        {/* ✅ Fit bounds when category changes */}
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

        {/* ✅ Radius visualization - only render if user location is valid */}
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

        {/* ✅ User marker - only render if location is valid */}
        {userLocation && isValidCoordinate(userLocation.lat, userLocation.lon) && (
          <Marker
            position={[userLocation.lat, userLocation.lon]}
            icon={icons.User}
          >
            <Popup>📍 You are here</Popup>
          </Marker>
        )}

        {/* ✅ Category markers - all markers are already validated */}
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

        {/* ✅ My Location Button */}
        <MyLocationButton userLocation={userLocation} />
      </MapContainer>
    </div>
  );
}