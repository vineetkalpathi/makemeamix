"use server";

import type { SubmitMixState, SongComponent, TransitionNote } from "./types";
import { getStorageProvider } from "@/lib/storage";
import { buildMixSubmission } from "@/lib/storage/types";

export async function submitMix(
  previousState: SubmitMixState,
  formData: FormData
): Promise<SubmitMixState> {
  const name = formData.get("name") as string | null;
  const email = formData.get("email") as string | null;
  const reason = formData.get("reason") as string | null;
  const songsJson = formData.get("songs") as string | null;
  const transitionsJson = formData.get("transitions") as string | null;

  const errors: Record<string, string> = {};

  if (!name?.trim()) {
    errors.name = "Name is required.";
  }
  if (!email?.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!reason?.trim()) {
    errors.reason = "Please tell us the reason for the mix.";
  }

  let songs: SongComponent[] = [];
  let transitions: TransitionNote[] = [];

  try {
    songs = songsJson ? JSON.parse(songsJson) : [];
  } catch {
    errors.songs = "Invalid song data.";
  }

  try {
    transitions = transitionsJson ? JSON.parse(transitionsJson) : [];
  } catch {
    errors.transitions = "Invalid transition data.";
  }

  if (songs.length === 0) {
    errors.songs = "Please add at least one song.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, message: "Please fix the errors below.", errors };
  }

  const storage = getStorageProvider();
  const submission = buildMixSubmission({
    name: name!,
    email: email!,
    reason: reason!,
    songs,
    transitions,
  });

  try {
    const submissionId = await storage.saveSubmission(submission);
    return { success: true, message: "Your mix has been submitted!", submissionId };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to save submission.";
    return { success: false, message };
  }
}
