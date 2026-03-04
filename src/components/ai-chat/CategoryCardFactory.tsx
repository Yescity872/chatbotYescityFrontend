import React, { useState } from 'react';
import FoodCard from '../cards/FoodCard';
import AccommodationCard from '../cards/AccommodationCard';
import ShopCard from '../cards/ShopCard';
import PlaceCard from '../cards/PlaceCard';
import ActivityCard from '../cards/ActivityCard';
import HiddenGemCard from '../cards/HiddenGemCard';
import NearbySpotCard from '../cards/NearbySpotCard';
import TransportCard from '../cards/TransportCard';

interface Recommendation {
  _id: string;
  shops?: string;
  foodPlace?: string;
  hotels?: string;
  places?: string;
  topActivities?: string;
  hiddenGem?: string;
  reason?: string;
  aiReason?: string;
  category?: string;
  name?: string;
  description?: string;
  locationLink?: string;
  images?: string[];
  coverImage?: string;
  lat?: number;
  lon?: number;
  cityName?: string;
  premium?: any;
  famousFor?: string;
  specialty?: string;
  menuSpecial?: string;
  vegOrNonVeg?: string;
}

interface CategoryCardFactoryProps {
  item: Recommendation;
  onMapRequest?: (params: any) => void;
  cityName?: string;
}

const CategoryCardFactory: React.FC<CategoryCardFactoryProps> = ({ item, onMapRequest, cityName }) => {
  const [imageError, setImageError] = useState(false);

  // Normalize data for specific cards
  const rawCategory = item.category || 'shop';
  
  // Case-insensitive mapping to a standard set
  const getNormalizedCategory = (cat: string) => {
    const c = cat.toLowerCase();
    if (c === 'food') return 'Food';
    if (c === 'accommodation' || c === 'hotel') return 'Accommodation';
    if (c === 'shop' || c === 'shopping') return 'Shop';
    if (c === 'place' || c === 'attraction') return 'Place';
    if (c === 'activity') return 'Activity';
    if (c === 'hiddengem') return 'HiddenGem';
    if (c === 'nearbyspot') return 'NearbySpot';
    if (c === 'transport') return 'Transport';
    return 'Shop'; // Fallback
  };

  const category = getNormalizedCategory(rawCategory);
  const name = item.shops || 
               item.foodPlace || 
               item.hotels || 
               item.places || 
               item.topActivities || 
               item.hiddenGem || 
               item.name || 
               'Unnamed Place';
  
  // Image selection logic as per user requirement
  const getImageSrc = () => {
    if (imageError) return '/images/placeholder.webp';
    if (item.images && item.images.length > 0) return item.images[0];
    if (item.coverImage) return item.coverImage;
    return '/images/placeholder.webp';
  };

  const imageUrl = getImageSrc();

  const handleImageError = () => {
    setImageError(true);
  };

  // Base props for all cards
  const baseCardProps = {
    data: {
      ...item,
      cityName: cityName || item.cityName,
      // Fallbacks for specific fields for specialized cards
      foodPlace: item.foodPlace || item.name || item.shops,
      hotels: item.hotels || item.name,
      shops: item.shops || item.name,
      places: item.places || item.name,
      hiddenGem: item.hiddenGem || item.name,
      topActivities: item.topActivities || item.name,
      description: item.aiReason || item.reason || item.description || item.famousFor || item.specialty || item.menuSpecial,
    },
    imageSrc: imageUrl,
    onImageError: handleImageError,
    category: category,
    isSelected: false,
  };

  const renderCard = () => {
    switch (category) {
      case 'Food':
        return <FoodCard {...baseCardProps} />;
      case 'Accommodation':
        return <AccommodationCard {...baseCardProps} category="Accommodation" />;
      case 'Shop':
        return <ShopCard {...baseCardProps} data={baseCardProps.data as any} />;
      case 'Place':
        return <PlaceCard {...baseCardProps} data={baseCardProps.data as any} category="Place" />;
      case 'Activity':
        return <ActivityCard {...baseCardProps} data={baseCardProps.data as any} category="Activity" />;
      case 'HiddenGem':
        return <HiddenGemCard {...baseCardProps} data={baseCardProps.data as any} category="HiddenGem" />;
      case 'NearbySpot':
        return <NearbySpotCard {...baseCardProps} data={baseCardProps.data as any} category="NearbySpot" />;
      case 'Transport':
        return <TransportCard {...baseCardProps} data={baseCardProps.data as any} category="Transport" />;
      default:
        return <ShopCard {...baseCardProps} data={baseCardProps.data as any} category="Shop" />;
    }
  };

  return (
    <div 
        className="flex-shrink-0 w-[260px] cursor-pointer hover:scale-[1.02] transition-transform duration-300"
        onClick={() => {
            if (onMapRequest && (cityName || item.cityName)) {
              onMapRequest({
                cityName: cityName || item.cityName,
                searchQuery: name,
                category: category,
                id: item._id,
                coords: item.lat && item.lon ? { lat: item.lat, lon: item.lon } : undefined,
                markers: [{ ...item, category: category }]
              });
            } else {
              const mapUrl = item.locationLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
              window.open(mapUrl, "_blank");
            }
        }}
    >
      {renderCard()}
    </div>
  );
};

export default CategoryCardFactory;
