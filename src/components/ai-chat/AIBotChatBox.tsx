import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import AIBotInput from "./AIBotInput";
import AIBotMessage from "./AIBotMessage";
// import { connectApi } from "@/utils/connectApi";
// import { fetchCategoryData, searchCategory } from "@/utils/api";
// import { CategoryType } from "@/types";

export type AIBotMessageType = {
  role: "user" | "assistant";
  text: string;
  data?: any;
};

export default function AIBotChatBox({ onMapRequest }: { onMapRequest?: (params: any) => void }) {
  const [messages, setMessages] = useState<AIBotMessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const mapRAGCategory = (category: string): string => {
    const categoryMap: Record<string, string> = {
      accommodation: "Accommodation",
      activity: "Activity",
      cityinfo: "CityInfo",
      connectivity: "Connectivity",
      food: "Food",
      hiddengem: "HiddenGem",
      itinerary: "Itinerary",
      misc: "Misc",
      nearbyspot: "NearbySpot",
      place: "Place",
      shop: "Shop",
      transport: "Transport",
    };
    return categoryMap[category.toLowerCase()] || category;
  };

  const sendQuery = async (query: string) => {
    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setLoading(true);

    try {
      const selectedCity = localStorage.getItem("selectedCity") || "Varanasi";
      
      // Filter history to send only user/assistant text for context
      const history = messages.map(m => ({ 
        role: m.role === 'user' ? 'user' : 'model', 
        parts: [{ text: m.text }] 
      }));

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          history: history,
          message: query,
          city: selectedCity 
        }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      console.log("AI Chat API Response:", data);
      
      let textResponse = data.reply || "I didn't understand that.";
      let resultData: any = null;

      if (data.type === 'tool_use' && data.tool === 'map') {
        resultData = {
          type: "map",
          map: {
            center: data.params?.center || [25.3176, 82.9739],
            markers: data.params?.markers || []
          }
        };
        // Also trigger global map view if callback provided
        if (onMapRequest) {
            onMapRequest(data.params);
        }
      } else if (data.results || data.items) {
          const resultsArray = data.results || data.items;
          const mappedCategory = data.category ? mapRAGCategory(data.category) : "Place";
          resultData = {
              type: "cards",
              category: mappedCategory,
              items: resultsArray.map((item: any) => ({
                  ...item,
                  cityName: item.cityName || selectedCity
              }))
          };
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: textResponse,
          data: resultData
        },
      ]);
    } catch (err: any) {
      console.error("AI Chat Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `I'm having trouble connecting to the search service: ${err.message}. Please try again later.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div 
        ref={scrollRef}
        className="flex-1 w-full max-w-4xl mx-auto overflow-y-auto px-4 sm:px-6 space-y-6 mb-12 scrollbar-hide scroll-smooth"
      >
        {messages.map((msg, idx) => (
          <AIBotMessage key={idx} message={msg} />
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-sm text-white/80 relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 relative z-10"
            >
               <Image 
                src="/images/leaflet/loading.png" 
                alt="Loading" 
                width={40}
                height={40}
                className="object-contain"
              />
            </motion.div>
            
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: [0, 40, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 left-0 pointer-events-none"
            >
              <Image 
                src="/images/leaflet/Traveling by plane to any destination.png" 
                alt="Plane" 
                width={60}
                height={30}
                className="object-contain"
              />
            </motion.div>

            <span className="font-light tracking-wide animate-pulse z-10">AI is thinking...</span>
          </div>
        )}
      </div>

      <AIBotInput onSend={sendQuery} disabled={loading} />
    </>
  );
}
