import CardRenderer from "./renderers/CardRenderer";
import MapRenderer from "./renderers/MapRenderer";
import TextRenderer from "./renderers/TextRenderer";

export default function AIBotMessage({ message }: any) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm sm:text-base shadow-lg ${
          isUser
            ? "bg-blue-600/90 text-white border border-blue-400/30"
            : "bg-white/10 backdrop-blur-md text-white border border-white/20"
        }`}
      >
        <p>{message.text}</p>

        {message.data?.type === "text" && (
          <TextRenderer text={message.data.text} />
        )}

        {message.data?.type === "cards" && (
          <CardRenderer
            category={message.data.category}
            items={message.data.items}
          />
        )}

        {message.data?.type === "map" && (
          <MapRenderer map={message.data.map} />
        )}
      </div>
    </div>
  );
}
