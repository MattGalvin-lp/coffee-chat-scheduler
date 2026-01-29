import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runMatchingRound, getUnsentMatches } from "@/lib/matching-algorithm";

export async function POST() {
  try {
    const result = await runMatchingRound();

    return NextResponse.json({
      success: true,
      matchesCreated: result.matchesCreated,
      matches: result.matches,
    });
  } catch (error) {
    console.error("Failed to run matching:", error);
    return NextResponse.json(
      { error: "Failed to run matching algorithm" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            jobTitle: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            jobTitle: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unsentMatches = await getUnsentMatches();

    return NextResponse.json({
      matches,
      unsentCount: unsentMatches.length,
    });
  } catch (error) {
    console.error("Failed to fetch matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}
