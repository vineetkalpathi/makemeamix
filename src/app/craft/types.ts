export interface SongComponent {
  id: string;
  youtubeUrl: string;
  title: string;
  startTime: number;
  endTime: number;
  duration: number;
  notes: string;
}

export interface TransitionNote {
  id: string;
  content: string;
}

export interface SubmitMixState {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
  submissionId?: string;
}
