import { ComponentType } from 'react';

interface PlacesSidebarProps {
    selectedCategory?: string;
    cityName: string;
    isNearbyMode?: boolean;
    radius?: number;
    searchQuery?: string;
    selectedItemId?: string | null;
    onCardClick?: (id: string, coords: { lat: number; lon: number }) => void;
}

declare const PlacesSidebar: ComponentType<PlacesSidebarProps>;
export default PlacesSidebar;
