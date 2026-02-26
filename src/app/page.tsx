import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { ArrowRight, ShieldCheck, Zap, Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-12 bg-background text-foreground overflow-hidden">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-semibold border border-primary/10 mb-4 tracking-tight">
          <Zap className="w-3 h-3 fill-primary" />
          <span>Next Generation Support Infrastructure</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter max-w-4xl leading-[1.1]">
          Support that feels like <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent italic">Magic.</span>
        </h1>

        <p className="mt-4 text-xl sm:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
          The professional ticketing engine for YLN teams. Built for speed, precision, and complete clarity.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="lg" className="rounded-full px-8 h-12 text-base font-semibold group shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-95">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button size="lg" className="rounded-full px-8 h-12 text-base font-semibold group shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-95">
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </SignedIn>

          <Link href="/tickets/new">
            <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-base font-semibold hover:bg-zinc-50 border-zinc-200 text-zinc-600 shadow-sm transition-all active:scale-95">
              Submit a Request
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-24 w-full max-w-5xl text-left">
          <div className="p-6 rounded-3xl border border-yln-navy/5 bg-card/50 backdrop-blur-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-yln-navy/10 flex items-center justify-center text-yln-navy">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Secure Access</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Enterprise-grade role management keeping your internal data private and protected.</p>
          </div>

          <div className="p-6 rounded-3xl border border-zinc-100 bg-white/50 backdrop-blur-sm space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Real-time Tracing</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Track every ticket from submission to resolution with instant live updates and status alerts.</p>
          </div>

          <div className="p-6 rounded-3xl border border-zinc-100 bg-white/50 backdrop-blur-sm space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Intelligent Routing</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Automatic assignment to the right department, cutting down response times by over 40%.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
