import { BaseCardProps, CardBase } from "./shared/CardBase";
import { InfoRow } from "./shared/InfoRow";
import WishlistButton from "@/components/wishlist/WishlistButton";

type PlaceData = {
  places: string;
  establishYear?: string;
  description: string;
  category?: string;
  premium?: boolean;
  _id?: string;
  cityName?: string;
};

const PlaceCard: React.FC<BaseCardProps & { data: PlaceData; showImage?: boolean }> = ({
  data,
  imageSrc,
  onImageError,
  category,
  showImage = true,
  isSelected
}) => {
  const place = data;

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
      {place._id && place.cityName && (
        <WishlistButton
          onModel="Place"
          parentRef={place._id}
          cityName={place.cityName}
        />
      )}

      <div className="space-y-1">
        {/* Header */}
        <h3 className={`font-bold text-sm md:text-base leading-tight line-clamp-1 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
          {place.places}
        </h3>

        {/* Description */}
        <p className={`text-[11px] md:text-xs line-clamp-2 ${isSelected ? 'text-blue-50' : 'text-gray-600'}`}>
          {place.description}
        </p>
      </div>
    </CardBase>
  );
};

export default PlaceCard;
