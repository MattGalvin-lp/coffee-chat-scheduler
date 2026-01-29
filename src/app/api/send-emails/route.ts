import { NextResponse } from "next/server";
import {
  getUnsentMatches,
  markMatchesAsSent,
} from "@/lib/matching-algorithm";
import { generateMatchEmail, sendEmail } from "@/lib/email";

export async function POST() {
  try {
    const unsentMatches = await getUnsentMatches();

    if (unsentMatches.length === 0) {
      return NextResponse.json({
        success: true,
        emailsSent: 0,
        message: "No pending emails to send",
      });
    }

    let emailsSent = 0;
    const matchIdsToMark: string[] = [];

    for (const match of unsentMatches) {
      // Find shared interests between the two users
      const user1InterestIds = new Set(
        match.user1.interests.map((i) => i.interestId)
      );
      const sharedInterests = match.user2.interests
        .filter((i) => user1InterestIds.has(i.interestId))
        .map((i) => i.interest.name);

      // Send email to user1 about user2
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

      // Send email to user2 about user1
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

    // Mark matches as having had emails sent
    if (matchIdsToMark.length > 0) {
      await markMatchesAsSent(matchIdsToMark);
    }

    return NextResponse.json({
      success: true,
      emailsSent,
      matchesProcessed: matchIdsToMark.length,
    });
  } catch (error) {
    console.error("Failed to send emails:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send emails" },
      { status: 500 }
    );
  }
}
