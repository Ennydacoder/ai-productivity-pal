import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { generateText } from "ai";
import { z } from "zod";

type Kind = "email" | "meeting" | "plan";

const SYSTEM_PROMPTS: Record<Kind, string> = {
  email: `You are an expert workplace communication assistant. Write a clear, well-structured professional email based on the user's input.
- Match the requested tone (formal, friendly, persuasive, apologetic, etc.) and audience (client, manager, team, etc.).
- Include a concise subject line on the first line as: Subject: ...
- Use short paragraphs, polite greeting and sign-off.
- Do NOT invent facts. If a detail is missing, leave a clear [placeholder].
- End with: "AI-generated — please review before sending."`,
  meeting: `You are a meeting notes summarizer for busy professionals. Given raw meeting notes or a transcript, produce a clean summary in markdown with these sections:
## Summary
2-4 sentence overview.
## Key Decisions
Bullet list.
## Action Items
Bullet list as: - [Owner] Task — due Date (or "no date")
## Deadlines
Any dates explicitly mentioned.
## Open Questions
Anything unresolved.
Be faithful to the source. Do NOT invent owners, dates, or decisions. Use "Unassigned" if owner is unclear.
End with: "AI-generated summary — verify against the original notes."`,
  plan: `You are an AI productivity coach. Build a structured, realistic plan from the user's tasks and goals.
Output in markdown:
## Top Priorities (Today)
Ranked 1-3, with one-line reasoning each (urgency × importance).
## Time-blocked Schedule
A table or list with time blocks (e.g. 09:00–10:30) and tasks. Include focus blocks and short breaks.
## Quick Wins
Tasks under 15 min.
## Defer / Delegate
Items not for today.
## Productivity Tip
One actionable tip tailored to the workload.
End with: "AI-generated plan — adjust to your real calendar before committing."`,
};

const GenerateInput = z.object({
  kind: z.enum(["email", "meeting", "plan"]),
  title: z.string().min(1).max(200),
  prompt: z.string().min(1).max(8000),
});

export const generateAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => GenerateInput.parse(input))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI service is not configured.");

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const { text } = await generateText({
      model,
      system: SYSTEM_PROMPTS[data.kind],
      prompt: data.prompt,
    });

    const { data: row, error } = await context.supabase
      .from("generations")
      .insert({
        user_id: context.userId,
        kind: data.kind,
        title: data.title,
        input: { prompt: data.prompt },
        output: text,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return row;
  });

export const listGenerations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("generations")
      .select("id, kind, title, output, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const deleteGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("generations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
