export type JourneyEventType =
  | 'habit_completed'
  | 'reflection_written'
  | 'challenge_completed'
  | 'supplement_logged'
  | 'garden_stage'
  | 'future_message'
  | 'milestone';

export interface JourneyEvent {
  id: string;
  user_id: string;
  event_type: JourneyEventType;
  title: string;
  description: string | null;
  icon: string;
  created_at: string;
}

export interface FutureMessage {
  id: string;
  user_id: string;
  message: string;
  deliver_at: string;
  delivered: boolean;
  created_at: string;
}
