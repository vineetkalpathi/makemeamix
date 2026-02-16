import { google } from "googleapis";
import type {
  StorageProvider,
  MixSubmission,
  MixSong,
  StoredSubmission,
} from "./types";

const SHEET_NAME = "Submissions";

// Columns: submission_id | timestamp | name | email | purpose | song_number | youtube_url | start_time | end_time | song_notes | transition_notes
const COL = {
  SUBMISSION_ID: 0,
  TIMESTAMP: 1,
  NAME: 2,
  EMAIL: 3,
  PURPOSE: 4,
  SONG_NUMBER: 5,
  YOUTUBE_URL: 6,
  START_TIME: 7,
  END_TIME: 8,
  SONG_NOTES: 9,
  TRANSITION_NOTES: 10,
} as const;

function formatSeconds(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  if (h > 0) {
    return `${h}:${mm}:${ss}`;
  }
  return `${m}:${ss}`;
}

function parseSeconds(timeStr: string): number {
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return parts[0] * 60 + parts[1];
}

export class GoogleSheetsProvider implements StorageProvider {
  private getSheets() {
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set");
    }

    let credentials: object;
    try {
      credentials = JSON.parse(serviceAccountJson);
    } catch {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON");
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    return google.sheets({ version: "v4", auth });
  }

  private getSpreadsheetId(): string {
    const id = process.env.GOOGLE_SPREADSHEET_ID;
    if (!id) {
      throw new Error("GOOGLE_SPREADSHEET_ID environment variable is not set");
    }
    return id;
  }

  async saveSubmission(data: MixSubmission): Promise<string> {
    const submissionId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const spreadsheetId = this.getSpreadsheetId();
    const sheets = this.getSheets();

    const rows = data.songs.map((song: MixSong, i: number) => [
      submissionId,
      timestamp,
      data.name,
      data.email,
      data.purpose,
      i + 1,
      song.youtubeUrl,
      formatSeconds(song.startTime),
      formatSeconds(song.endTime),
      song.songNotes,
      song.transitionNotes,
    ]);

    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${SHEET_NAME}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: rows },
      });
    } catch (err) {
      throw new Error(
        `Failed to save submission to Google Sheets: ${err instanceof Error ? err.message : String(err)}`
      );
    }

    return submissionId;
  }

  async getSubmission(submissionId: string): Promise<StoredSubmission | null> {
    const spreadsheetId = this.getSpreadsheetId();
    const sheets = this.getSheets();

    let rows: string[][];
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${SHEET_NAME}`,
      });
      rows = (response.data.values ?? []) as string[][];
    } catch (err) {
      throw new Error(
        `Failed to read from Google Sheets: ${err instanceof Error ? err.message : String(err)}`
      );
    }

    // Skip header row (row 0)
    const matchingRows = rows
      .slice(1)
      .filter((row) => row[COL.SUBMISSION_ID] === submissionId);

    if (matchingRows.length === 0) {
      return null;
    }

    return rowsToStoredSubmission(matchingRows);
  }

  async listSubmissions(): Promise<StoredSubmission[]> {
    const spreadsheetId = this.getSpreadsheetId();
    const sheets = this.getSheets();

    let rows: string[][];
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${SHEET_NAME}`,
      });
      rows = (response.data.values ?? []) as string[][];
    } catch (err) {
      throw new Error(
        `Failed to read from Google Sheets: ${err instanceof Error ? err.message : String(err)}`
      );
    }

    // Skip header row, group by submission_id
    const dataRows = rows.slice(1).filter((row) => row[COL.SUBMISSION_ID]);
    const grouped = new Map<string, string[][]>();
    for (const row of dataRows) {
      const id = row[COL.SUBMISSION_ID];
      if (!grouped.has(id)) {
        grouped.set(id, []);
      }
      grouped.get(id)!.push(row);
    }

    const submissions: StoredSubmission[] = [];
    for (const rowGroup of grouped.values()) {
      submissions.push(rowsToStoredSubmission(rowGroup));
    }

    submissions.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    return submissions;
  }
}

function rowsToStoredSubmission(rows: string[][]): StoredSubmission {
  const first = rows[0];
  const songs: MixSong[] = rows
    .sort((a, b) => Number(a[COL.SONG_NUMBER]) - Number(b[COL.SONG_NUMBER]))
    .map((row) => ({
      youtubeUrl: row[COL.YOUTUBE_URL] ?? "",
      startTime: parseSeconds(row[COL.START_TIME] ?? "0:00"),
      endTime: parseSeconds(row[COL.END_TIME] ?? "0:00"),
      songNotes: row[COL.SONG_NOTES] ?? "",
      transitionNotes: row[COL.TRANSITION_NOTES] ?? "",
    }));

  return {
    submissionId: first[COL.SUBMISSION_ID],
    timestamp: new Date(first[COL.TIMESTAMP]),
    name: first[COL.NAME],
    email: first[COL.EMAIL],
    purpose: first[COL.PURPOSE],
    songs,
  };
}
