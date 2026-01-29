"use client";

import { useState, useEffect } from "react";
import { Coffee, Users, Shuffle, Mail, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface User {
  id: string;
  name: string;
  email: string;
  department: string | null;
  jobTitle: string | null;
  createdAt: string;
  interests: Array<{ interest: { name: string } }>;
}

interface Match {
  id: string;
  score: number | null;
  matchReason: string | null;
  emailSent: boolean;
  createdAt: string;
  user1: { id: string; name: string; email: string; department: string | null };
  user2: { id: string; name: string; email: string; department: string | null };
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [unsentCount, setUnsentCount] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [isRunningMatch, setIsRunningMatch] = useState(false);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [lastMatchResult, setLastMatchResult] = useState<{
    matchesCreated: number;
    matches: Array<{ user1: string; user2: string; score: number }>;
  } | null>(null);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchMatches = async () => {
    setIsLoadingMatches(true);
    try {
      const res = await fetch("/api/matches");
      const data = await res.json();
      setMatches(data.matches || []);
      setUnsentCount(data.unsentCount || 0);
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchMatches();
  }, []);

  const runMatching = async () => {
    setIsRunningMatch(true);
    setLastMatchResult(null);
    try {
      const res = await fetch("/api/matches", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setLastMatchResult({
          matchesCreated: data.matchesCreated,
          matches: data.matches,
        });
        fetchMatches();
      }
    } catch (error) {
      console.error("Failed to run matching:", error);
    } finally {
      setIsRunningMatch(false);
    }
  };

  const sendEmails = async () => {
    setIsSendingEmails(true);
    try {
      const res = await fetch("/api/send-emails", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert(`Sent ${data.emailsSent} emails!`);
        fetchMatches();
      } else {
        alert(data.error || "Failed to send emails");
      }
    } catch (error) {
      console.error("Failed to send emails:", error);
      alert("Failed to send emails");
    } finally {
      setIsSendingEmails(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="h-6 w-6 text-amber-600" />
            <span className="font-semibold text-gray-900">
              Coffee Chat Admin
            </span>
          </div>
          <a href="/" className="text-sm text-gray-600 hover:text-gray-900">
            View Public Page
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {users.length}
                </p>
                <p className="text-sm text-gray-500">Registered Users</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Shuffle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {matches.length}
                </p>
                <p className="text-sm text-gray-500">Total Matches</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{unsentCount}</p>
                <p className="text-sm text-gray-500">Pending Emails</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg p-6 border shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={runMatching}
              disabled={isRunningMatch || users.length < 2}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isRunningMatch ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Shuffle className="mr-2 h-4 w-4" />
                  Run Matching
                </>
              )}
            </Button>

            <Button
              onClick={sendEmails}
              disabled={isSendingEmails || unsentCount === 0}
              variant="outline"
            >
              {isSendingEmails ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Emails ({unsentCount})
                </>
              )}
            </Button>

            <Button
              onClick={() => {
                fetchUsers();
                fetchMatches();
              }}
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {lastMatchResult && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="font-medium text-green-800">
                Created {lastMatchResult.matchesCreated} new matches!
              </p>
              {lastMatchResult.matches.length > 0 && (
                <ul className="mt-2 text-sm text-green-700">
                  {lastMatchResult.matches.map((m, i) => (
                    <li key={i}>
                      {m.user1} + {m.user2} (score: {m.score})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {users.length < 2 && (
            <p className="mt-4 text-sm text-gray-500">
              Need at least 2 users to run matching.
            </p>
          )}
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg border shadow-sm mb-8">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Users</h2>
            {isLoadingUsers && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
          <div className="divide-y">
            {users.length === 0 && !isLoadingUsers ? (
              <p className="p-4 text-gray-500 text-center">No users yet</p>
            ) : (
              users.map((user) => (
                <div key={user.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      {(user.department || user.jobTitle) && (
                        <p className="text-sm text-gray-500">
                          {[user.jobTitle, user.department]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {format(new Date(user.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  {user.interests.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {user.interests.slice(0, 5).map((i, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {i.interest.name}
                        </span>
                      ))}
                      {user.interests.length > 5 && (
                        <span className="text-xs text-gray-400">
                          +{user.interests.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Matches List */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Matches
            </h2>
            {isLoadingMatches && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
          <div className="divide-y">
            {matches.length === 0 && !isLoadingMatches ? (
              <p className="p-4 text-gray-500 text-center">No matches yet</p>
            ) : (
              matches.map((match) => (
                <div key={match.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {match.user1.name}
                      </span>
                      <span className="text-gray-400">+</span>
                      <span className="font-medium text-gray-900">
                        {match.user2.name}
                      </span>
                      {match.score && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          Score: {match.score}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          match.emailSent
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        )}
                      >
                        {match.emailSent ? "Email Sent" : "Pending"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(match.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                  {match.matchReason && (
                    <p className="mt-1 text-xs text-gray-500">
                      {match.matchReason}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
