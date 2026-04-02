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
    const { query, location } = await req.json();
    // @ts-ignore: Deno global
    const ADZUNA_APP_ID = Deno.env.get("ADZUNA_APP_ID");
    // @ts-ignore: Deno global
    const ADZUNA_APP_KEY = Deno.env.get("ADZUNA_APP_KEY");
    // @ts-ignore: Deno global
    const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY");

    let results = [];

    // Try Adzuna First
    if (ADZUNA_APP_ID && ADZUNA_APP_KEY) {
      try {
        const country = "in";
        const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=10&what=${encodeURIComponent(query || "")}&where=${encodeURIComponent(location || "")}`;
        const adzunaRes = await fetch(adzunaUrl);
        const data = await adzunaRes.json();
        if (data.results) {
          results = data.results.map((j: any) => ({
            id: j.id,
            title: j.title,
            company: { display_name: j.company?.display_name || "Unknown" },
            location: { display_name: j.location?.display_name || location || "Remote" },
            description: j.description,
            created: j.created,
            redirect_url: j.redirect_url,
            salary_min: j.salary_min,
            salary_max: j.salary_max
          }));
        }
      } catch (err) {
        console.error("Adzuna error:", err);
      }
    }

    // Fallback or Augment with Tavily if results are low or keys provided
    if (results.length < 5 && TAVILY_API_KEY) {
      try {
        const tavilyRes = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: TAVILY_API_KEY,
            query: `Latest ${query} jobs in ${location || 'India'} hiring now 2024`,
            search_depth: "advanced",
            include_raw_content: false,
            max_results: 5
          })
        });
        const tavilyData = await tavilyRes.json();
        if (tavilyData.results) {
          const tavilyJobs = tavilyData.results.map((r: any, idx: number) => ({
            id: `tavily-${idx}`,
            title: r.title,
            company: { display_name: "Web Discovery" },
            location: { display_name: location || "Remote" },
            description: r.content,
            created: new Date().toISOString(),
            redirect_url: r.url,
          }));
          results = [...results, ...tavilyJobs];
        }
      } catch (err) {
        console.error("Tavily error:", err);
      }
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
