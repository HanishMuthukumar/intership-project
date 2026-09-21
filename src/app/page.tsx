import InteractiveBackground from "./interactive-background";
import RegistrationForm from "./registration-form";

export default function LandingPage() {
  return (
    <>
      <InteractiveBackground />
      <main className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          {/* Hero Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
            {/* Badge */}
            <div className="mb-5 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-3.5 py-1.5 text-xs font-medium text-red-300">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 pulse-dot" />
                🏆 WWE Quiz Arena
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-2 text-center text-3xl font-bold tracking-tight gradient-text">
              Welcome, Challenger!
            </h1>
            <p className="mb-7 text-center text-sm text-white/40 leading-relaxed">
              Enter your details to step into the ring and test your WWE knowledge against the world.
            </p>

            {/* Divider */}
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Register</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* Form */}
            <RegistrationForm />

            {/* Footer */}
            <p className="mt-6 text-center text-[10px] text-white/20">
              Your info is stored locally and used only to personalize your quiz experience.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}