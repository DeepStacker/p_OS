# Proposal Studio

[![GitHub stars](https://img.shields.io/github/stars/Syxd09/proposal-studio)](https://github.com/Syxd09/proposal-studio/stargazers)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF?style=flat&logo=vite)](https://vitejs.dev/)

Proposal Studio is a professional AI-powered platform for freelancers to streamline their workflow. Effortlessly craft high-quality proposals, showcase your technical expertise with automated portfolio generation, and browse curated job opportunities — all within a beautiful macOS-style desktop interface.

## Features

- **AI Proposal Generator** — Leverage advanced AI models to generate persuasive, tailored proposals from job descriptions
- **Jobs Board** — Browse curated job opportunities from multiple sources with real-time market signals
- **Portfolio Builder** — Instantly fetch your GitHub repositories and build a professional portfolio showcase
- **macOS-style Desktop Interface** — Full desktop experience with windows, widgets, dock, and menu bar
- **Built-in Apps** — Calculator, Calendar, Clock, Finder, Music, Video Player, Terminal, Notes, Navigator
- **Desktop Widgets** — Clock, Calendar, Metrics, Notes widgets on the desktop
- **Spotlight Search** — Quick search across apps and files with `Cmd+K`
- **Mission Control** — Overview of all windows and spaces
- **Launchpad** — App launcher with grid view of all applications
- **Live Wallpaper** — Animated dynamic backgrounds

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | React | 18.3.1 |
| Build Tool | Vite | 5.4.19 |
| Language | TypeScript | 5.8.3 |
| Styling | Tailwind CSS | 3.4.17 |
| Animations | Framer Motion | 12.38.0 |
| Routing | React Router | 6.30.1 |
| Auth | Firebase | 12.11.0 |
| Database | Supabase | 2.101.0 |
| UI Components | Radix UI + shadcn/ui | Latest |
| Icons | Lucide React | 0.462.0 |
| Forms | React Hook Form + Zod | 7.61.1 / 3.25.76 |
| Charts | Recharts | 2.15.4 |
| State | TanStack Query | 5.83.0 |
| Testing | Vitest | 3.2.4 |
| Linting | ESLint | 9.32.0 |

## Project Structure

```
src/
├── components/
│   ├── apps/           # Built-in desktop applications
│   │   ├── Calculator.tsx
│   │   ├── Calendar.tsx
│   │   ├── Clock.tsx
│   │   ├── Finder.tsx
│   │   ├── Music.tsx
│   │   ├── Navigator.tsx
│   │   ├── Notes.tsx
│   │   ├── Terminal.tsx
│   │   └── VideoPlayer.tsx
│   ├── widgets/        # Desktop widgets
│   │   ├── BaseWidget.tsx
│   │   ├── CalendarWidget.tsx
│   │   ├── ClockWidget.tsx
│   │   ├── MetricsWidget.tsx
│   │   └── NotesWidget.tsx
│   ├── ui/             # shadcn/ui components (40+)
│   └── *.tsx           # Core components (MacOSLayout, Dock, etc.)
├── pages/              # Route pages
│   ├── Dashboard.tsx
│   ├── Auth.tsx
│   ├── Index.tsx
│   ├── Proposals.tsx
│   ├── Portfolio.tsx
│   ├── Jobs.tsx
│   ├── Pricing.tsx
│   ├── Settings.tsx
│   ├── Admin.tsx
│   └── NotFound.tsx
├── lib/                # Utilities
├── hooks/              # Custom React hooks
├── contexts/           # React contexts (Auth)
└── integrations/       # External integrations (Supabase)
```

## Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher

## Installation

```bash
# Clone the repository
git clone https://github.com/Syxd09/proposal-studio.git

# Navigate to project directory
cd proposal-studio

# Install dependencies
npm install
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Firebase Config
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# AI Providers
VITE_GROQ_API_KEY=gsk_xxx
VITE_CEREBRAS_API_KEY=csk_xxx
VITE_GOOGLE_AI_KEY=xxx
VITE_XAI_API_KEY=xxx
VITE_OPENROUTER_API_KEY=sk-or-v1-xxx
VITE_AI_MODEL=meta-llama/llama-3.3-70b-instruct:free

# Job Market Signals
VITE_ADZUNA_APP_ID=xxx
VITE_ADZUNA_APP_KEY=xxx
VITE_TAVILY_API_KEY=tvly-xxx

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-key
```

## Development

```bash
npm run dev
```

The development server runs on **http://localhost:8080**

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |

## Routes

| Path | Description |
|------|-------------|
| `/` | Dashboard (protected) |
| `/auth` | Authentication page |
| `/welcome` | Welcome/landing page |
| `/proposals` | AI Proposal Generator (protected) |
| `/portfolio` | Portfolio Builder (protected) |
| `/jobs` | Jobs Board (protected) |
| `/pricing` | Pricing page (protected) |
| `/settings` | Settings (protected) |
| `/admin` | Admin panel (protected) |
| `*` | 404 Not Found |

## Built-in Apps

| App | Description |
|-----|-------------|
| **Calculator** | Functional calculator with standard operations |
| **Calendar** | Interactive calendar with date picker |
| **Clock** | World clock with multiple time zones |
| **Finder** | File browser with directory navigation |
| **Music** | Music player with playback controls |
| **Video Player** | Video playback with controls |
| **Terminal** | Command-line terminal emulator |
| **Notes** | Note-taking application |
| **Navigator** | Web browser for internet browsing |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Open Spotlight search |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC License

## Credits

- **Author**: Syxd09
- **UI Components**: Based on [shadcn/ui](https://ui.shadcn.com/)