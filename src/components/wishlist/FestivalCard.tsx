// components/wishlist/FestivalCard.tsx
'use client';

import Link from 'next/link';
import { MapPin, Calendar } from 'lucide-react';

interface Festival {
  _id: string;
  name: string;
  city: string;
  state: string;
  category: string;
  media: {
    images: string[];
  };
  premium: string;
}

interface FestivalCardProps {
  festival: Festival;
}

const FestivalCard: React.FC<FestivalCardProps> = ({ festival }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Cultural': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'Religious': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Music': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Food': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Link href={`/festivals/${festival._id}`}>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-gray-200">
        {/* Image Section */}
        <div className="relative h-48">
          <img
            src={festival.media?.images?.[0] || '/images/festival-placeholder.jpg'}
            alt={festival.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          
          {/* Premium Badge */}
          {festival.premium === 'PAID' && (
            <div className="absolute top-3 right-3 bg-yellow-400 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              Premium
            </div>
          )}
          
          {/* Category Badge */}
          <div className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(festival.category)}`}>
            {festival.category}
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-5">
          <h3 className="font-bold text-xl text-gray-800 mb-3 line-clamp-2 leading-tight">
            {festival.name}
          </h3>
          
          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="text-sm">{festival.city}, {festival.state}</span>
            </div>
            
            {/* Additional info can go here */}
            <div className="flex items-center text-gray-500">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm">Festival</span>
            </div>
          </div>
          
          {/* Action Button */}
          {/* <div className="mt-4 pt-3 border-t border-gray-100">
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors duration-200">
              View Details
            </button>
          </div> */}
        </div>
      </div>
    </Link>
  );
};

export default FestivalCard;