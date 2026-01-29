import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const interests = await prisma.interest.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    // Group by category
    const grouped = interests.reduce(
      (acc, interest) => {
        const category = interest.category || "other";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(interest);
        return acc;
      },
      {} as Record<string, typeof interests>
    );

    return NextResponse.json({ interests, grouped });
  } catch (error) {
    console.error("Failed to fetch interests:", error);
    return NextResponse.json(
      { error: "Failed to fetch interests" },
      { status: 500 }
    );
  }
}
