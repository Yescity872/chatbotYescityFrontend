import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/MapComponent.jsx"), {
  ssr: false,
});

export default function MapRenderer({ map }: any) {
  return (
    <div className="h-64 mt-3 rounded-xl overflow-hidden">
      <Map
        cityName=""
        selectedItemId=""
        onMarkerClick={() => {}}
        focusCoords={map.center}
        markers={map.markers}
      />
    </div>
  );
}
