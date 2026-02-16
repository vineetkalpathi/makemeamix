export interface SongComponent {
  id: string;
  youtubeUrl: string;
  startTime: number;
  endTime: number;
  isExpanded: boolean;
  showWaveform: boolean;
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
