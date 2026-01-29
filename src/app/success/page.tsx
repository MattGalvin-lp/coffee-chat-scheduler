import Link from "next/link";
import { Coffee, CheckCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2">
          <Coffee className="h-6 w-6 text-amber-600" />
          <span className="font-semibold text-gray-900">Coffee Chat</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            You&apos;re all set!
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            Thanks for signing up for Coffee Chats. We&apos;ll email you when
            you&apos;ve been matched with a coworker.
          </p>

          <div className="bg-amber-50 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center gap-2 text-amber-800 mb-2">
              <Mail className="h-5 w-5" />
              <span className="font-medium">What happens next?</span>
            </div>
            <p className="text-sm text-amber-700">
              When matches are made, you&apos;ll receive an email with your
              match&apos;s name, email, department, and shared interests. Reach
              out to them to schedule your coffee chat!
            </p>
          </div>

          <Link href="/">
            <Button variant="outline" className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
