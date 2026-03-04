'use client';

import { useState, useEffect } from 'react';
import WishlistItem from '@/components/wishlist/WishlistItem';
import { CategoryType } from '@/constants/categories';

interface WishlistItemType {
  _id: string;
  cityName: string;
  parentRef: string;
  onModel: CategoryType;
  data: any;
}

interface ApiResponse {
  success: boolean;
  wishlist: WishlistItemType[];
}

interface CategoryWishlistProps {
  cityName: string;
  category: CategoryType | 'all';
}

export default function CategoryWishlistComponent({ cityName, category }: CategoryWishlistProps) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchWishlistItems();
  }, [cityName, category]);

  const fetchWishlistItems = async () => {
    try {
      setLoading(true);

      const apiUrl =
        category === 'all'
          ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/wishlist/${encodeURIComponent(cityName)}`
          : `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/wishlist/${encodeURIComponent(cityName)}/${category}`;

      const token = localStorage.getItem("token"); // 🔑 get token

      const res = await fetch(apiUrl, {
        method: 'GET', // ✅ explicitly GET
        credentials: 'include', // ✅ send cookies
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error('Failed to fetch wishlist items');

      const data: ApiResponse = await res.json();
      if (data.success) {
        setWishlistItems(data.wishlist);
      } else {
        setError('Failed to load wishlist items');
      }
    } catch (err) {
      setError('Error fetching wishlist items');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (
    itemId: string,
    onModel: string,
    parentRef: string,
    cityName: string
  ) => {
    try {
      const token = localStorage.getItem("token"); // 🔑 get token

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/wishlist`, {
        method: 'DELETE', // ✅ explicitly DELETE
        credentials: 'include', // ✅ send cookies
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ onModel, parentRef, cityName }),
      });

      if (res.ok) {
        setWishlistItems((prev) => prev.filter((item) => item._id !== itemId));
      } else {
        const errText = await res.text();
        throw new Error(`Failed to remove item: ${errText}`);
      }
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Failed to remove item from wishlist');
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );

  if (error) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[50vh] px-4">
        <p className="text-center text-red-600 text-sm sm:text-base">{error}</p>
        <button
          onClick={fetchWishlistItems}
          className="mt-4 px-4 py-2 bg-[#1E88E5] text-white text-sm sm:text-base rounded-md hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6">
      {wishlistItems.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="text-4xl sm:text-6xl mb-3">
            {category === 'all' ? '💝' : '📂'}
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
            {category === 'all' ? 'No items in wishlist' : `No ${category} items`}
          </h3>
          <p className="text-sm sm:text-base text-gray-500">
            {category === 'all'
              ? `No wishlist items found for ${cityName}`
              : `No ${category} items found in your ${cityName} wishlist`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {wishlistItems.map((item) => (
            <a
              key={item._id}
              href={`/city/${encodeURIComponent(cityName)}/${encodeURIComponent(item.onModel)}/${encodeURIComponent(item.parentRef)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <WishlistItem {...item} onRemove={handleRemoveItem} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
