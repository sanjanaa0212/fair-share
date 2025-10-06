import { type NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { env } from "@/env";

export async function POST(req: NextRequest) {
  try {
    const { email: to, groupName, name: inviterName, groupId } = await req.json();
    const inviteLink = `${env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/invite?groupId=${groupId}`;

    await sendEmail({
      to,
      subject: `${inviterName} invited you to join ${groupName} on FairShare`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You've been invited to join ${groupName}!</h2>
          <p>${inviterName} has invited you to join their group on FairShare.</p>
          <p>Click the link below to accept the invitation and start tracking expenses together:</p>
          <a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; background: #0070f3; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Accept Invitation
          </a>
          <p style="color: #666; font-size: 14px;">This invitation will expire in 7 days.</p>
        </div>
      `,
      text: "",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Invite email error:", error);
    return NextResponse.json({ error: "Failed to send invite" }, { status: 500 });
  }
}
