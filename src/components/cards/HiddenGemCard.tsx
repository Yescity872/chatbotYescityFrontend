import { BaseCardProps, CardBase } from "./shared/CardBase";
import { InfoRow } from "./shared/InfoRow";
import WishlistButton from "@/components/wishlist/WishlistButton";

type HiddenGemData = {
  hiddenGem: string;
  location?: string;
  premium?: boolean;
  _id?: string;
  cityName?: string;
};

const HiddenGemCard: React.FC<BaseCardProps & { data: HiddenGemData; showImage?: boolean }> = ({
  data,
  imageSrc,
  onImageError,
  category,
  showImage = true
}) => {
  const hiddenGem = data;

  return (
    <CardBase
      imageSrc={imageSrc}
      onImageError={onImageError}
      category={category}
      premium={data.premium}
      showImage={showImage}
    >
      {/* ✅ Wishlist Button */}
      {hiddenGem._id && hiddenGem.cityName && (
        <WishlistButton
          onModel="HiddenGem"
          parentRef={hiddenGem._id}
          cityName={hiddenGem.cityName}
        />
      )}

      <div className="space-y-2 md:space-y-4">
        {/* Highlight box */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-2 md:p-4 rounded-lg border-l-4 border-purple-400">
          <p className="text-gray-800 leading-relaxed font-medium text-xs md:text-md">
            {hiddenGem.hiddenGem}
          </p>
        </div>

        {/* Optional location */}
        {hiddenGem.location && (
          <InfoRow icon="📍" label="Location" value={hiddenGem.location} />
        )}
      </div>
    </CardBase>
  );
};

export default HiddenGemCard;
