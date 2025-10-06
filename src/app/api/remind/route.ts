import type { NextRequest } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email, amount, billName } = await req.json();

  try {
    await sendEmail({
      to: email,
      subject: `Reminder to settle: ${billName}`,
      text: `You have an outstanding amount of $${Number(amount).toFixed(2)} for "${billName}".`,
      html: `<p>You have an outstanding amount of <strong>$${Number(amount).toFixed(
        2
      )}</strong> for "${billName}".</p><p>Please settle up when you can!</p>`,
    });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("[v0] Email send error:", error);
    return new Response(JSON.stringify({ error: "Failed to send email" }), { status: 500 });
  }
}
