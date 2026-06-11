import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Mail, FileText, ListChecks, ShieldCheck, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI KenWork AI for the Modern Workplace" },
      {
        name: "description",
        content:
          "Draft professional emails, summarize meeting notes, and plan your day with an AI assistant built for workplace productivity.",
      },
      { property: "og:title", content: "AI KenWork AI" },
      {
        property: "og:description",
        content: "Email drafting, meeting summaries, and smart task planning — powered by AI.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-rainbow-bg text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-5 w-5 text-rainbow" />
            KenWork AI
          </div>
          <nav className="flex items-center gap-3">
            <Link
              to="/auth"
              className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              to="/auth"
              className="text-sm bg-rainbow text-white shadow-md hover:opacity-90 transition px-4 py-2 rounded-md font-medium"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-rainbow bg-rainbow-soft px-3 py-1 rounded-full">
            AI for the modern workplace
          </div>
          <h1 className="mt-6 text-5xl md:text-6xl font-bold tracking-tight text-slate-900 max-w-3xl mx-auto">
            Spend less time on busywork. Ship more of what matters.
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
            Draft professional emails, summarize meetings into clear action items, and plan
            your day in seconds — all in one assistant designed for working professionals.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 bg-rainbow text-white shadow-md hover:opacity-90 transition px-6 py-3 rounded-md font-medium"
            >
              Try it free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="px-6 py-3 text-slate-700 hover:text-slate-900 font-medium"
            >
              See features
            </a>
          </div>
        </section>

        <section id="features" className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Mail,
              title: "Smart Email Generator",
              desc: "Compose context-aware professional emails with tone and audience controls.",
            },
            {
              icon: FileText,
              title: "Meeting Notes Summarizer",
              desc: "Turn raw notes into concise summaries, decisions, action items, and deadlines.",
            },
            {
              icon: ListChecks,
              title: "AI Task Planner",
              desc: "Generate a prioritized, time-blocked daily plan from your task list and goals.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-sm transition"
            >
              <div className="h-10 w-10 rounded-md bg-rainbow-soft text-rainbow flex items-center justify-center">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </section>

        <section className="border-t border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-6 py-12 flex items-start gap-4">
            <ShieldCheck className="h-6 w-6 text-rainbow mt-1" />
            <div>
              <h2 className="font-semibold text-slate-900">Responsible AI by design</h2>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Every output includes a clear AI-generated disclaimer. Review before sending or
                committing. Your data is stored privately to your account and never shared.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-rainbow-bg">
        <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-slate-500 flex justify-between">
          <span>© {new Date().getFullYear()} KenWork AI</span>
          <span>AI-powered • Built for ASA 6</span>
        </div>
      </footer>
    </div>
  );
}
