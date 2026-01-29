interface MatchEmailData {
  recipientName: string;
  recipientEmail: string;
  matchName: string;
  matchEmail: string;
  matchDepartment: string | null;
  matchJobTitle: string | null;
  sharedInterests: string[];
}

/**
 * Generate the email content for a coffee chat match
 */
export function generateMatchEmail(data: MatchEmailData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `You've been matched for a coffee chat with ${data.matchName}!`;

  const sharedInterestsText =
    data.sharedInterests.length > 0
      ? `\n\nShared interests: ${data.sharedInterests.join(", ")}`
      : "";

  const roleText = [data.matchJobTitle, data.matchDepartment]
    .filter(Boolean)
    .join(" in ");

  const text = `Hi ${data.recipientName},

Great news! You've been matched with ${data.matchName} for a coffee chat!

About ${data.matchName}:
${roleText ? `- Role: ${roleText}` : ""}
- Email: ${data.matchEmail}${sharedInterestsText}

Reach out to ${data.matchName} to schedule a quick 15-30 minute chat. It's a great way to connect and learn from each other!

Happy chatting!

---
Coffee Chat Scheduler
Building connections one cup at a time`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
    <h1 style="margin: 0; color: #92400e; font-size: 24px;">☕ Coffee Chat Match!</h1>
  </div>

  <p style="font-size: 16px;">Hi <strong>${data.recipientName}</strong>,</p>

  <p style="font-size: 16px;">Great news! You've been matched with <strong>${data.matchName}</strong> for a coffee chat!</p>

  <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0;">
    <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #1f2937;">About ${data.matchName}</h2>
    ${roleText ? `<p style="margin: 4px 0; color: #4b5563;"><strong>Role:</strong> ${roleText}</p>` : ""}
    <p style="margin: 4px 0; color: #4b5563;"><strong>Email:</strong> <a href="mailto:${data.matchEmail}" style="color: #d97706;">${data.matchEmail}</a></p>
    ${data.sharedInterests.length > 0 ? `<p style="margin: 12px 0 4px 0; color: #4b5563;"><strong>Shared interests:</strong></p><p style="margin: 4px 0; color: #6b7280;">${data.sharedInterests.join(", ")}</p>` : ""}
  </div>

  <p style="font-size: 16px;">Reach out to <strong>${data.matchName}</strong> to schedule a quick 15-30 minute chat. It's a great way to connect and learn from each other!</p>

  <div style="text-align: center; margin-top: 32px;">
    <a href="mailto:${data.matchEmail}?subject=Coffee%20Chat?" style="display: inline-block; background: #d97706; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">Email ${data.matchName}</a>
  </div>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

  <p style="font-size: 12px; color: #9ca3af; text-align: center;">
    Coffee Chat Scheduler - Building connections one cup at a time
  </p>
</body>
</html>`;

  return { subject, text, html };
}

/**
 * Send an email (placeholder - implement with your preferred email service)
 *
 * To use Resend:
 * 1. npm install resend
 * 2. Set RESEND_API_KEY in .env
 * 3. Uncomment the Resend implementation below
 */
export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  // For development: just log the email
  if (process.env.NODE_ENV === "development" && !process.env.RESEND_API_KEY) {
    console.log("=== EMAIL (DEV MODE) ===");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Text:", text.substring(0, 200) + "...");
    console.log("========================");
    return { success: true };
  }

  // Resend implementation (uncomment and install resend package to use)
  /*
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Coffee Chat <noreply@example.com>',
      to,
      subject,
      text,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: String(error) };
  }
  */

  // Fallback: log warning
  console.warn("Email service not configured. Set RESEND_API_KEY to enable emails.");
  console.log("Would send email to:", to);
  return { success: true };
}
