"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegistrationForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; age?: string; email?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [existingUser, setExistingUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("wwe_quiz_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.name) {
          setExistingUser(parsed);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  function validate() {
    const errs: { name?: string; age?: string; email?: string } = {};
    if (!name.trim()) errs.name = "Name is required";
    else if (name.trim().length < 2) errs.name = "Name must be at least 2 characters";

    const ageNum = Number(age);
    if (!age.trim()) errs.age = "Age is required";
    else if (isNaN(ageNum) || ageNum < 5 || ageNum > 120) errs.age = "Enter a valid age (5–120)";

    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Enter a valid email address";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const userData = {
      name: name.trim(),
      age: Number(age),
      email: email.trim().toLowerCase(),
      registeredAt: new Date().toISOString(),
    };
    localStorage.setItem("wwe_quiz_user", JSON.stringify(userData));

    // Brief animation delay before redirect
    setTimeout(() => {
      router.push("/quiz");
    }, 400);
  }

  if (existingUser) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Welcome Back</p>
          <p className="mt-1 text-xl font-bold text-amber-300">🥊 {existingUser.name}</p>
          <p className="mt-0.5 text-xs text-white/40">{existingUser.email}</p>
        </div>
        <button
          onClick={() => router.push("/quiz")}
          className="w-full rounded-xl border border-red-500/30 bg-gradient-to-r from-red-600/80 to-amber-600/80 px-5 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-500/20 transition-all duration-300 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98] hover:from-red-500/90 hover:to-amber-500/90"
        >
          🏆 Enter the Ring
        </button>
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("wwe_quiz_user");
              setExistingUser(null);
            }}
            className="text-xs text-white/40 hover:text-white/80 transition-colors underline underline-offset-4"
          >
            Register as a different Challenger
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name Field */}
      <div className="space-y-1.5">
        <label htmlFor="reg-name" className="block text-xs font-semibold uppercase tracking-wider text-white/50">
          Your Name
        </label>
        <input
          id="reg-name"
          type="text"
          placeholder="e.g. John Cena"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full rounded-xl border bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/25 outline-none backdrop-blur-sm transition-all duration-300 focus:bg-white/[0.07] ${
            errors.name
              ? "border-red-500/50 focus:border-red-500/70 focus:ring-1 focus:ring-red-500/30"
              : "border-white/[0.08] focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20"
          }`}
        />
        {errors.name && <p className="text-[11px] text-red-400 pl-1">{errors.name}</p>}
      </div>

      {/* Age Field */}
      <div className="space-y-1.5">
        <label htmlFor="reg-age" className="block text-xs font-semibold uppercase tracking-wider text-white/50">
          Your Age
        </label>
        <input
          id="reg-age"
          type="number"
          placeholder="e.g. 21"
          min="5"
          max="120"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className={`w-full rounded-xl border bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/25 outline-none backdrop-blur-sm transition-all duration-300 focus:bg-white/[0.07] ${
            errors.age
              ? "border-red-500/50 focus:border-red-500/70 focus:ring-1 focus:ring-red-500/30"
              : "border-white/[0.08] focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20"
          }`}
        />
        {errors.age && <p className="text-[11px] text-red-400 pl-1">{errors.age}</p>}
      </div>

      {/* Email Field */}
      <div className="space-y-1.5">
        <label htmlFor="reg-email" className="block text-xs font-semibold uppercase tracking-wider text-white/50">
          Email Address
        </label>
        <input
          id="reg-email"
          type="email"
          placeholder="e.g. champion@wwe.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full rounded-xl border bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/25 outline-none backdrop-blur-sm transition-all duration-300 focus:bg-white/[0.07] ${
            errors.email
              ? "border-red-500/50 focus:border-red-500/70 focus:ring-1 focus:ring-red-500/30"
              : "border-white/[0.08] focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20"
          }`}
        />
        {errors.email && <p className="text-[11px] text-red-400 pl-1">{errors.email}</p>}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className={`w-full rounded-xl border border-red-500/30 bg-gradient-to-r from-red-600/80 to-amber-600/80 px-5 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-500/20 transition-all duration-300 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98] ${
          submitting ? "opacity-60 cursor-not-allowed" : "hover:from-red-500/90 hover:to-amber-500/90"
        }`}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Entering the Ring...
          </span>
        ) : (
          "🏆 Enter the Ring"
        )}
      </button>
    </form>
  );
}
