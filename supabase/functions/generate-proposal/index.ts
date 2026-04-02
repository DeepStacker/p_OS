// @ts-ignore: Deno type definitions not found in IDE
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    const { jobDescription, skills, hourlyRate } = await req.json();

    if (!jobDescription || !skills) {
      return new Response(JSON.stringify({ error: "Insufficient Intelligence Parameters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // @ts-ignore: Deno global
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    // @ts-ignore: Deno global
    const AI_MODEL = Deno.env.get("AI_MODEL") || "meta-llama/llama-3.3-70b-instruct:free";

    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY node not active");

    const systemPrompt = `You are a Tier-1 Freelance Strategist and Copywriter. 
Your mission: Write a high-ticket, hyper-persuasive proposal that creates immediate authority.

CRITICAL PROTOCOLS:
1. NO GENERIC FLUFF. Do not say "I am a hard worker". Show it.
2. HOOK: Start with a deep insight about their specific project.
3. VALUE PROPOSITION: Bridge their problems with your specific skills.
4. PROOF: Reference the provided skills implicitly through an "Approach" section.
5. CLOSING: A low-friction but high-authority Call to Action.

STRUCTURE:
# [Project Name] Strategy
## Diagnostic Analysis
[Insights about their job description]
## Proposed Technical Approach
[Specific steps using ${skills}]
## Logistics & Timeline
[Milestones]
## Performance Rate
[${hourlyRate ? `Proposed: ${hourlyRate}` : "Market Standard"}]

industrial, elite, professional tone. 300-500 words.`;

    const userPrompt = `JOB PARAMETERS:\n${jobDescription}\n\nOPERATOR SKILLS:\n${skills}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://proposalpro.ai",
        "X-Title": "Proposal Pro Elite",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
       const errText = await response.text();
       throw new Error(`Intelligence Node failure: ${response.status} - ${errText}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown node error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
