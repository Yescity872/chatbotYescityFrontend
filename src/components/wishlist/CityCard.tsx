import { useRouter } from "next/navigation";

interface CityCardProps {
  _id: string;
  cityName: string;
  coverImage: string;
  content: string;
}

export default function CityCard({
  _id,
  cityName,
  coverImage: coverImage,
  content,
}: CityCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/wishlist/${encodeURIComponent(cityName)}`);
  };

  return (
    <div
      onClick={handleClick}
      className="relative w-full h-56 sm:h-60 md:h-64 lg:h-72 rounded-2xl 
                 overflow-hidden shadow-lg cursor-pointer 
                 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group"
    >
      {/* Background Image */}
      <img
        src={coverImage}
        alt={cityName}
        className="absolute inset-0 w-full h-full object-cover 
                   transform group-hover:scale-105 
                   transition-transform duration-700 ease-out"
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 text-white">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold drop-shadow-sm tracking-wide">
          {cityName}
        </h3>
        <p className="mt-1 text-xs sm:text-sm md:text-base text-gray-200 line-clamp-3">
          {content}
        </p>
      </div>
    </div>
  );
}
