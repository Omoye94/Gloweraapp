export type Mood = 'radiant' | 'calm' | 'neutral' | 'low' | 'struggling';

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO timestamp
  updatedAt: string;
  content: string;
  mood?: Mood;
  promptUsed?: string;
  tags?: string[];
}

export interface ReflectionPrompt {
  id: string;
  text: string;
  category: 'weekly' | 'daily' | 'challenge';
}

// Mood display info
export const MOOD_INFO: Record<Mood, { emoji: string; label: string; color: string }> = {
  radiant: { emoji: '✨', label: 'Radiant', color: '#FFD699' },
  calm: { emoji: '🌸', label: 'Calm', color: '#C9ADFF' },
  neutral: { emoji: '🌿', label: 'Neutral', color: '#66EFC7' },
  low: { emoji: '🌧️', label: 'Low', color: '#99D6FF' },
  struggling: { emoji: '💜', label: 'Need Support', color: '#DBC9FF' },
};
