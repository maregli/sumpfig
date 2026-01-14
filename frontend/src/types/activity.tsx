export type ActivityType = 
  | 'track_added'
  | 'track_deleted'
  | 'track_rated'
  | 'comment_added'
  | 'user_joined_group';

export interface Activity {
  id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  groupId: string;
  trackId?: string;
  trackTitle?: string;
  rating?: number;
  comment?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}
