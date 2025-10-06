import nodemailer from "nodemailer";
import { env } from "@/env";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    const clientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;
    const refreshToken = env.NEXT_PUBLIC_GOOGLE_REFRESH_TOKEN;
    const accessToken = env.NEXT_PUBLIC_GOOGLE_ACCESS_TOKEN;
    const user = env.NEXT_PUBLIC_GOOGLE_USER;

    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user,
        clientId,
        clientSecret,
        refreshToken,
        // accessToken,
      },
    });
  }
  return transporter;
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const transport = getTransporter();
  const from = env.NEXT_PUBLIC_GOOGLE_USER;
  console.log({ from, to, subject, text, html });

  await transport.sendMail({
    from: `Sanjana <${from}>`,
    to,
    subject,
    text,
    html,
  });
}
