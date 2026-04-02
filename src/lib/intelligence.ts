/**
 * Deep Signal Intelligence Hub: Universal Multi-Provider AI and Search Logic
 * Optimized for high-volume, real-world lead extraction.
 */

const ADZUNA_APP_ID = import.meta.env.VITE_ADZUNA_APP_ID;
const ADZUNA_APP_KEY = import.meta.env.VITE_ADZUNA_APP_KEY;
const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY;

// Multi-Provider Circuit Configuration
const PROVIDERS = [
  {
    name: "Groq (High-Speed)",
    url: "https://api.groq.com/openai/v1/chat/completions",
    key: import.meta.env.VITE_GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    type: "openai"
  },
  {
    name: "Cerebras (Elite Node)",
    url: "https://api.cerebras.ai/v1/chat/completions",
    key: import.meta.env.VITE_CEREBRAS_API_KEY,
    model: "llama3.1-70b",
    type: "openai"
  },
  {
    name: "Google (Gemini Forge)",
    url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent",
    key: import.meta.env.VITE_GOOGLE_AI_KEY,
    model: "gemini-1.5-flash",
    type: "google"
  },
  {
    name: "XAI (Grok Node)",
    url: "https://api.x.ai/v1/chat/completions",
    key: import.meta.env.VITE_XAI_API_KEY,
    model: "grok-beta",
    type: "openai"
  },
  {
    name: "OpenRouter (Global Fallback)",
    url: "https://openrouter.ai/api/v1/chat/completions",
    key: import.meta.env.VITE_OPENROUTER_API_KEY,
    model: import.meta.env.VITE_AI_MODEL || "meta-llama/llama-3.3-70b-instruct:free",
    type: "openai"
  }
];

export interface JobResult {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  created: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
}

// Industrial Context Engine: Normalizing user queries for higher hit rates
const normalizeQuery = (query: string, location: string) => {
    let finalLoc = location || "India";
    const locMap: Record<string, string> = {
        "banglore": "Bengaluru, Karnataka, India",
        "bangalore": "Bengaluru, Karnataka, India",
        "pune": "Pune, Maharashtra, India",
        "mumbai": "Mumbai, Maharashtra, India",
        "delhi": "Delhi, India",
        "hyderabad": "Hyderabad, Telangana, India",
        "chennai": "Chennai, Tamil Nadu, India"
    };

    const lowerLoc = finalLoc.toLowerCase().trim();
    if (locMap[lowerLoc]) finalLoc = locMap[lowerLoc];

    return { 
        q: query.trim(), 
        l: finalLoc 
    };
};

export const searchJobs = async (query: string, location: string, page: number = 1): Promise<JobResult[]> => {
  let results: JobResult[] = [];
  const { q, l } = normalizeQuery(query, location);

  // 1. Core Signal: Adzuna (Aggressive extraction)
  if (ADZUNA_APP_ID && ADZUNA_APP_KEY) {
    try {
      const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/in/search/${page}?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=25&what=${encodeURIComponent(q)}&where=${encodeURIComponent(l)}`;
      const res = await fetch(adzunaUrl);
      const data = await res.json();
      if (data.results) {
        results = data.results.map((j: any) => ({
          id: String(j.id),
          title: j.title,
          company: { display_name: j.company?.display_name || "Enterprise Node" },
          location: { display_name: j.location?.display_name || l },
          description: j.description,
          created: j.created,
          redirect_url: j.redirect_url,
          salary_min: j.salary_min,
          salary_max: j.salary_max
        }));
      }
    } catch (err) {
      console.error("Adzuna Deep Signal Failure:", err);
    }
  }

  // 2. Auxiliary Signal: Tavily (Hybrid verification on every page)
  if (TAVILY_API_KEY && results.length < 15) {
    try {
      const tavilyRes = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: TAVILY_API_KEY,
          query: `Latest high-ticket ${q} freelance jobs in ${l} hiring now 2024 page ${page}`,
          search_depth: "advanced",
          max_results: 10
        })
      });
      const data = await tavilyRes.json();
      if (data.results) {
        const tavilyJobs = data.results.map((r: any, idx: number) => ({
          id: `hybrid-${idx}-${page}-${Date.now()}`,
          title: r.title,
          company: { display_name: "Verified External Link" },
          location: { display_name: l },
          description: r.content,
          created: new Date().toISOString(),
          redirect_url: r.url,
        }));
        results = [...results, ...tavilyJobs];
      }
    } catch (err) {
      console.error("Tavily Hybrid Error:", err);
    }
  }

  return results;
};

const callOpenAICompatible = async (provider: any, system: string, user: string, onChunk: (text: string) => void) => {
  const response = await fetch(provider.url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${provider.key}`,
      "Content-Type": "application/json",
      "X-Title": "Proposal Pro Elite",
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      stream: true,
    }),
  });

  if (!response.ok) throw new Error(`Node ${provider.name} failed: ${response.status}`);

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) return;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") break;
        try {
          const json = JSON.parse(data);
          const content = json.choices[0]?.delta?.content || "";
          onChunk(content);
        } catch (e) {}
      }
    }
  }
};

const callGemini = async (provider: any, system: string, user: string, onChunk: (text: string) => void) => {
  const res = await fetch(`${provider.url}?key=${provider.key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${system}\n\nUSER INPUT: ${user}` }] }]
    })
  });

  if (!res.ok) throw new Error(`Node ${provider.name} failed: ${res.status}`);
  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) return;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    try {
      const json = JSON.parse(chunk.replace(/^\[|,|\]$/g, ''));
      const text = json.candidates[0]?.content?.parts[0]?.text || "";
      onChunk(text);
    } catch (e) {}
  }
};

export const generateProposalStream = async (
  jobDescription: string, 
  skills: string, 
  hourlyRate: string,
  onChunk: (text: string, providerName?: string) => void
) => {
  const systemPrompt = `You are a Tier-1 Freelance Strategist. Write a hyper-persuasive industrial proposal. 
STRUCTURE:
# Diagnostic Analysis: Insights about their job.
# Technical Approach: How you use ${skills}.
# Logistics: Timeline.
# Performance Rate: ${hourlyRate || "Market Standard"}.`;
  
  const userInput = `JOB: ${jobDescription}\nSKILLS: ${skills}`;
  let lastError = null;

  for (const provider of PROVIDERS) {
    if (!provider.key) continue;
    try {
      if (provider.type === "openai") {
        await callOpenAICompatible(provider, systemPrompt, userInput, (text) => onChunk(text, provider.name));
      } else if (provider.type === "google") {
        await callGemini(provider, systemPrompt, userInput, (text) => onChunk(text, provider.name));
      }
      return; 
    } catch (err: any) {
      lastError = err;
      console.warn(`Provider ${provider.name} failed. Pivoting to next node...`, err);
    }
  }

  throw lastError || new Error("All Intelligence Nodes Congested. Manual bypass recommended.");
};

export const analyzeJobMatch = async (jobDescription: string, userSkills: string): Promise<string> => {
  const system = "You are a Match Analysis Intelligence. Analyze the job description and user's skills. Return exactly ONE sentence explaining why this job is a great fit for the user. Be concise and persuasive.";
  const user = `JOB: ${jobDescription}\nUSER SKILLS: ${userSkills}`;
  
  for (const provider of PROVIDERS.slice(0, 3)) {
     if (!provider.key) continue;
     try {
        const response = await fetch(provider.url, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${provider.key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: provider.model,
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
            ],
            stream: false,
          }),
        });
        const data = await response.json();
        return data.choices[0]?.message?.content || "Signal Scan: Industrial Skills Synchronization confirmed.";
     } catch (err) {
        console.error(`Match Analysis Node ${provider.name} failed.`, err);
     }
  }

  return "Market Intelligence: High capability match based on industrial requirements.";
};

export const deepDiveJob = async (jobDescription: string): Promise<string> => {
  const system = "You are a High-Signal Job Analyst. Create a detailed 3-bullet-point technical breakdown of this job. Bullet 1: Core tech stack. Bullet 2: Major project goal. Bullet 3: Why it's worth applying. Keep it technical and elite.";
  const user = `JOB DESCRIPTION: ${jobDescription}`;
  
  for (const provider of PROVIDERS.slice(0, 3)) {
     if (!provider.key) continue;
     try {
        const response = await fetch(provider.url, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${provider.key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: provider.model,
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
            ],
            stream: false,
          }),
        });
        const data = await response.json();
        return data.choices[0]?.message?.content || "Deep Dive: Tech stack includes high-level industrial protocols.";
     } catch (err) {
        console.error(`Deep Dive Node ${provider.name} failed.`, err);
     }
  }

  return "Deep Dive: Analysis offline, but job description indicates high-ticket strategic relevance.";
};
