'use client';

import React from 'react';
import { CardBase, BaseCardProps } from './shared/CardBase';
import { InfoRow } from './shared/InfoRow';
import { getBadgeColor } from './shared/utils';
import WishlistButton from '@/components/wishlist/WishlistButton';
import { FaFlag } from 'react-icons/fa';

const AccommodationCard: React.FC<BaseCardProps & { showImage?: boolean }> = ({ 
  data, 
  imageSrc, 
  onImageError, 
  category,
  showImage = true,
  isSelected
}) => {
  const accommodation = data as any;
  
  return (
    <CardBase 
      imageSrc={imageSrc} 
      onImageError={onImageError} 
      category={category} 
      premium={data.premium}
      showImage={showImage}
      isSelected={isSelected}
    >
      {/* Wishlist Button */}
      {accommodation._id && accommodation.cityName && (
        <WishlistButton
          onModel="Accommodation"
          parentRef={accommodation._id}
          cityName={accommodation.cityName}
        />
      )}

      <div className="space-y-1">
        <h3 className={`font-bold text-sm md:text-base leading-tight line-clamp-1 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
          {accommodation.hotels}
        </h3>

        <p className={`text-[11px] md:text-xs line-clamp-1 ${isSelected ? 'text-blue-50' : 'text-gray-600'}`}>
          {accommodation.description || accommodation.roomTypes}
        </p>
      </div>
    </CardBase>
  );
};

export default AccommodationCard;