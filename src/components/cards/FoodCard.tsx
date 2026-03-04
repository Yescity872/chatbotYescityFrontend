// import { FaFlag } from "react-icons/fa";
// import { BaseCardProps, CardBase } from "./shared/CardBase";
// import { InfoRow } from "./shared/InfoRow";
// import WishlistButton from "@/components/wishlist/WishlistButton"; // ✅ import

// // components/chatbot/cards/FoodCard.tsx
// const FoodCard: React.FC<BaseCardProps & {showImage?: boolean}>= ({ data, imageSrc, onImageError, category , showImage=true}) => {
//   const food = data as any;
  
//   return (
//     <CardBase imageSrc={imageSrc} onImageError={onImageError} category={category} premium={data.premium} showImage={showImage}>
//       {/* ✅ Wishlist Button */}
//       {food._id && food.cityName && (
//         <WishlistButton
//           onModel="Food"   // ✅ Corrected
//           parentRef={food._id}
//           cityName={food.cityName}
//         />
//       )}

//       <div className="space-y-2 md:space-y-4">
//         <div className="flex items-start justify-between">
//           <div className="flex items-center gap-2 flex-1">
//             <h3 className="font-bold text-sm md:text-lg text-gray-900 leading-tight line-clamp-1">
//               {food.foodPlace}
//             </h3>
//           </div>
          
//           <div className="flex gap-2 ml-2">
//             {food.vegOrNonVeg && (
//               <div className="flex items-center justify-center min-w-[20px] min-h-[20px] md:min-w-[24px] md:min-h-[24px]">
//                 {food.vegOrNonVeg.toLowerCase() === "veg" ? (
//                   <img 
//                     src="/images/veg.webp" 
//                     alt="Vegetarian indicator" 
//                     className="w-6 h-6 md:w-8 md:h-8 object-contain flex-shrink-0"
//                   />
//                 ) : (
//                   <img 
//                     src="/images/nonveg.webp" 
//                     alt="Non-Vegetarian indicator" 
//                     className="w-6 h-6 md:w-8 md:h-8 object-contain flex-shrink-0"
//                   />
//                 )}
//               </div>
//             )}
//             {food.flagship && (
//               <div className="flex items-center justify-center px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-sm">
//                 <FaFlag className="w-3 h-3 md:w-4 md:h-4 text-white" />
//               </div>
//             )}
//           </div>
//         </div>
        
//         <div className="bg-gradient-to-r from-orange-50 to-red-50 p-2 rounded-lg">
//           <InfoRow 
//             icon="" 
//             label="Menu Special" 
//             value={food.menuSpecial} 
//           />
//         </div>
        
//         {food.cuisine && (
//           <InfoRow 
//             icon="" 
//             label="Cuisine" 
//             value={food.cuisine} 
//           />
//         )}
        
//         {food.priceRange && (
//           <InfoRow 
//             icon="" 
//             label="Price Range" 
//             value={food.priceRange} 
//           />
//         )}
//       </div>
//     </CardBase>
//   );
// };

// export default FoodCard;

import { FaFlag } from "react-icons/fa";
import { BaseCardProps, CardBase } from "./shared/CardBase";
import { InfoRow } from "./shared/InfoRow";
import WishlistButton from "@/components/wishlist/WishlistButton"; // ✅ import

// components/chatbot/cards/FoodCard.tsx
const FoodCard: React.FC<BaseCardProps & {showImage?: boolean}>= ({ data, imageSrc, onImageError, category , showImage=true, isSelected}) => {
  const food = data as any;
  
  return (
    <CardBase imageSrc={imageSrc} onImageError={onImageError} category={category} premium={data.premium} showImage={showImage} isSelected={isSelected} imageOverlay={
      <div className="absolute bottom-2 right-2 z-10 flex items-center gap-2">
         {/* Veg/Non-Veg Indicator */}
         {food.vegOrNonVeg && (
            <div className="bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-gray-100 flex items-center gap-1.5">
              {/* Symbol (Dot) */}
              <div className={`w-2 h-2 rounded-full ${
                food.vegOrNonVeg.toLowerCase() === 'veg' ? 'bg-green-600' : 'bg-red-600'
              }`} />
              {/* Text */}
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                food.vegOrNonVeg.toLowerCase() === 'veg' ? 'text-green-700' : 'text-red-700'
              }`}>
                {food.vegOrNonVeg.toLowerCase() === 'veg' ? 'Veg' : 'Non Veg'}
              </span>
            </div>
         )}
         
      </div>
    }>
      
      <div className="space-y-1">
        <h3 className={`font-bold text-sm md:text-base leading-tight line-clamp-1 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
          {food.foodPlace}
        </h3>

       <div
  className={`px-3 py-2 rounded-lg space-y-1
    ${isSelected ? "bg-white/10" : "bg-blue-50"}
  `}
>
  {/* Heading */}
  <p
    className={`text-[11px] md:text-xs font-semibold
      ${isSelected ? "text-blue-100" : "text-blue-900"}
    `}
  >
    Specialities
  </p>

  {/* Description */}
  <p
    className={`text-[11px] md:text-xs leading-snug
      ${isSelected ? "text-blue-50/90" : "text-gray-600"}
      line-clamp-2 break-words
    `}
  >
    {food.description || food.menuSpecial || "No details available"}
  </p>
</div>


      </div>
    </CardBase>
  );
};

export default FoodCard;
