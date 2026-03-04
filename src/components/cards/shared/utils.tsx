export const getBadgeColor = (type: string) => {
  const colors = {
    flagship: 'bg-gradient-to-r from-amber-400 to-orange-400 text-white',
    premium: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white',
    free: 'bg-gradient-to-r from-green-400 to-emerald-400 text-white',
    veg: 'bg-gradient-to-r from-green-400 to-green-500 text-white',
    nonveg: 'bg-gradient-to-r from-red-400 to-red-500 text-white',
    default: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
  };
  return colors[type as keyof typeof colors] || colors.default;
};