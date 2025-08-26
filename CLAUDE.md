# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kwanta is a Next.js-based football match organizer application with visual slot selection. Players can join matches and select their positions visually, similar to choosing seats on an airplane.

## Tech Stack

- **Framework**: Next.js 13.5.1 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives via shadcn/ui

## Essential Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture Overview

### Directory Structure

- `/app` - Next.js App Router pages and layouts
  - `/page.tsx` - Home page with match listing
  - `/create-match` - Match creation flow
  - `/match/[id]` - Individual match pages with join functionality
- `/components` - React components
  - `/ui` - shadcn/ui components (Button, Card, Form, etc.)
  - Custom components for match management
- `/lib` - Utilities and configurations
  - `/utils.ts` - CN utility for className merging
- `/api` - Mock API layer with in-memory storage

### Key Patterns

1. **Component Organization**: All UI components are in `/components/ui`, imported from shadcn/ui
2. **Form Handling**: Uses React Hook Form with Zod schemas for validation
3. **Routing**: App Router with dynamic routes (e.g., `/match/[id]`)
4. **State Management**: Currently uses React state; API layer uses in-memory storage
5. **Styling**: Tailwind CSS with CSS variables for theming

### Core Features

1. **Match Creation** (`/create-match`): Multi-step form for setting up matches
2. **Match Joining** (`/match/[id]`): Visual slot selection interface
3. **Match Listing** (`/`): Display of available matches

### API Structure

Currently uses mock API with in-memory storage in `/app/api/matches/`. Ready for backend integration:
- `GET /api/matches` - List all matches
- `POST /api/matches` - Create new match
- `GET /api/matches/[id]` - Get specific match
- `PUT /api/matches/[id]` - Update match (join/leave)

## Development Guidelines

### Adding New Components

When adding shadcn/ui components:
```bash
npx shadcn-ui@latest add [component-name]
```

### TypeScript Path Aliases

Use `@/` for imports from project root:
```typescript
import { Button } from "@/components/ui/button"
```

### Form Implementation

Always use React Hook Form with Zod validation:
```typescript
const formSchema = z.object({
  fieldName: z.string().min(1, "Required"),
})

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
})
```

## Backend Architecture

### Firebase Integration
- **Firestore Database**: `matches`, `teams`, `players` collections
- **Race-safe Slot Locking**: Firestore transactions prevent double-bookings
- **REST API Endpoints**: 
  - `POST /api/matches` - Create match with teams
  - `GET /api/matches/[id]` - Get match data
  - `POST /api/slots/claim` - Claim player slot
  - `POST /api/slots/leave` - Release player slot

### Environment Configuration
Required environment variables in `.env.local`:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Data Model
- **Matches**: Basic match info, team size, status
- **Teams**: Always 2 per match (Team A/B)
- **Players**: Slot-based with unique constraint on (matchId, teamId, slotNumber)

## Important Notes

- ESLint errors are currently ignored in production builds (`ignoreDuringBuilds: true`)
- Dark mode is configured but not fully implemented
- **Backend**: Firebase Firestore with transactional slot claiming
- **Auth**: Simple contact-based verification for slot leaving