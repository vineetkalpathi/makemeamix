import type { MixSubmission } from "@/lib/storage/types";
import { formatTime, durationLabel } from "@/app/craft/utils/time";
import { trimLink } from "@/app/craft/utils/url";

// Hex equivalents of the site's light-theme CSS variables.
// oklch values (--plum, --accent-tint) are approximated since email clients don't support oklch.
const C = {
  paper:      "#f3e8d1", // --paper
  paperDeep:  "#ead9b8", // --paper-deep
  surface:    "#fbf3e1", // --surface
  ink:        "#1f1812", // --ink
  inkSoft:    "#4a3a2c", // --ink-soft
  inkMute:    "#8a755e", // --ink-mute
  hairline:   "#ddd0be", // --hairline (rgba solid approximation)
  accent:     "#7a5478", // --plum (oklch approximation)
  accentTint: "#ede1d5", // --accent-tint (9% plum mixed into --paper)
};

export function submissionLabel(id: string): string {
  return `MMX-${id.slice(0, 4).toUpperCase()}-A1`;
}

function metaCell(label: string, value: string, borderRight = false): string {
  return `
    <td style="padding:18px;${borderRight ? `border-right:1px solid ${C.hairline};` : ""}vertical-align:top;">
      <div style="font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:0.06em;color:${C.inkMute};margin-bottom:4px;">${label}</div>
      <div style="font-size:14px;color:${C.ink};word-break:break-all;">${value || "—"}</div>
    </td>`;
}

function trackRows(submission: MixSubmission): string {
  return submission.songs.map((song, i) => {
    const dur = Math.max(0, song.endTime - song.startTime);
    const trimmed = trimLink(song.youtubeUrl);

    const transitionRow = song.transitionNotes ? `
      <tr>
        <td style="padding:8px 24px 0;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="28" height="28" align="center" valign="middle"
                  style="width:28px;height:28px;border-radius:50%;border:1px dashed ${C.accent};background:${C.accentTint};color:${C.accent};font-size:13px;line-height:26px;text-align:center;">
                ✎
              </td>
              <td style="padding-left:10px;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:14px;color:${C.inkSoft};">
                ${song.transitionNotes}
              </td>
            </tr>
          </table>
        </td>
      </tr>` : "";

    return `${transitionRow}
      <tr>
        <td style="padding:8px;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%"
                 style="background:${C.paper};border:1px solid ${C.hairline};border-radius:10px;">
            <tr>
              <td width="52" style="padding:16px 0 16px 16px;" valign="top">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="36" height="36" align="center" valign="middle"
                        style="width:36px;height:36px;background:#2a1f18;border-radius:50%;color:${C.accent};font-size:16px;line-height:36px;text-align:center;">
                      ♪
                    </td>
                  </tr>
                </table>
              </td>
              <td style="padding:14px 16px 14px 8px;">
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:17px;color:${C.ink};margin-bottom:4px;">
                  <span style="font-family:ui-monospace,Menlo,monospace;font-size:10px;color:${C.accent};letter-spacing:0.16em;margin-right:10px;">TRACK ${String(i + 1).padStart(2, "0")}</span>${trimmed || "Untitled"}
                </div>
                <div style="font-family:ui-monospace,Menlo,monospace;font-size:11px;color:${C.inkMute};${song.songNotes ? "margin-bottom:4px;" : ""}">
                  <a href="${song.youtubeUrl}" style="color:${C.inkMute};text-decoration:none;">${trimmed}</a>
                  · ${formatTime(song.startTime)} — ${formatTime(song.endTime)} · ${formatTime(dur)}
                </div>
                ${song.songNotes ? `<div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:13px;color:${C.inkSoft};">"${song.songNotes}"</div>` : ""}
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
  }).join("");
}

export function buildHtmlEmail(submission: MixSubmission, submissionId: string): string {
  const label = submissionLabel(submissionId);
  const totalDuration = submission.songs.reduce(
    (acc, s) => acc + Math.max(0, s.endTime - s.startTime),
    0
  );
  const filled = submission.songs.filter((s) => s.youtubeUrl).length;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>New mix request</title>
</head>
<body style="margin:0;padding:0;background:${C.paperDeep};">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${C.paperDeep};padding:32px 16px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="600"
               style="max-width:600px;background:${C.surface};border:1px solid ${C.hairline};border-radius:16px;overflow:hidden;">

          <!-- header -->
          <tr>
            <td style="background:${C.paperDeep};padding:20px 24px;border-bottom:1px solid ${C.hairline};">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td>
                    <div style="font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:0.06em;color:${C.inkMute};margin-bottom:4px;">Cue sheet</div>
                    <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:21px;color:${C.ink};">${submission.name}&rsquo;s ${submission.purpose} &middot; side A</div>
                  </td>
                  <td align="right" valign="top">
                    <span style="font-family:ui-monospace,Menlo,monospace;font-size:10px;color:${C.inkMute};">${label}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- meta -->
          <tr>
            <td style="border-bottom:1px solid ${C.hairline};">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  ${metaCell("Name", submission.name, true)}
                  ${metaCell("Email", submission.email, true)}
                  ${metaCell("Occasion", submission.purpose)}
                </tr>
              </table>
            </td>
          </tr>

          <!-- tracks -->
          <tr>
            <td>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="padding:4px 0;">
                ${trackRows(submission)}
              </table>
            </td>
          </tr>

          <!-- footer -->
          <tr>
            <td style="background:${C.paperDeep};padding:16px 22px;border-top:1px solid ${C.hairline};">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:${C.inkMute};">
                    Run time &middot; ${durationLabel(totalDuration)} across ${filled} track${filled === 1 ? "" : "s"}
                  </td>
                  <td align="right" style="font-family:ui-monospace,Menlo,monospace;font-size:10px;color:${C.inkMute};">
                    ID &middot; ${submissionId}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildTextEmail(submission: MixSubmission, submissionId: string): string {
  const songLines = submission.songs
    .map((song, i) => {
      const lines = [
        `Song ${i + 1}`,
        `  URL: ${song.youtubeUrl}`,
        `  Clip: ${formatTime(song.startTime)} – ${formatTime(song.endTime)}`,
      ];
      if (song.songNotes) lines.push(`  Notes: ${song.songNotes}`);
      if (song.transitionNotes) lines.push(`  Transition into this song: ${song.transitionNotes}`);
      return lines.join("\n");
    })
    .join("\n\n");

  return [
    `New mix submission — ${submissionId}`,
    "",
    `Name:    ${submission.name}`,
    `Email:   ${submission.email}`,
    `Purpose: ${submission.purpose}`,
    "",
    "Songs",
    "─────",
    songLines,
  ].join("\n");
}
