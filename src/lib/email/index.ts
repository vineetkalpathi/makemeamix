import nodemailer from "nodemailer";
import type { MixSubmission } from "@/lib/storage/types";
import { buildHtmlEmail, buildTextEmail, submissionLabel } from "./templates/submission";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendSubmissionEmail(
  submission: MixSubmission,
  submissionId: string
): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.SMTP_NOTIFY_EMAIL,
    subject: `New mix request from ${submission.name} [${submissionLabel(submissionId)}]`,
    text: buildTextEmail(submission, submissionId),
    html: buildHtmlEmail(submission, submissionId),
  });
}
