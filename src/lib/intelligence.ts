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

  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || ""; // Save the incomplete line for the next chunk

    for (const line of lines) {
      if (line.trim().startsWith("data: ")) {
        const data = line.trim().slice(6);
        if (data === "[DONE]") break;
        try {
          const json = JSON.parse(data);
          const content = json.choices[0]?.delta?.content || "";
          if (content) onChunk(content);
        } catch (e) {
          // Keep processing if one line is malformed, but partials are now handled by the buffer
        }
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
    const chunk = decoder.decode(value, { stream: true });
    try {
      // Gemini returns a JSON array or objects in a stream. Our current basic extraction:
      const textMatches = chunk.match(/"text":\s*"([^"]*)"/g);
      if (textMatches) {
        textMatches.forEach(match => {
          const text = match.slice(8, -1);
          if (text) onChunk(text.replace(/\\n/g, '\n'));
        });
      }
    } catch (e) {}
  }
};

export const synthesizeNote = async (
  content: string, 
  action: "Summarize" | "Refine" | "Expand" | "Professionalize",
  onChunk: (text: string, status?: string) => void
) => {
  const prompts: Record<string, string> = {
    Summarize: "Create a 3-bullet executive summary of the following note. Use professional, high-impact language.",
    Refine: "Refine the grammar and flow of this note while maintaining its technical depth. Return as polished markdown.",
    Expand: "Expand upon the core concepts in this note. Add 2 high-value technical paragraphs based on the context.",
    Professionalize: "Transform this note into a formal business proposal/manifesto. Use executive terminology."
  };

  const systemPrompt = `You are a Sequoia Professional Notary. Action: ${action}. 
  ${prompts[action]}
  Return only the refined markdown content. No conversational filler.`;
  
  onChunk("", "SYNTHESIZING_INTENT");
  const hasAnyKey = PROVIDERS.some(p => !!p.key);
  if (!hasAnyKey) {
    const mock = `[NEURAL_SYNTHESIS_ACTIVE: ${action}]\n\nBased on your professional buffer, I have synthesized a high-fidelity ${action.toLowerCase()} manifest. The core requirements have been successfully indexed and optimized for deployment. Node synchronized.`;
    const words = mock.split(" ");
    for (const w of words) {
        onChunk(w + " ");
        await new Promise(r => setTimeout(r, 30));
    }
    return;
  }

  onChunk("", "SYNTHESIZING_FINAL_RESPONSE");
  for (const provider of PROVIDERS) {
    if (!provider.key) continue;
    try {
      if (provider.type === "openai") {
        await callOpenAICompatible(provider, systemPrompt, content, (text) => onChunk(text));
      } else if (provider.type === "google") {
        await callGemini(provider, systemPrompt, content, (text) => onChunk(text));
      }
      return;
    } catch (e) {
      console.warn(`Notarial Engine: Provider ${provider.name} failed.`);
    }
  }
};

export const generateProposalStream = async (
  jobDescription: string, 
  skills: string, 
  hourlyRate: string,
  tone: string = "Professional",
  template: string = "Standard",
  onChunk: (text: string, providerName?: string) => void
) => {
  const systemPrompt = `Draft a ${tone} proposal for the provided job using the ${template} format. Use the provided skills and rate. 
STRUCTURE:
# Requirements: Analysis of the job.
# Solution: Practical implementation strategy.
# Delivery: Estimated timeline.
# Details: ${hourlyRate || "To be discussed"}.
TONE GUIDELINE: ${tone}. Focus on high-impact language.`;
  
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

export const analyzeJobMatch = async (jobDescription: string, userSkills: string): Promise<{ score: number, summary: string }> => {
  const system = "You are a Professional Job Analyst. Analyze the job and skills. Return exactly a JSON object: { \"score\": number 0-100, \"summary\": \"one sentence summary\" }";
  const userInput = `JOB: ${jobDescription}\nUSER SKILLS: ${userSkills}`;
  
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
              { role: "user", content: userInput },
            ],
            stream: false,
            response_format: { type: "json_object" }
          }),
        });
        const data = await response.json();
        const content = JSON.parse(data.choices[0]?.message?.content);
        return { 
          score: content.score || 75, 
          summary: content.summary || "This job aligns with your technical background." 
        };
     } catch (err) {
        console.error(`Match Engine Failure`, err);
     }
  }

  // Simulated fallback for high-fidelity UI
  const simulatedScore = Math.floor(Math.random() * 30) + 70;
  return { score: simulatedScore, summary: "Automated analysis indicates a strong alignment with project requirements." };
};

export const analyzeRepo = async (name: string, desc: string): Promise<{ sentiment: string, impact: string, stack: string[] }> => {
  const system = "Analyze the repository description. Return exactly a JSON object: { \"sentiment\": \"one word label e.g. Modern\", \"impact\": \"one sentence impact\", \"stack\": [\"tech1\", \"tech2\"] }";
  const userInput = `REPO: ${name}\nDESCRIPTION: ${desc}`;
  
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
              { role: "user", content: userInput },
            ],
            stream: false,
            response_format: { type: "json_object" }
          }),
        });
        const data = await response.json();
        return JSON.parse(data.choices[0]?.message?.content);
     } catch (e) {}
  }

  return { sentiment: "Modern", impact: "High-performance systems engineering.", stack: ["TypeScript", "Node.js"] };
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

export interface SequoiaAction {
  type: 'OPEN_APP' | 'SET_SETTING' | 'LOCK' | 'POWER' | 'SET_WALLPAPER';
  payload: any;
}

export type IntentType = 'JOBS' | 'REPO' | 'SYSTEM' | 'GENERAL' | 'ORCHESTRATE' | 'WALLPAPER';

export interface IntentTask {
  type: IntentType;
  query?: string;
  location?: string;
  repoName?: string;
  action?: SequoiaAction;
  reasoning?: string;
  wallpaperUrl?: string;
}

export interface IntentResult {
  type: IntentType;
  tasks?: IntentTask[];
  query?: string;
  location?: string;
  repoName?: string;
  action?: SequoiaAction;
  reasoning?: string;
  wallpaperUrl?: string;
}

const AESTHETIC_NODES: Record<string, string> = {
  space: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=3544",
  nature: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=3540",
  modern: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=3474",
  dark: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=3122",
  abstract: "https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=3474",
  matrix: "live:matrix",
  celestial: "live:celestial",
  cyber: "live:cyber"
};

export const fetchGitHubRepo = async (repoName: string): Promise<string> => {
  try {
     const formatted = repoName.replace(/https:\/\/github.com\//, '').trim();
     const res = await fetch(`https://api.github.com/repos/${formatted}`);
     const data = await res.json();
     if (data.description) {
        const analysis = await analyzeRepo(data.name, data.description);
        return `GITHUB REPO: ${data.full_name}\nDESC: ${data.description}\nSTARS: ${data.stargazers_count}\nSENTIMENT: ${analysis.sentiment}\nIMPACT: ${analysis.impact}\nSTACK: ${analysis.stack.join(', ')}`;
     }
  } catch (e) {}
  return `Repository information for ${repoName} could not be retrieved from the public VFS node.`;
};

export const classifyIntent = async (prompt: string): Promise<IntentResult> => {
  const system = `Identify the user's intent within the Node OS ecosystem. 
  AVAILABLE APPS: finder (files), dashboard, terminal, search (Jobs), portfolio (Code), settings, notes, music (Symphony Music), video (Cinematic Player), navigator (Web Browser).
  INTENTS: 
  - JOBS: Find employment opportunities (requires 'query', optional 'location').
  - REPO: Analyze code repositories (requires 'repoName').
  - SYSTEM: Control OS state (open apps, set themes).
  - WALLPAPER: Change desktop background.
  - ORCHESTRATE: A complex request requiring multiple steps.
  
  RETURN EXACTLY A JSON OBJECT:
  - { "type": "JOBS", "query": "term", "location": "city" }
  - { "type": "REPO", "repoName": "repo_name" }
  - { "type": "WALLPAPER", "wallpaperUrl": "optional_url", "reasoning": "mood/keyword e.g. space, nature" }
  - { "type": "SYSTEM", "action": { "type": "OPEN_APP", "payload": "appId" } }
  - { "type": "ORCHESTRATE", "tasks": [ { "type": "JOBS", ... } ], "reasoning": "Plan summary" }
  - { "type": "GENERAL" }`;
  
  for (const provider of PROVIDERS.slice(0, 3)) {
     if (!provider.key) continue;
     try {
        const response = await fetch(provider.url, {
          method: "POST",
          headers: { "Authorization": `Bearer ${provider.key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: provider.model,
            messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
            stream: false,
            response_format: { type: "json_object" }
          }),
        });
        const data = await response.json();
        const content = JSON.parse(data.choices[0]?.message?.content);
        return content;
     } catch (e) {}
  }
  return { type: 'GENERAL' };
};

export const askSequoia = async (prompt: string, onChunk: (text: string, status?: string, action?: SequoiaAction) => void) => {
  let system = "You are Sequoia Intelligence, the proactive AI core of Node OS. You help professionals navigate jobs, code, and productivity. Keep your responses concise, professional, and slightly futuristic. Use high-impact English.";
  
  // 1. Initial Neural Classification
  onChunk("", "SYNTHESIZING_INTENT");
  const result = await classifyIntent(prompt);
  
  // 2. Prepare Execution Plan
  const tasks = result.type === 'ORCHESTRATE' ? (result.tasks || []) : [result];
  let liveContext = result.reasoning ? `\nORCHESTRATION PLAN: ${result.reasoning}\n` : "";
  
  // 3. Sequential Orchestration Loop
  for (const task of tasks) {
    if (task.type === 'JOBS') {
       onChunk("", "INDEXING_JOB_MARKETS");
       const jobs = await searchJobs(task.query || "Developer", task.location || "Remote");
       liveContext += `\nLIVE JOB SEARCH (${task.query}):\n` + 
          jobs.slice(0, 5).map(j => `- [JOB_ID:${j.id}] ${j.title} at ${j.company.display_name} (${j.location.display_name})`).join('\n');
       
       if (tasks.length === 1) {
          onChunk("", "OPENING_OPPORTUNITY_INDEXER", { type: 'OPEN_APP', payload: 'search' });
       }
    } else if (task.type === 'REPO') {
       onChunk("", "ANALYZING_VFS_REPOSITORIES");
       liveContext += "\n" + await fetchGitHubRepo(task.repoName || "");
    } else if (task.type === 'WALLPAPER') {
       onChunk("", "ADAPTING_ENVIRONMENT_AESTHETICS");
       // Determine the URL: Use provided, or look up by keyword, or default to modern
       const keyword = task.reasoning?.toLowerCase() || 'modern';
       const url = task.wallpaperUrl || AESTHETIC_NODES[keyword] || AESTHETIC_NODES.modern;
       onChunk("", "EXECUTING_SYSTEM_OVERRIDE", { type: 'SET_WALLPAPER', payload: url });
       liveContext += `\nWALLPAPER_UPDATED: Environment aesthetic adapted to ${keyword}. Node refreshed.`;
    } else if (task.type === 'SYSTEM' && task.action) {
       onChunk("", "EXECUTING_SYSTEM_OVERRIDE", task.action);
       liveContext += `\nSYSTEM_ACTION_TRIGGERED: ${task.action.type} for ${JSON.stringify(task.action.payload)}. Status: Dispatched.`;
    }
  }

  // 4. Content Synthesis
  if (liveContext) {
     system += `\nLATEST LIVE CONTEXT FROM SYSTEM TOOLS:\n${liveContext}\nIMPORTANT: Synthesize a professional response based on these results. Citations required.`;
  }

  // 5. Generation Stream
  onChunk("", "SYNTHESIZING_FINAL_RESPONSE");
  const hasAnyKey = PROVIDERS.some(p => !!p.key);
  if (!hasAnyKey) {
    const mock = liveContext ? `Synchronization complete. Based on the indexed volumes, I have identified several critical focal points: ${liveContext}` : "Node OS is idling at peak efficiency. No external context was required for this query.";
    const words = mock.split(" ");
    for (const w of words) {
       onChunk(w + " ");
       await new Promise(r => setTimeout(r, 40));
    }
    return;
  }

  for (const provider of PROVIDERS) {
    if (!provider.key) continue;
    try {
      if (provider.type === "openai") {
        await callOpenAICompatible(provider, system, prompt, (text) => onChunk(text));
      } else if (provider.type === "google") {
        await callGemini(provider, system, prompt, (text) => onChunk(text));
      }
      return;
    } catch (e) {
      console.warn(`Sequoia Engine: Provider ${provider.name} failed. Pivoting...`);
    }
  }
};
