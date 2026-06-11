import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import {
  generateAi,
  listGenerations,
  deleteGeneration,
} from "@/lib/generations.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Sparkles,
  Mail,
  FileText,
  ListChecks,
  LogOut,
  Copy,
  Trash2,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({ meta: [{ title: "Dashboard — Productivity Assistant" }] }),
  component: Dashboard,
});

type Kind = "email" | "meeting" | "plan";

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const list = useServerFn(listGenerations);
  const del = useServerFn(deleteGeneration);

  const { data: history = [] } = useQuery({
    queryKey: ["generations"],
    queryFn: () => list(),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["generations"] });
      toast.success("Deleted");
    },
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/app" className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-5 w-5 text-blue-700" />
            Productivity Assistant
          </Link>
          <Button variant="ghost" size="sm" onClick={signOut} className="text-slate-600">
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="email">
            <TabsList className="grid grid-cols-3 w-full bg-white border border-slate-200">
              <TabsTrigger value="email"><Mail className="h-4 w-4 mr-2" />Email</TabsTrigger>
              <TabsTrigger value="meeting"><FileText className="h-4 w-4 mr-2" />Meeting</TabsTrigger>
              <TabsTrigger value="plan"><ListChecks className="h-4 w-4 mr-2" />Planner</TabsTrigger>
            </TabsList>

            <TabsContent value="email"><EmailTool /></TabsContent>
            <TabsContent value="meeting"><MeetingTool /></TabsContent>
            <TabsContent value="plan"><PlannerTool /></TabsContent>
          </Tabs>
        </div>

        <aside className="lg:col-span-1">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base text-slate-900">History</CardTitle>
              <CardDescription>Your saved generations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[70vh] overflow-y-auto">
              {history.length === 0 && (
                <p className="text-sm text-slate-500">No generations yet. Try a tool to get started.</p>
              )}
              {history.map((g) => (
                <div key={g.id} className="border border-slate-200 rounded-md p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs uppercase font-medium text-blue-700">{labelFor(g.kind as Kind)}</div>
                      <div className="font-medium truncate text-slate-900">{g.title}</div>
                      <div className="text-xs text-slate-500">{new Date(g.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" onClick={() => copy(g.output)} title="Copy">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteMut.mutate(g.id)} title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <pre className="text-xs whitespace-pre-wrap text-slate-700 mt-2 max-h-32 overflow-hidden">
                    {g.output.slice(0, 240)}
                    {g.output.length > 240 ? "…" : ""}
                  </pre>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}

function labelFor(k: Kind) {
  return k === "email" ? "Email" : k === "meeting" ? "Meeting" : "Plan";
}

function copy(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
}

function useGenerate() {
  const qc = useQueryClient();
  const gen = useServerFn(generateAi);
  return useMutation({
    mutationFn: (input: { kind: Kind; title: string; prompt: string }) =>
      gen({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["generations"] }),
    onError: (e: Error) => toast.error(e.message || "Generation failed"),
  });
}

function ResultBox({ text }: { text: string }) {
  if (!text) return null;
  return (
    <Card className="mt-4 border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm text-slate-900">Result</CardTitle>
        <Button size="sm" variant="outline" onClick={() => copy(text)}>
          <Copy className="h-3.5 w-3.5 mr-1" /> Copy
        </Button>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap text-sm text-slate-800 font-sans">{text}</pre>
      </CardContent>
    </Card>
  );
}

function EmailTool() {
  const [tone, setTone] = useState("Professional");
  const [audience, setAudience] = useState("Client");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const mut = useGenerate();
  const result = mut.data?.output ?? "";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !details.trim()) return;
    mut.mutate({
      kind: "email",
      title: subject,
      prompt: `Tone: ${tone}\nAudience: ${audience}\nSubject hint: ${subject}\n\nDetails / key points to include:\n${details}`,
    });
  }

  return (
    <Card className="border-slate-200 mt-4">
      <CardHeader>
        <CardTitle className="text-slate-900">Smart Email Generator</CardTitle>
        <CardDescription>Draft polished, on-tone professional emails in seconds.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Professional", "Formal", "Friendly", "Persuasive", "Apologetic", "Concise"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Client", "Manager", "Team", "Vendor", "Executive", "New hire"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="subject">Subject / purpose</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Project update for Q3 launch" />
          </div>
          <div>
            <Label htmlFor="details">Key points</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={6}
              placeholder="- Launch slipped 1 week due to QA findings&#10;- New target: Oct 12&#10;- Ask for sign-off on revised timeline"
            />
          </div>
          <Button type="submit" disabled={mut.isPending} className="bg-blue-700 hover:bg-blue-800 text-white w-fit">
            {mut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Generate email
          </Button>
        </form>
        <ResultBox text={result} />
        <Disclaimer />
      </CardContent>
    </Card>
  );
}

function MeetingTool() {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const mut = useGenerate();
  const result = mut.data?.output ?? "";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !notes.trim()) return;
    mut.mutate({ kind: "meeting", title, prompt: `Meeting: ${title}\n\nRaw notes / transcript:\n${notes}` });
  }

  return (
    <Card className="border-slate-200 mt-4">
      <CardHeader>
        <CardTitle className="text-slate-900">Meeting Notes Summarizer</CardTitle>
        <CardDescription>Turn raw notes into a clean summary with action items and deadlines.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4">
          <div>
            <Label htmlFor="m-title">Meeting title</Label>
            <Input id="m-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Weekly product sync" />
          </div>
          <div>
            <Label htmlFor="m-notes">Raw notes or transcript</Label>
            <Textarea id="m-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={10} placeholder="Paste your meeting notes here..." />
          </div>
          <Button type="submit" disabled={mut.isPending} className="bg-blue-700 hover:bg-blue-800 text-white w-fit">
            {mut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Summarize
          </Button>
        </form>
        <ResultBox text={result} />
        <Disclaimer />
      </CardContent>
    </Card>
  );
}

function PlannerTool() {
  const [scope, setScope] = useState("Today");
  const [hours, setHours] = useState("8");
  const [tasks, setTasks] = useState("");
  const mut = useGenerate();
  const result = mut.data?.output ?? "";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!tasks.trim()) return;
    mut.mutate({
      kind: "plan",
      title: `${scope} plan`,
      prompt: `Plan scope: ${scope}\nAvailable focus hours: ${hours}\n\nTasks & goals:\n${tasks}`,
    });
  }

  return (
    <Card className="border-slate-200 mt-4">
      <CardHeader>
        <CardTitle className="text-slate-900">AI Task Planner</CardTitle>
        <CardDescription>Get a prioritized, time-blocked plan based on urgency and importance.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Scope</Label>
              <Select value={scope} onValueChange={setScope}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Today", "Tomorrow", "This week"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="hours">Available hours</Label>
              <Input id="hours" type="number" min={1} max={16} value={hours} onChange={(e) => setHours(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="tasks">Tasks & goals</Label>
            <Textarea id="tasks" value={tasks} onChange={(e) => setTasks(e.target.value)} rows={8} placeholder="- Finish Q3 report (due Fri)&#10;- Prep for 1:1 with manager&#10;- Review 3 PRs&#10;- Inbox cleanup" />
          </div>
          <Button type="submit" disabled={mut.isPending} className="bg-blue-700 hover:bg-blue-800 text-white w-fit">
            {mut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Build my plan
          </Button>
        </form>
        <ResultBox text={result} />
        <Disclaimer />
      </CardContent>
    </Card>
  );
}

function Disclaimer() {
  return (
    <p className="text-xs text-slate-500 mt-3">
      AI-generated content can be inaccurate. Review carefully before sending or committing.
    </p>
  );
}
