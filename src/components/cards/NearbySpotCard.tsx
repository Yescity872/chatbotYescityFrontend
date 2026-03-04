import { BaseCardProps, CardBase } from "./shared/CardBase";
import WishlistButton from "@/components/wishlist/WishlistButton";

type NearbySpotData = {
  places: string;
  description: string;
  distance?: string;
  premium?: boolean;
  _id?: string;
  cityName?: string;
};

const NearbySpotCard: React.FC<BaseCardProps & { data: NearbySpotData; showImage?: boolean }> = ({
  data,
  imageSrc,
  onImageError,
  category,
  showImage = true,
  isSelected
}) => {
  const nearbySpot = data;

  return (
    <CardBase
      imageSrc={imageSrc}
      onImageError={onImageError}
      category={category}
      premium={data.premium}
      showImage={showImage}
      isSelected={isSelected}
    >
      {/* ✅ Wishlist Button */}
      {nearbySpot._id && nearbySpot.cityName && (
        <WishlistButton
          onModel="NearbySpot"
          parentRef={nearbySpot._id}
          cityName={nearbySpot.cityName}
        />
      )}

      <div className="space-y-1">
        {/* Header */}
        <h3 className={`font-bold text-sm md:text-base leading-tight line-clamp-1 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
          {nearbySpot.places}
        </h3>

        {/* Description */}
        <div className={`px-2 py-1.5 rounded-lg ${isSelected ? 'bg-white/10' : 'bg-blue-50'}`}>
          <p className={`text-[11px] md:text-xs line-clamp-3 font-medium ${isSelected ? 'text-blue-50' : 'text-blue-800'}`}>
            {nearbySpot.description}
          </p>
        </div>

        {/* Distance (Optional, kept minimal underneath if needed, or remove if strict match desired) */}
        {/* Keeping strict match as per user request "same like place" - removing distance for now, or could add as small text */ }
      </div>
    </CardBase>
  );
};

export default NearbySpotCard;
