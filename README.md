🍳 Hi! Refrigerator (AI Recipe Filter)
A modern, AI-powered progressive web application (PWA) that translates natural language queries into precise recipe searches and intelligently performs dietary analysis (Vegan filtering). Built to demonstrate Serverless architecture, Generative AI integration, and mobile-first UX design.

🌐 Live Demo: [(https://hi-refrigerator.vercel.app/)]

🚀 Key Features & Performance
This project is not just a standard UI slicing exercise. It tackles real-world frontend challenges and API integrations:

Generative AI & Prompt Engineering: Leveraged Google Gemini API to translate natural language (e.g., "我想吃雞肉") into standardized search parameters and analyze recipes for Vegan compliance. Implemented strict JSON-mode prompting and defensive parsing to handle AI hallucinations without crashing the UI.

Secure Serverless Architecture: Eliminated client-side API key exposure by abstracting Gemini API calls into Vercel Serverless Functions (Node.js), effectively establishing a secure Proxy Server and handling CORS configurations.

Data Normalization & Custom Hooks: Abstracted complex fetching logic into custom hooks (`useRecipes`, `useTheme`). Built helper functions to sanitize and flatten messy external data (e.g., mapping`strIngredient1...20` from TheMealDB into clean arrays).

Advanced UX & GSAP Animations: Orchestrated complex staggered entry animations using GSAP Timelines, utilizing `clearProps` to prevent animation residue. Addressed mobile-specific layout issues, including notch safe-areas (`env(safe-area-inset)`) and preventing modal scroll-penetration.

PWA & Dynamic SEO: Configured `vite-plugin-pwa` for an installable, native-like mobile experience with offline capabilities. Integrated `react-helmet-async` for dynamic Open Graph (OG) tags and title management to ensure every recipe is perfectly indexed and shareable.

🛠 Tech Stack
Core Architecture & Backend

React 18 & Vite: Functional component-based SPA with lightning-fast HMR.

Vercel Serverless Functions: Node.js runtime for secure API routing and hiding sensitive credentials.

Google Gemini API (`gemini-1.5-flash`): Core engine for semantic search and dietary logic processing.

State Management & Logic

React Hooks & Custom Hooks: Extensive use of `useState`, `useEffect`, and `useRef` (for DOM manipulation and GSAP scoping).

LocalStorage: Client-side data persistence for user themes (Dark Mode) and shopping lists.

JavaScript (ES6+): Deep utilization of Async/Await, Promises, and higher-order array methods (map, filter, reduce).

Styling & UI

CSS3 Custom Properties: Built a scalable Design System leveraging CSS variables for seamless system-aware Dark Mode.

GSAP (GreenSock Animation Platform): High-performance timeline animations and micro-interactions.

Modern CSS Layouts: Flexbox/Grid architecture with custom pseudo-elements (`::before/::after`) for high-quality custom UI components like checkboxes.

Data & Tooling

TheMealDB API: External RESTful API for recipe data and imagery.

PWA & SEO Plugins: `vite-plugin-pwa` and `react-helmet-async`.

Git, GitHub & ESLint: Version control and strict code quality enforcement.

## 💻 Getting Started (Local Development)

To run this project on your local machine:

1. Clone the repository:
   ```bash
   git clone [https://github.com/AlvinChen072380/hi-refrigerator](https://github.com/AlvinChen072380/hi-refrigerator)