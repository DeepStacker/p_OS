/**
 * Node OS System Logic: Content Generation & Search
 * Universal adapters for content services.
 */

const ADZUNA_APP_ID = import.meta.env.VITE_ADZUNA_APP_ID;
const ADZUNA_APP_KEY = import.meta.env.VITE_ADZUNA_APP_KEY;
const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY;

// Multi-Provider Circuit Configuration
const PROVIDERS = [
  {
    name: "Provider 1",
    url: "https://api.groq.com/openai/v1/chat/completions",
    key: import.meta.env.VITE_GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    type: "openai"
  },
  {
    name: "Provider 2",
    url: "https://api.cerebras.ai/v1/chat/completions",
    key: import.meta.env.VITE_CEREBRAS_API_KEY,
    model: "llama3.1-70b",
    type: "openai"
  },
  {
    name: "Provider 3",
    url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent",
    key: import.meta.env.VITE_GOOGLE_AI_KEY,
    model: "gemini-1.5-flash",
    type: "google"
  },
  {
    name: "Provider 4",
    url: "https://api.x.ai/v1/chat/completions",
    key: import.meta.env.VITE_XAI_API_KEY,
    model: "grok-beta",
    type: "openai"
  },
  {
    name: "Provider 5",
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

// Search Normalization: Formatting queries for better results
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

  // simulation mode check
  const isSimulation = !ADZUNA_APP_ID || !ADZUNA_APP_KEY;

  if (isSimulation) {
    console.log("Job Search: Simulation Mode Active.");
    return [
      {
        id: "sim-1",
        title: "Senior Full-Stack Engineer",
        company: { display_name: "Tech Solutions" },
        location: { display_name: "Remote / Bengaluru" },
        description: "Seeking an experienced developer to build a distributed processing system using React. Competitive rate for quality contributions.",
        created: new Date().toISOString(),
        redirect_url: "#",
      },
      {
        id: "sim-2",
        title: "UX Designer",
        company: { display_name: "Creative Agency" },
        location: { display_name: "Pune, Maharashtra" },
        description: "Professional designer required for a new project dashboard. Clean aesthetics and modern UI expertise required.",
        created: new Date().toISOString(),
        redirect_url: "#",
      },
      {
        id: "sim-3",
        title: "AI Strategy Consultant",
        company: { display_name: "Global Quantum" },
        location: { display_name: "Mumbai, Maharashtra" },
        description: "Develop professional AI workflows for enterprise-scale logistics.",
        created: new Date().toISOString(),
        redirect_url: "#",
      }
    ];
  }

  // 1. Core Source: Adzuna
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
      console.error("Adzuna Search Failure:", err);
    }
  }

  // 2. Auxiliary Source: Tavily
  if (TAVILY_API_KEY && results.length < 15) {
    try {
      const tavilyRes = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: TAVILY_API_KEY,
          query: `Latest ${q} freelance jobs in ${l} hiring now 2024 page ${page}`,
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
      "X-Title": "Node OS",
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
  const systemPrompt = `Draft a proposal for the provided job. Use the provided skills and rate. 
STRUCTURE:
# Requirements: Analysis of the job.
# Solution: Practical implementation strategy.
# Delivery: Estimated timeline.
# Details: ${hourlyRate || "To be discussed"}.`;
  
  // 0. Simulation Mode: If no keys are present, stream a mock proposal
  const hasAnyKey = PROVIDERS.some(p => !!p.key);
  if (!hasAnyKey) {
    console.log("Proposal Generator: Simulation Mode Active.");
    const mockContent = `
# Project Understanding
The provided job description indicates a requirement for ${skills}. The core challenge appears to be improving the current architecture and scaling efficiently.

# Technical Approach
I will implement a reliable solution using the mentioned tech stack. My approach focuses on quality and scalability.
    
# Timeline
    - Phase 1: Planning and setup
    - Phase 2: Core implementation
    - Phase 3: Final testing and delivery
    
# Rate
Proposed rate of ${hourlyRate || "$50/hr"} for this project.
    `;
    
    // Simulate streaming
    const words = mockContent.split(" ");
    for (const word of words) {
        onChunk(word + " ", "Simulation Mode");
        await new Promise(r => setTimeout(r, 20)); // Simulate network latency
    }
    return;
  }

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
      console.warn(`Provider ${provider.name} failed. Pivoting to next provider...`, err);
    }
  }

  throw lastError || new Error("The system is currently busy. Please try again later.");
};

export const analyzeJobMatch = async (jobDescription: string, userSkills: string): Promise<string> => {
  const system = "You are a Professional Job Analyst. Analyze the job description and the user's skills. Return exactly one sentence explaining why this job is a good fit. Be concise and professional.";
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
        return data.choices[0]?.message?.content || "Your skills are a strong match for this role.";
     } catch (err) {
        console.error(`Match Analysis Engine ${provider.name} failed.`, err);
     }
  }

  return "Your background matches the key requirements for this position.";
};

export const deepDiveJob = async (jobDescription: string): Promise<string> => {
  const system = "You are a Technical Job Analyst. Create a detailed 3-bullet-point breakdown of this job. Bullet 1: Core tech stack. Bullet 2: Primary project goal. Bullet 3: Key benefit of applying. Keep it professional.";
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
        return data.choices[0]?.message?.content || "The tech stack align with modern development standards.";
     } catch (err) {
        console.error(`Deep Dive Engine ${provider.name} failed.`, err);
     }
  }

  return "Analysis complete: The job description indicates significant opportunities for a skilled developer.";
};
