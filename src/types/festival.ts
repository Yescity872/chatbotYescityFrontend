// Festival types
export interface Festival {
  _id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  date: string;
  duration_days: number;
  category: string;
  about: string;
  importance: string;
  locations: FestivalLocation[];
  budget_estimate: BudgetEstimate;
  travel_tips: string;
  best_experience_time: string;
  media: FestivalMedia;
  engagement: {
    views: number;
  };
  premium: string;
  createdAt: string;
  updatedAt: string;
}

export interface FestivalLocation {
  name: string;
  events: string;
  events_description: string;
  timing: string;
}

export interface BudgetEstimate {
  local_visitor: string;
  traveller_from_other_city: string;
  foreigner: string;
}

export interface FestivalMedia {
  images: string[];
  videos: {
    full_video: string;
    short_video: string;
    drone_clip: string;
  };
}
