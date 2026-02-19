'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface RewardContextType {
  contributionPoints: number;
  addedPoints: number | null;
}

const RewardContext = createContext<RewardContextType | undefined>(undefined);

export function RewardProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [prevPoints, setPrevPoints] = useState<number>(0);
  const [addedPoints, setAddedPoints] = useState<number | null>(null);
  const [contributionPoints, setContributionPoints] = useState<number>(0);

  useEffect(() => {
    if (user) {
      const currentPoints = user.contributionPoints || 0;
      setContributionPoints(currentPoints);

      if (currentPoints > prevPoints && prevPoints !== 0) {
        setAddedPoints(currentPoints - prevPoints);
        const timer = setTimeout(() => setAddedPoints(null), 1500);
        return () => clearTimeout(timer);
      }

      setPrevPoints(currentPoints);
    } else {
      setContributionPoints(0);
      setPrevPoints(0);
      setAddedPoints(null);
    }
  }, [user, prevPoints]);

  return (
    <RewardContext.Provider value={{ contributionPoints, addedPoints }}>
      {children}
    </RewardContext.Provider>
  );
}

export function useRewardContext() {
  const context = useContext(RewardContext);
  if (context === undefined) {
    throw new Error('useRewardContext must be used within a RewardProvider');
  }
  return context;
}
