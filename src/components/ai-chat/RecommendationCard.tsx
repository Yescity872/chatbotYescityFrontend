import { motion } from "framer-motion";
import { SiGooglemaps } from "react-icons/si";

interface Recommendation {
  _id: string;
  shops?: string;
  reason?: string;
  aiReason?: string;
  // Fallbacks for and varied schemas
  name?: string;
  description?: string;
  locationLink?: string;
  images?: string[];
}

export default function RecommendationCard({ 
  item, 
  onMapRequest, 
  cityName 
}: { 
  item: Recommendation; 
  onMapRequest?: (params: any) => void;
  cityName?: string;
}) {
  const name = item.shops || item.name || "Unnamed Place";
  const reason = item.aiReason || item.reason || item.description || "No description provided.";
  const imageUrl = item.images && item.images.length > 0 ? item.images[0] : null;

  // Determine icon based on keywords
  const isFood = name.toLowerCase().includes('food') || 
                 name.toLowerCase().includes('restaurant') || 
                 name.toLowerCase().includes('bakery') ||
                 reason.toLowerCase().includes('food') ||
                 reason.toLowerCase().includes('taste') ||
                 reason.toLowerCase().includes('sweets');
  
  const iconPath = isFood ? "/images/leaflet/icon-food.png" : "/images/leaflet/icon-shop.png";
  const gradientClass = isFood ? "from-orange-500/40 to-red-600/40" : "from-blue-500/40 to-purple-600/40";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-shrink-0 w-[240px] bg-white border border-gray-100 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col"
    >
      {/* Visual Header / Image Area */}
      <div className={`h-28 w-full bg-gradient-to-br ${gradientClass} flex items-center justify-center relative group`}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : null}
        <div className={`absolute inset-0 ${imageUrl ? 'bg-black/30' : 'bg-black/10'} group-hover:bg-black/20 transition-colors duration-300`} />
        
        <div className="relative z-10 p-3 bg-white/40 backdrop-blur-md rounded-full border border-white/50 transform group-hover:scale-110 transition-transform duration-300">
           <img 
            src={iconPath} 
            alt="Category" 
            className="w-8 h-8 object-contain drop-shadow-md filter brightness-110"
          />
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 space-y-2">
        <h3 className="text-gray-900 font-semibold text-lg line-clamp-2 leading-tight">
          {name}
        </h3>
        
        <p className="text-gray-600 text-sm line-clamp-4 flex-1 font-medium">
          {reason}
        </p>

        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={() => {
              if (onMapRequest && cityName) {
                onMapRequest({
                  cityName: cityName,
                  searchQuery: name,
                  category: isFood ? "Food" : "Shop"
                });
              } else {
                const mapUrl = item.locationLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
                window.open(mapUrl, "_blank");
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 border border-green-100 hover:bg-green-600 hover:text-white transition-all duration-300 text-sm font-medium"
          >
            <SiGooglemaps size={14} />
            <span>Map</span>
          </button>
          
          <span className="text-gray-400 text-xs italic">
            Recommended
          </span>
        </div>
      </div>
    </motion.div>
  );
}
