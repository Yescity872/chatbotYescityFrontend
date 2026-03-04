import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import AIBotInput from "./AIBotInput";
import AIBotMessage from "./AIBotMessage";

export type AIBotMessageType = {
  role: "user" | "assistant";
  text: string;
  recommendations?: any[];
  cityName?: string;
};

export default function AIBotChatBox({ onMapRequest }: { onMapRequest?: (params: any) => void }) {
  const [messages, setMessages] = useState<AIBotMessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lastCity, setLastCity] = useState("Varanasi"); // Default city

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const extractCity = (query: string) => {
    // Expanded list of recognized cities
    const cities = [
      "Varanasi", "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Kolkata", "Chennai", "Pune",
      "Agra", "Jaipur", "Lucknow", "Ayodhya", "Kanpur", "Prayagraj", "Mathura", "Rishikesh"
    ];
    const lowerQuery = query.toLowerCase();
    const found = cities.find(city => lowerQuery.includes(city.toLowerCase()));
    return found || lastCity;
  };

  const sendQuery = async (query: string) => {
    const currentCity = extractCity(query);
    if (currentCity !== lastCity) setLastCity(currentCity);

    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setLoading(true);

    try {
      // Get auth token for internal backend requests
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      // Determine if this is a query that should go to the Research AI
      const apiUrl = process.env.NEXT_PUBLIC_RESEARCH_API_URL;

      console.log(`Routing all queries to Research AI: ${apiUrl}`);

      const requestBody = { query };

      console.log("Sending request to:", apiUrl, "Body:", requestBody);

      const res = await fetch(apiUrl || "", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      let data;
      try {
        data = await res.json();
      } catch (e) {
        data = {};
      }

      if (!res.ok) {
        console.error("API Error Response:", data);
        throw new Error(data.message || data.error || data.detail?.[0]?.msg || data.detail || `API error: ${res.status}`);
      }

      let textResponse = data.reply || data.response || "I didn't understand that.";
      let recommendations = undefined;

      // Handle Research AI response parsing
      if (data.response) {
        try {
          const parsed = typeof data.response === "string" ? JSON.parse(data.response) : data.response;

          if (parsed?.recommendations?.length) {
            // 🔥 Try multiple categories to fetch real details using IDs
            const detailedResults = await Promise.all(
              parsed.recommendations.map(async (rec: any) => {
                const categories = [
                  "food",
                  "shop",
                  "place",
                  "accommodation",
                  "activity",
                  "transport",
                  "hiddenGem",
                  "nearbySpot",
                  "connectivity"
                ];

                let shopData: any = null;

                for (const cat of categories) {
                  try {
                    const shopRes = await fetch(
                      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/city/${currentCity}/${cat}/${rec._id}`,
                      {
                        method: "GET",
                        headers: {
                          ...(token ? { Authorization: `Bearer ${token}` } : {}),
                          "Content-Type": "application/json",
                        },
                      }
                    );

                    if (!shopRes.ok) continue;

                    const data = await shopRes.json();

                    if (data?.success && data?.data) {
                      const shop = data.data;

                      // Normalize images/photos fields
                      const images =
                        shop.images?.map((img: any) =>
                          typeof img === "string" ? img : img?.url
                        ) ||
                        shop.photos?.map((img: any) =>
                          typeof img === "string" ? img : img?.url
                        ) ||
                        [];

                      shopData = {
                        ...shop,
                        images,
                        lat: shop.lat ? parseFloat(shop.lat) : undefined,
                        lon: shop.lon ? parseFloat(shop.lon) : undefined,
                        category: cat,
                        aiReason: rec.reason,
                      };

                      break; // Found the correct category
                    }
                  } catch (err) {
                    console.error("Category fetch failed:", cat, err);
                  }
                }

                if (shopData) {
                  return shopData;
                }

                // Fallback: If no category fetch succeeded, use original AI data
                console.warn(`Detail fetch failed for ${rec._id} in all categories. Using fallback.`);
                return {
                  ...rec,
                  lat: rec.lat ? parseFloat(rec.lat) : undefined,
                  lon: rec.lon ? parseFloat(rec.lon) : undefined,
                  category: "Place", // Default fallback category
                  aiReason: rec.reason,
                  name: rec.shops || rec.name,
                };
              })
            );

            recommendations = detailedResults.filter(Boolean);
            textResponse = "Here are some recommendations for you:";
          }
        } catch (e) {
          console.error("Failed to parse research recommendations:", e);
        }
      }

      // If tool use map is detected, trigger onMapRequest
      if (data.type === 'tool_use' && data.tool === 'map' && onMapRequest) {
          onMapRequest(data.params);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: textResponse,
          recommendations,
          cityName: currentCity
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
          <AIBotMessage key={idx} message={msg} onMapRequest={onMapRequest} />
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
