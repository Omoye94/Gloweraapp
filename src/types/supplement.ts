// Supplement Types for Glowera

export type SupplementCategory =
  | 'vitamins'
  | 'minerals'
  | 'omega-fatty-acids'
  | 'probiotics'
  | 'herbal'
  | 'specialty';

export type WellnessGoal =
  | 'energy'
  | 'sleep'
  | 'immunity'
  | 'digestion'
  | 'skin-health'
  | 'stress-relief'
  | 'focus'
  | 'general-wellness';

export type SupplementTiming =
  | 'morning'
  | 'evening'
  | 'with-food'
  | 'any';

// Catalog item - represents a supplement in the library
export interface SupplementInfo {
  id: string;
  name: string;
  icon: string;
  category: SupplementCategory;
  description: string;
  benefits: string[];
  typicalDosage: string;
  timing: SupplementTiming;
  tags: WellnessGoal[];
}

// Metadata attached to a Habit when it's a supplement
export interface SupplementMetadata {
  supplementInfoId?: string;  // Links to catalog item
  dosage?: string;            // User's custom dosage
  timingPreference?: string;  // When user prefers to take it
  notes?: string;             // Any additional notes
  checkInRating?: 'positive' | 'neutral' | 'negative';
  checkInNote?: string;
  checkInCompletedAt?: string; // ISO timestamp
}

// User's wellness goal preference
export interface WellnessGoalInfo {
  id: WellnessGoal;
  name: string;
  icon: string;
  description: string;
}
