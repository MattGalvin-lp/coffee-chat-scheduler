import { prisma } from "./prisma";

interface MatchingConfig {
  crossDepartmentBonus: number;
  sharedInterestWeight: number;
  neverMetBonus: number;
  recentMatchPenaltyDays: number;
  recentMatchPenalty: number;
  minScore: number;
}

const DEFAULT_CONFIG: MatchingConfig = {
  crossDepartmentBonus: 20,
  sharedInterestWeight: 5,
  neverMetBonus: 30,
  recentMatchPenaltyDays: 60,
  recentMatchPenalty: 50,
  minScore: 10,
};

interface MatchCandidate {
  userId: string;
  score: number;
  reasons: string[];
}

interface UserWithInterests {
  id: string;
  name: string;
  email: string;
  department: string | null;
  interests: { interestId: string; interest: { name: string } }[];
}

/**
 * Finds potential matches for a user based on scoring criteria
 */
async function findMatchCandidates(
  user: UserWithInterests,
  allUsers: UserWithInterests[],
  pastMatchUserIds: Set<string>,
  recentMatchUserIds: Set<string>,
  config: MatchingConfig = DEFAULT_CONFIG
): Promise<MatchCandidate[]> {
  const userInterestIds = new Set(user.interests.map((i) => i.interestId));

  const candidates: MatchCandidate[] = allUsers
    .filter((candidate) => candidate.id !== user.id)
    .map((candidate) => {
      let score = 0;
      const reasons: string[] = [];

      // Cross-department bonus
      if (
        user.department &&
        candidate.department &&
        user.department !== candidate.department
      ) {
        score += config.crossDepartmentBonus;
        reasons.push(`Different department (${candidate.department})`);
      }

      // Shared interests
      const sharedInterests = candidate.interests.filter((i) =>
        userInterestIds.has(i.interestId)
      );
      if (sharedInterests.length > 0) {
        score += sharedInterests.length * config.sharedInterestWeight;
        const interestNames = sharedInterests
          .map((i) => i.interest.name)
          .slice(0, 3);
        reasons.push(`Shared interests: ${interestNames.join(", ")}`);
      }

      // Never met bonus
      if (!pastMatchUserIds.has(candidate.id)) {
        score += config.neverMetBonus;
        reasons.push("Haven't connected before");
      }

      // Recent match penalty
      if (recentMatchUserIds.has(candidate.id)) {
        score -= config.recentMatchPenalty;
        reasons.push("Recently matched (penalty applied)");
      }

      return { userId: candidate.id, score, reasons };
    })
    .filter((c) => c.score >= config.minScore)
    .sort((a, b) => b.score - a.score);

  return candidates;
}

/**
 * Runs the matching algorithm for all active users
 * Returns the number of matches created
 */
export async function runMatchingRound(
  config: MatchingConfig = DEFAULT_CONFIG
): Promise<{ matchesCreated: number; matches: Array<{ user1: string; user2: string; score: number; reason: string }> }> {
  // Get all active users with their interests
  const users = await prisma.user.findMany({
    where: { isActive: true },
    include: {
      interests: {
        include: {
          interest: true,
        },
      },
    },
  });

  if (users.length < 2) {
    return { matchesCreated: 0, matches: [] };
  }

  // Get past matches to avoid repetition
  const pastMatches = await prisma.match.findMany({
    select: { user1Id: true, user2Id: true, createdAt: true },
  });

  // Build lookup for past and recent matches
  const recentCutoff = new Date(
    Date.now() - config.recentMatchPenaltyDays * 24 * 60 * 60 * 1000
  );

  const userPastMatches = new Map<string, Set<string>>();
  const userRecentMatches = new Map<string, Set<string>>();

  for (const match of pastMatches) {
    // User1's matches
    if (!userPastMatches.has(match.user1Id)) {
      userPastMatches.set(match.user1Id, new Set());
    }
    userPastMatches.get(match.user1Id)!.add(match.user2Id);

    // User2's matches
    if (!userPastMatches.has(match.user2Id)) {
      userPastMatches.set(match.user2Id, new Set());
    }
    userPastMatches.get(match.user2Id)!.add(match.user1Id);

    // Recent matches
    if (match.createdAt > recentCutoff) {
      if (!userRecentMatches.has(match.user1Id)) {
        userRecentMatches.set(match.user1Id, new Set());
      }
      userRecentMatches.get(match.user1Id)!.add(match.user2Id);

      if (!userRecentMatches.has(match.user2Id)) {
        userRecentMatches.set(match.user2Id, new Set());
      }
      userRecentMatches.get(match.user2Id)!.add(match.user1Id);
    }
  }

  // Build score matrix for all pairs
  const allPairs: Array<{
    user1Id: string;
    user2Id: string;
    score: number;
    reason: string;
  }> = [];

  for (let i = 0; i < users.length; i++) {
    const user1 = users[i];
    const pastMatches1 = userPastMatches.get(user1.id) || new Set();
    const recentMatches1 = userRecentMatches.get(user1.id) || new Set();

    for (let j = i + 1; j < users.length; j++) {
      const user2 = users[j];

      // Calculate combined score from both perspectives
      const candidates1 = await findMatchCandidates(
        user1,
        [user2],
        pastMatches1,
        recentMatches1,
        config
      );

      const pastMatches2 = userPastMatches.get(user2.id) || new Set();
      const recentMatches2 = userRecentMatches.get(user2.id) || new Set();

      const candidates2 = await findMatchCandidates(
        user2,
        [user1],
        pastMatches2,
        recentMatches2,
        config
      );

      if (candidates1.length > 0 && candidates2.length > 0) {
        const combinedScore = candidates1[0].score + candidates2[0].score;
        const allReasons = [
          ...new Set([...candidates1[0].reasons, ...candidates2[0].reasons]),
        ];

        allPairs.push({
          user1Id: user1.id,
          user2Id: user2.id,
          score: combinedScore,
          reason: allReasons.join("; "),
        });
      }
    }
  }

  // Sort by combined score descending
  allPairs.sort((a, b) => b.score - a.score);

  // Greedy matching - each user can only be matched once per round
  const matched = new Set<string>();
  const newMatches: Array<{
    user1Id: string;
    user2Id: string;
    score: number;
    matchReason: string;
  }> = [];

  for (const pair of allPairs) {
    if (!matched.has(pair.user1Id) && !matched.has(pair.user2Id)) {
      newMatches.push({
        user1Id: pair.user1Id,
        user2Id: pair.user2Id,
        score: pair.score,
        matchReason: pair.reason,
      });
      matched.add(pair.user1Id);
      matched.add(pair.user2Id);
    }
  }

  // Create match records in database
  if (newMatches.length > 0) {
    await prisma.match.createMany({
      data: newMatches,
    });
  }

  // Get user names for the response
  const userMap = new Map(users.map((u) => [u.id, u.name]));
  const matchesWithNames = newMatches.map((m) => ({
    user1: userMap.get(m.user1Id) || m.user1Id,
    user2: userMap.get(m.user2Id) || m.user2Id,
    score: m.score,
    reason: m.matchReason,
  }));

  return { matchesCreated: newMatches.length, matches: matchesWithNames };
}

/**
 * Gets recent matches that haven't had emails sent yet
 */
export async function getUnsentMatches() {
  return prisma.match.findMany({
    where: { emailSent: false },
    include: {
      user1: {
        include: {
          interests: {
            include: { interest: true },
          },
        },
      },
      user2: {
        include: {
          interests: {
            include: { interest: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Marks matches as having had emails sent
 */
export async function markMatchesAsSent(matchIds: string[]) {
  return prisma.match.updateMany({
    where: { id: { in: matchIds } },
    data: { emailSent: true },
  });
}
