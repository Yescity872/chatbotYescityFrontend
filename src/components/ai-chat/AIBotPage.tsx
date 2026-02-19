"use client";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import AIBotChatBox from "./AIBotChatBox";
import { useState } from "react";
import dynamic from 'next/dynamic';
import { X } from 'lucide-react';
// @ts-ignore
import PlacesSidebar from '@/components/PlacesSidebar';

// Dynamic import for Map to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/MapComponent.jsx'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-100/10 text-white/40">Loading Map...</div>
});

interface MapParams {
  cityName: string;
  category?: string;
  searchQuery?: string;
}

export default function AIBotPage() {
  // Sidebar/Map State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mapParams, setMapParams] = useState<MapParams | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [focusCoords, setFocusCoords] = useState<{ lat: number; lon: number } | null>(null);

  const handleMapRequest = (params: any) => {
    setMapParams(params);
    setIsSidebarOpen(true);
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
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-start pt-20 sm:pt-24 px-4 overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at top, #525F86 0%, #152C71 45%, #0f1f4a 100%)",
      }}
    >
      {/* Background Illustrations */}
      
      {!isSidebarOpen && (
        <>
          {/* Plane at the top */}
          <motion.div
            initial={{ x: -100, y: -50, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-10 left-1/2 -translate-x-1/2 z-0 pointer-events-none opacity-40 md:opacity-60"
          >
            <Image
              src="/images/leaflet/Traveling by plane to any destination.png"
              alt="Traveling by plane"
              width={400}
              height={200}
              className="object-contain opacity-50"
            />
          </motion.div>

          {/* Cloud Left */}
          <motion.div
            animate={{ x: [0, 15, 0], y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-24 left-[10%] z-0 pointer-events-none opacity-30 hidden md:block"
          >
            <Image
              src="/images/leaflet/large and small clouds.png"
              alt="Cloud"
              width={200}
              height={100}
              className="object-contain"
            />
          </motion.div>

          {/* Cloud Right */}
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-32 right-[10%] z-0 pointer-events-none opacity-30 hidden md:block"
          >
            <Image
              src="/images/leaflet/large and small clouds.png"
              alt="Cloud"
              width={250}
              height={120}
              className="object-contain scale-x-[-1]"
            />
          </motion.div>

          {/* Boy with suitcase - Left of chat */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="absolute bottom-10 left-[5%] xl:left-[10%] z-0 pointer-events-none hidden lg:block"
          >
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/images/leaflet/boy with suitcase travel.png"
                alt="Traveler"
                width={220}
                height={220}
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        </>
      )}

      <div className={`relative z-10 w-full transition-all duration-500 flex flex-col items-center ${isSidebarOpen ? 'max-w-full h-[calc(100vh-120px)] px-2' : 'max-w-6xl'}`}>
        
        {!isSidebarOpen && (
          <div className="text-center">
            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
              Welcome to YesCity <span className="text-blue-400"></span>
            </h1>

            {/* Subheading */}
            <p className="text-white/90 text-base sm:text-lg md:text-xl 
                  mb-12 max-w-2xl mx-auto text-center font-light drop-shadow-sm">
                  Your personal travel companion, powered by intelligence.
            </p>
          </div>
        )}


        <div className={`w-full h-full flex gap-4 transition-all duration-500 overflow-hidden ${isSidebarOpen ? 'flex-col lg:flex-row' : 'flex-col'}`}>
          {/* AI Chat Experience */}
          <div className={`transition-all duration-500 flex flex-col ${isSidebarOpen ? 'w-full lg:w-[350px] xl:w-[400px] h-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden' : 'w-full max-w-4xl mx-auto'}`}>
            {isSidebarOpen && (
              <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <span className="text-white font-medium">YesCity AI</span>
                <button onClick={closeSidebar} className="p-1.5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
            )}
            <AIBotChatBox onMapRequest={handleMapRequest} />
          </div>

          {/* Map/Sidebar Panel */}
          <AnimatePresence>
            {isSidebarOpen && mapParams && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex flex-col lg:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/10"
              >
                {/* Mobile Header */}
                <div className="lg:hidden p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                  <h3 className="font-bold text-gray-800">
                    {mapParams.cityName} <span className="text-blue-500 text-xs">{mapParams.category}</span>
                  </h3>
                  <button onClick={closeSidebar} className="p-2 bg-gray-100 rounded-full">
                    <X size={20} />
                  </button>
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-[320px] xl:w-[380px] h-[300px] lg:h-full overflow-hidden bg-gray-50 lg:border-r border-gray-100">
                  <PlacesSidebar
                    cityName={mapParams.cityName}
                    selectedCategory={mapParams.category}
                    searchQuery={mapParams.searchQuery}
                    selectedItemId={selectedItemId}
                    onCardClick={handleCardClick}
                  />
                </div>

                {/* Map */}
                <div className="flex-1 relative h-full">
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
      </div>
    </div>
  );
}
