// types/index.ts

export interface AccommodationData {
  _id: string;
  cityName: string;
  flagship: boolean;
  hotels: string;
  roomTypes: string;
  images: string[];
  premium: string;
}

export interface ActivityData {
  _id: string;
  cityName: string;
  topActivities: string;
  images: string[];
  premium: string;
}

export interface CityInfoData {
  _id: string;
  cityName: string;
  stateOrUT: string;
  alternateNames: string;
  coverImage: string;
  premium: string;
}

export interface ConnectivityData {
  _id: string;
  cityName: string;
  nearestAirportStationBusStand: string;
  distance: string;
  travelTime?: string;
  premium: string;
}

export interface FoodData {
  _id: string;
  cityName: string;
  flagship: boolean;
  foodPlace: string;
  vegOrNonVeg: string;
  menuSpecial: string;
  images: string[];
  premium: string;
  valueForMoney?: number;
  service?: number;
  taste?: number;
  hygiene?: number;
  menuLink?: string;
  openDay?: string;
  openTime?: string;
  phone?: string;
  website?: string;
  description?: string;
  videos?: string[];
  [key: string]: unknown;
}

export interface HiddenGemData {
  _id: string;
  cityName: string;
  hiddenGem: string;
  images: string[];
  premium: string;
}

export interface ItineraryData {
  _id: string;
  cityName: string;
  day1: string;
  day2: string;
  day3: string;
  premium: string;
}

export interface MiscData {
  _id: string;
  cityName: string;
  hospital: string;
  Police: string;
  parking: string;
  publicWashrooms: string;
  locker: string;
  premium: string;
}

export interface NearbySpotData {
  _id: string;
  cityName: string;
  places: string;
  description: string;
  images: string[];
  premium: string;
}

export interface PlaceData {
  _id: string;
  cityName: string;
  places: string;
  establishYear: string;
  description: string;
  images: string[];
  premium: string;
}

export interface ShopData {
  _id: string;
  cityName: string;
  flagship: boolean;
  shops: string;
  famousFor: string;
  images: string[];
  premium: string;
  priceRange?: string;
  openDay?: string;
  openTime?: string;
  phone?: string;
  website?: string;
  description?: string;
  [key: string]: unknown;
}

export interface TransportData {
  _id: string;
  cityName: string;
  from: string;
  to: string;
  premium: string;
}

export type CategoryData = 
  | AccommodationData 
  | ActivityData 
  | CityInfoData 
  | ConnectivityData 
  | FoodData 
  | HiddenGemData 
  | ItineraryData 
  | MiscData 
  | NearbySpotData 
  | PlaceData 
  | ShopData 
  | TransportData;

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse {
  data: CategoryData[];
  pagination: PaginationInfo;
}

export interface ChatMessage {
  id: string;
  type: 'category' | 'data' | 'user' | 'cityinfo' | 'rag';
  content: string;
  data?: CategoryData[];
  category?: string;
  timestamp: Date;
  pagination?: PaginationInfo;
}

export type CategoryType = 
  | 'Accommodation'
  | 'Activity' 
  | 'CityInfo'
  | 'Connectivity'
  | 'Food'
  | 'HiddenGem'
  | 'Itinerary'
  | 'Misc'
  | 'NearbySpot'
  | 'Place'
  | 'Shop'
  | 'Transport';

export const CATEGORIES: CategoryType[] = [
  'Accommodation',
  'Activity',
  'Connectivity',
  'Food',
  'HiddenGem',
  // 'Itinerary',
  'Misc',
  'NearbySpot',
  'Place',
  'Shop',
  'Transport'
];

export const CATEGORIES_WITHOUT_IMAGES = [
  'Connectivity',
  'Itinerary', 
  'Misc',
  'Transport',
  // 'CityInfo'
];

export const DEFAULT_IMAGE = "https://i.pinimg.com/736x/57/00/c0/5700c04197ee9a4372a35ef16eb78f4e.jpg";