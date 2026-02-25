"use client";

import dynamic from 'next/dynamic';
import ChatInterface from '@/components/ChatInterface';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
// @ts-ignore
import PlacesSidebar from '@/components/PlacesSidebar';

// Dynamic import for Map to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/MapComponent.jsx'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">Loading Map...</div>
});


interface MapParams {
  cityName: string;
  category?: string;
  searchQuery?: string;
}

export default function Home() {
  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mapParams, setMapParams] = useState<MapParams | null>(null);

  // Shared Selection State
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [focusCoords, setFocusCoords] = useState<{ lat: number; lon: number } | null>(null);

  const handleMapRequest = (params: any) => {
    setMapParams(params);
    setIsSidebarOpen(true);
    // Reset selection on new search
    setSelectedItemId(null);
    setFocusCoords(null);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleMarkerClick = (id: string, coords: { lat: number, lon: number }) => {
    setSelectedItemId(id);
    setFocusCoords(coords);
  };

  const handleCardClick = (id: string, coords: { lat: number; lon: number }) => {
    setSelectedItemId(id);
    setFocusCoords(coords);
  };

  return (
    <main className="relative w-full h-screen bg-slate-50 overflow-hidden flex flex-col items-center justify-center">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 opacity-70" />
      <div className="absolute top-0 left-0 w-full h-full z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />


      {/* Main Container */}
      <div className="relative z-10 w-full h-full max-w-[1600px] mx-auto flex gap-6 p-2 md:p-6 transition-all duration-500">

        {/* Chat Section */}
        <div className={`transition-all duration-500 ease-in-out h-full ${isSidebarOpen ? 'hidden lg:block lg:w-1/4' : 'w-full max-w-3xl mx-auto'}`}>
          <ChatInterface onMapRequest={handleMapRequest} />
        </div>

        {/* Sidebar (Feature Panel) */}
        <AnimatePresence>
          {isSidebarOpen && mapParams && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 lg:static z-20 lg:z-0 w-full lg:flex-1 h-full bg-white rounded-none lg:rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col lg:flex-row"
            >
              {/* Header for Mobile only */}
              <div className="lg:hidden p-4 border-b border-gray-100 flex justify-between items-center bg-white z-50">
                <h3 className="font-bold text-gray-800">
                  {mapParams.cityName} <span className="text-blue-500 text-xs">{mapParams.category}</span>
                </h3>
                <button onClick={closeSidebar} className="p-2 bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>


              {/* Cards Sidebar (Left on Desktop, Bottom on Mobile) */}
              <div className="order-2 lg:order-1 h-[220px] lg:h-full w-full lg:w-[320px] xl:w-[380px] lg:border-r border-gray-200 bg-white relative z-20">
                <PlacesSidebar
                  cityName={mapParams.cityName}
                  selectedCategory={mapParams.category}
                  searchQuery={mapParams.searchQuery}
                  selectedItemId={selectedItemId}
                  onCardClick={handleCardClick}
                />
              </div>

              {/* Map (Right on Desktop, Top on Mobile) */}
              <div className="order-1 lg:order-2 flex-1 relative bg-gray-50 h-full">
                {/* Desktop Close Button */}
                <button
                  onClick={closeSidebar}
                  className="hidden lg:block absolute top-4 right-4 z-[1000] bg-white hover:bg-red-50 text-gray-600 hover:text-red-500 p-2 rounded-full shadow-lg transition-colors border border-gray-200"
                  title="Close Map"
                >
                  <X size={24} />
                </button>

                <MapComponent
                  cityName={mapParams.cityName}
                  selectedCategory={mapParams.category || "All"}
                  searchQuery={mapParams.searchQuery || ""}
                  selectedItemId={selectedItemId}
                  focusCoords={focusCoords}
                  onMarkerClick={handleMarkerClick}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}

