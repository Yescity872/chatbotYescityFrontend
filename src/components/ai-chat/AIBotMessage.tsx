import RecommendationCard from "./RecommendationCard";

export default function AIBotMessage({ 
  message, 
  onMapRequest 
}: { 
  message: { role: string; text: string; recommendations?: any[]; cityName?: string };
  onMapRequest?: (params: any) => void;
}) {
  const isUser = message.role === "user";
  const hasRecommendations = !isUser && message.recommendations && message.recommendations.length > 0;

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-3`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm sm:text-base shadow-lg ${
          isUser
            ? "bg-blue-600/90 text-white border border-blue-400/30"
            : "bg-white/10 backdrop-blur-md text-white border border-white/20"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>

      {hasRecommendations && (
        <div className="w-full max-w-[100vw] sm:max-w-4xl overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
          <div className="flex gap-4 pr-4">
            {message.recommendations!.map((item, idx) => (
              <RecommendationCard 
                key={idx} 
                item={item} 
                onMapRequest={onMapRequest}
                cityName={message.cityName}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
