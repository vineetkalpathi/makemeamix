import type { SongComponent, TransitionNote } from "@/app/craft/types";

export interface MixSong {
  youtubeUrl: string;
  startTime: number; // seconds
  endTime: number; // seconds
  songNotes: string;
  transitionNotes: string; // empty string for last song
}

export interface MixSubmission {
  name: string;
  email: string;
  purpose: string; // mapped from form field 'reason'
  songs: MixSong[];
}

export interface StoredSubmission extends MixSubmission {
  submissionId: string;
  timestamp: Date;
}

export interface StorageProvider {
  saveSubmission(data: MixSubmission): Promise<string>; // returns submissionId
  getSubmission(submissionId: string): Promise<StoredSubmission | null>;
  listSubmissions(): Promise<StoredSubmission[]>;
}

export function buildMixSubmission(params: {
  name: string;
  email: string;
  reason: string;
  songs: SongComponent[];
  transitions: TransitionNote[];
}): MixSubmission {
  const { name, email, reason, songs, transitions } = params;

  // Build a lookup map: transition id -> content
  // Transition after song[i] has id = `transition-${songs[i+1].id}`
  const transitionMap = new Map<string, string>();
  for (const t of transitions) {
    transitionMap.set(t.id, t.content);
  }

  const mixSongs: MixSong[] = songs.map((song, i) => {
    const nextSong = songs[i + 1];
    const transitionKey = nextSong ? `transition-${nextSong.id}` : null;
    const transitionNotes =
      transitionKey && transitionMap.has(transitionKey)
        ? transitionMap.get(transitionKey)!
        : "";

    return {
      youtubeUrl: song.youtubeUrl,
      startTime: song.startTime,
      endTime: song.endTime,
      songNotes: song.notes,
      transitionNotes,
    };
  });

  return {
    name: name.trim(),
    email: email.trim(),
    purpose: reason.trim(),
    songs: mixSongs,
  };
}
