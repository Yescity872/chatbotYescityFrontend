export const getPremiumStatus = (isPremium: string, expiryDate: string | null) => {
  if (isPremium === 'FREE')
    return { text: 'Free User', color: 'bg-blue-50 text-blue-700 border-blue-200' };
  if (isPremium === 'A')
    return { text: 'Premium Plan A', color: 'bg-blue-100 text-blue-800 border-blue-300' };
  if (isPremium === 'B')
    return { text: 'Premium Plan B', color: 'bg-blue-200 text-blue-900 border-blue-400' };
  return { text: 'Unknown', color: 'bg-gray-100 text-gray-800 border-gray-200' };
};

export const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
