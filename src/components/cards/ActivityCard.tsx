'use client';

import { BaseCardProps, CardBase } from "./shared/CardBase";
import { InfoRow } from "./shared/InfoRow";
import WishlistButton from "@/components/wishlist/WishlistButton";

// components/chatbot/cards/ActivityCard.tsx
const ActivityCard: React.FC<BaseCardProps & { showImage?: boolean }> = ({ 
  data, 
  imageSrc, 
  onImageError, 
  category,
  showImage = true
}) => {
  const activity = data as any;
  
  return (
    <CardBase 
      imageSrc={imageSrc} 
      onImageError={onImageError} 
      category={category} 
      premium={data.premium}
      showImage={showImage}
    >
      {/* ✅ Wishlist Button */}
      {activity._id && activity.cityName && (
        <WishlistButton
          onModel="Activity"
          parentRef={activity._id}
          cityName={activity.cityName}
        />
      )}

      <div className="space-y-2 md:space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-2 md:p-4 rounded-lg">
          <p className="text-gray-800 font-medium text-xs md:text-md leading-relaxed line-clamp-3">
            {activity.topActivities}
          </p>
        </div>
        
        {activity.duration && (
          <InfoRow 
            icon="⏰" 
            label="Duration" 
            value={activity.duration} 
          />
        )}
        {activity.difficulty && (
          <InfoRow 
            icon="📊" 
            label="Difficulty Level" 
            value={activity.difficulty} 
          />
        )}
      </div>
    </CardBase>
  );
};

export default ActivityCard;
