import { FaFlag } from "react-icons/fa";
import { BaseCardProps, CardBase } from "./shared/CardBase";
import { InfoRow } from "./shared/InfoRow";
import { getBadgeColor } from "./shared/utils";
import WishlistButton from "@/components/wishlist/WishlistButton";

type ShopData = {
  shops: string;
  flagship?: boolean;
  famousFor: string;
  specialty?: string;
  priceRange?: string;
  premium?: boolean;
  _id?: string;
  cityName?: string;
};

const ShopCard: React.FC<BaseCardProps & { data: ShopData; showImage?: boolean }> = ({
  data,
  imageSrc,
  onImageError,
  category,
  showImage = true,
  isSelected
}) => {
  const shop = data;

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
      {shop._id && shop.cityName && (
        <WishlistButton
          onModel="Shop"
          parentRef={shop._id}
          cityName={shop.cityName}
        />
      )}

      <div className="space-y-1">
        <h3 className={`font-bold text-sm md:text-base leading-tight line-clamp-1 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
          {shop.shops}
        </h3>

        <div className={`px-2 py-1.5 rounded-lg ${isSelected ? 'bg-white/10' : 'bg-blue-50'}`}>
          <p className={`text-[11px] md:text-xs line-clamp-1 font-medium ${isSelected ? 'text-blue-50' : 'text-blue-800'}`}>
            {shop.description || shop.famousFor}
          </p>
        </div>
      </div>
    </CardBase>
  );
};

export default ShopCard;
