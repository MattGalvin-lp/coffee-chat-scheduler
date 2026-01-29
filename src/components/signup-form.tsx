"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Coffee, Loader2, Check } from "lucide-react";

interface Interest {
  id: string;
  name: string;
  category: string | null;
}

interface GroupedInterests {
  [category: string]: Interest[];
}

const categoryLabels: Record<string, string> = {
  hobbies: "Hobbies",
  sports: "Sports & Fitness",
  tech: "Tech",
  professional: "Professional Development",
  lifestyle: "Lifestyle",
  other: "Other",
};

export function SignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interests, setInterests] = useState<GroupedInterests>({});
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(
    new Set()
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    jobTitle: "",
  });

  useEffect(() => {
    fetch("/api/interests")
      .then((res) => res.json())
      .then((data) => setInterests(data.grouped || {}))
      .catch(console.error);
  }, []);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          interestIds: Array.from(selectedInterests),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      router.push("/success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Tell us about yourself
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              placeholder="e.g., Engineering"
              value={formData.department}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, department: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              placeholder="e.g., Software Engineer"
              value={formData.jobTitle}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, jobTitle: e.target.value }))
              }
            />
          </div>
        </div>
      </div>

      {/* Interests */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            What are you interested in?
          </h2>
          <p className="text-sm text-gray-500">
            Select at least one interest to help us find better matches
          </p>
        </div>

        <div className="space-y-6">
          {Object.entries(interests).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                {categoryLabels[category] || category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {items.map((interest) => {
                  const isSelected = selectedInterests.has(interest.id);
                  return (
                    <button
                      key={interest.id}
                      type="button"
                      onClick={() => toggleInterest(interest.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                        isSelected
                          ? "bg-amber-100 text-amber-800 border-2 border-amber-400"
                          : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
                      )}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                      {interest.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        disabled={isLoading || selectedInterests.size === 0}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing up...
          </>
        ) : (
          <>
            <Coffee className="mr-2 h-4 w-4" />
            Sign me up for Coffee Chats
          </>
        )}
      </Button>

      <p className="text-xs text-center text-gray-500">
        By signing up, you agree to be matched with coworkers for casual
        conversations. You can opt out at any time.
      </p>
    </form>
  );
}
