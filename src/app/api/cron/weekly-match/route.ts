import { NextRequest, NextResponse } from "next/server";
import { runMatchingRound } from "@/lib/matching-algorithm";
import { getUnsentMatches, markMatchesAsSent } from "@/lib/matching-algorithm";
import { generateMatchEmail, sendEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron (in production)
  if (process.env.NODE_ENV === "production") {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // Step 1: Run matching algorithm
    const matchResult = await runMatchingRound();
    console.log(`Created ${matchResult.matchesCreated} matches`);

    // Step 2: Send emails for all unsent matches
    const unsentMatches = await getUnsentMatches();
    let emailsSent = 0;
    const matchIdsToMark: string[] = [];

    for (const match of unsentMatches) {
      // Find shared interests
      const user1InterestIds = new Set(
        match.user1.interests.map((i) => i.interestId)
      );
      const sharedInterests = match.user2.interests
        .filter((i) => user1InterestIds.has(i.interestId))
        .map((i) => i.interest.name);

      // Email to user1 about user2
      const email1 = generateMatchEmail({
        recipientName: match.user1.name,
        recipientEmail: match.user1.email,
        matchName: match.user2.name,
        matchEmail: match.user2.email,
        matchDepartment: match.user2.department,
        matchJobTitle: match.user2.jobTitle,
        sharedInterests,
      });
      const result1 = await sendEmail(
        match.user1.email,
        email1.subject,
        email1.text,
        email1.html
      );

      // Email to user2 about user1
      const email2 = generateMatchEmail({
        recipientName: match.user2.name,
        recipientEmail: match.user2.email,
        matchName: match.user1.name,
        matchEmail: match.user1.email,
        matchDepartment: match.user1.department,
        matchJobTitle: match.user1.jobTitle,
        sharedInterests,
      });
      const result2 = await sendEmail(
        match.user2.email,
        email2.subject,
        email2.text,
        email2.html
      );

      if (result1.success && result2.success) {
        emailsSent += 2;
        matchIdsToMark.push(match.id);
      }
    }

    // Mark emails as sent
    if (matchIdsToMark.length > 0) {
      await markMatchesAsSent(matchIdsToMark);
    }

    return NextResponse.json({
      success: true,
      matchesCreated: matchResult.matchesCreated,
      emailsSent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Weekly match cron failed:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: String(error) },
      { status: 500 }
    );
  }
}
