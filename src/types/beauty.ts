export type BeautyCategory =
  | 'skincare'
  | 'body-care'
  | 'hair-care'
  | 'gua-sha'
  | 'lip-care'
  | 'scalp-care'
  | 'shower-ritual'
  | 'custom';

export type BeautyTimeOfDay = 'morning' | 'evening' | 'anytime' | 'weekly';
export type BeautyFrequency = 'daily' | 'selected_days' | 'weekly';

export interface BeautyRitual {
  id: string;
  user_id: string;
  title: string;
  category: BeautyCategory;
  time_of_day: BeautyTimeOfDay;
  frequency: BeautyFrequency;
  selected_days?: string[];
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BeautyRitualCompletion {
  id: string;
  ritual_id: string;
  user_id: string;
  completion_date: string; // YYYY-MM-DD
  completed_at: string;
}
