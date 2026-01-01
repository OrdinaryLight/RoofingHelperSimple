# Roofing Helper Simple

A Next.js application built with Supabase, Tailwind CSS, shadcn/ui, and Framer Motion.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Styling:** Tailwind CSS with shadcn/ui components
- **Animations:** Framer Motion
- **Database:** Supabase
- **Language:** TypeScript

## Project Structure

```
src/
├── app/              # Next.js app directory
│   ├── globals.css   # Global styles
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Home page
├── components/       # React components
│   └── ui/          # shadcn/ui components
└── lib/             # Utility functions
    ├── supabase.ts  # Supabase client
    └── utils.ts     # General utilities
```