import { ComponentType } from 'react';

interface MapComponentProps {
    selectedCategory?: string;
    cityName: string;
    isNearbyMode?: boolean;
    radius?: number;
    selectedItemId?: string | null;
    focusCoords?: { lat: number; lon: number } | null;
    onMarkerClick?: (id: string, coords: { lat: number; lon: number }) => void;
    isWishlistMode?: boolean;
    searchQuery?: string;
}

declare const MapComponent: ComponentType<MapComponentProps>;
export default MapComponent;
