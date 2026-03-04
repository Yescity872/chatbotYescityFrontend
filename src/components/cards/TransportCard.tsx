import { BaseCardProps, CardBase } from "./shared/CardBase";
import { InfoRow } from "./shared/InfoRow";

type TransportData = {
  from: string;
  to: string;
  duration?: string;
  fare?: string;
  premium?: boolean;
};

const TransportCard: React.FC<BaseCardProps & { data: TransportData; showImage?: boolean }> = ({
  data,
  imageSrc,
  onImageError,
  category,
  showImage = true, // ✅ added consistency
}) => {
  const transport = data;

  return (
    <CardBase
      imageSrc={imageSrc}
      onImageError={onImageError}
      category={category}
      premium={data.premium}
      showImage={false}
    >
      <div className="space-y-3 p-0 md:p-4">
        {/* Header */}
        <h3 className="text-sm md:text-lg font-semibold text-gray-900">
          Transport Details
        </h3>

        {/* Route */}
        <div className="flex flex-col md:flex-row justify-between items-center border rounded-lg p-2 bg-gray-50">
          <div className="text-left">
            <p className="text-xs md:text-sm uppercase text-gray-500 font-medium">From</p>
            <p className="text-xs md:text-sm font-semibold text-gray-900">{transport.from}</p>
          </div>

          <span className="mx-2 text-gray-400">.</span>

          <div className="text-right">
            <p className="text-xs md:text-sm uppercase text-gray-500 font-medium">To</p>
            <p className="text-xs md:text-sm font-semibold text-gray-900">{transport.to}</p>
          </div>
        </div>

        {/* Extra Info */}
        {transport.duration &&(
        <div className="space-y-2">
          {transport.duration && (
            <InfoRow icon="⏱️" label="Duration" value={transport.duration} />
          )}
          {transport.fare && (
            <InfoRow icon="💰" label="Fare" value={transport.fare} />
          )}
        </div>)}
      </div>
    </CardBase>
  );
};

export default TransportCard;
