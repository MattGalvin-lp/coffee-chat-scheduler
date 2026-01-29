import { Coffee, Users, Mail, Calendar } from "lucide-react";
import { SignupForm } from "@/components/signup-form";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2">
          <Coffee className="h-6 w-6 text-amber-600" />
          <span className="font-semibold text-gray-900">Coffee Chat</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Connect with coworkers over coffee
          </h1>
          <p className="text-lg text-gray-600">
            Sign up to be matched with colleagues for casual 1:1 conversations.
            Build relationships, share ideas, and strengthen your team.
          </p>
        </div>

        {/* How it works */}
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
              <Users className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">1. Sign Up</h3>
            <p className="text-sm text-gray-600">
              Share your interests and department so we can find great matches
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
              <Mail className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">2. Get Matched</h3>
            <p className="text-sm text-gray-600">
              Receive an email with your match and their contact info
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">3. Meet Up</h3>
            <p className="text-sm text-gray-600">
              Schedule a 15-30 min chat and get to know each other
            </p>
          </div>
        </div>

        {/* Signup Form */}
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border p-6 md:p-8">
          <SignupForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          Coffee Chat Scheduler - Building connections one cup at a time
        </div>
      </footer>
    </div>
  );
}
