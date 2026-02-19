import DataCard from "@/components/chatbot/DataCard";

export default function CardRenderer({
  category,
  items,
}: {
  category: string;
  items: any[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
      {items.map((item) => (
        <DataCard
          key={item._id}
          data={item}
          category={category}
        />
      ))}
    </div>
  );
}
