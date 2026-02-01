# DraftGap Development Guide

This guide is for agentic coding assistants working in this repository. DraftGap is a League of Legends draft analyzer built as a Tauri desktop app and web app.

## Build, Lint, and Test Commands

### Root Commands
- `pnpm typecheck` - Run TypeScript type checking across all packages (uses turbo)
- `pnpm dev` - Start frontend development server
- `pnpm tauri` - Run Tauri commands for desktop app

### Frontend Specific (apps/frontend)
- `pnpm dev` - Start Vite dev server (port 3000)
- `pnpm build` - Build frontend (runs tsc then vite build)
- `pnpm serve` - Preview production build
- `pnpm test` - Run Vitest tests
- `pnpm test -- <test-file>` - Run a specific test file
- `pnpm test --run` - Run tests once (non-watch mode)
- `pnpm lint` - Run ESLint on src directory
- `pnpm typecheck` - TypeScript type checking (tsc --noEmit)

### Core Package Specific (packages/core)
- `pnpm typecheck` - TypeScript type checking (tsc --noEmit)

### Running Commands in Specific Packages
- `pnpm run --filter @draftgap/frontend <command>` - Run command in frontend
- `pnpm run --filter @draftgap/core <command>` - Run command in core

## Code Style Guidelines

### Tech Stack
- SolidJS for reactive UI (TSX)
- TypeScript with strict mode
- Tauri v2 for desktop app
- Vite for bundling
- Vitest for testing
- Tailwind CSS for styling
- Kobalte for component primitives

### File Organization
- `/packages/core` - Core business logic, data models, statistical analysis
- `/apps/frontend` - SolidJS web/desktop app
- Components: `/src/components/` split by feature and common utilities
- Contexts: `/src/contexts/` for SolidJS global state
- Hooks: `/src/hooks/` for custom hooks
- Utils: `/src/utils/` for pure functions

### TypeScript Patterns
- Use `type` over `interface`
- No explicit types for return values (let ts infer)
- Use optional chaining `?.` and nullish coalescing `??` for safety
- Use `!` non-null assertion sparingly (allowed by eslint rule)

### SolidJS Component Patterns
- Use PascalCase for component names
- Define Props interface at top of component
- Access reactive values with `value()` functions from signals/stores
- Use `batch()` for multiple state updates to avoid multiple renders
- Prefer `createStore` for objects with multiple reactive properties
- Use `createSignal` for single primitive values
- Forgetting `;` after directive imports is intentional (e.g., `tooltip;`)

### Naming Conventions
- Components: PascalCase (e.g., `Dialog`, `PickOptions`)
- Functions/Variables: camelCase (e.g., `pickChampion`, `formatPercentage`)
- Types/Interfaces: PascalCase (e.g., `Props`, `TeamPick`, `Dataset`)
- Constants: UPPER_SNAKE_CASE (when truly constant)
- Context hooks: `use*` pattern (e.g., `useDraft`, `useDataset`)

### Error Handling
- Use null/undefined returns for expected failures
- Type narrowing with optional chaining and null checks
- Return early with guards instead of deep nesting
- Don't throw for expected error states
- Use `??` to provide fallback values

### Styling
- Use Tailwind CSS classes
- Utility function `cn()` from `utils/style.ts` for class merging (uses clsx and tailwind-merge)
- 4-space indentation (Prettier config)
- Use `classList` prop for conditional classes in SolidJS components
- Inline style objects for dynamic CSS values

### State Management
- Use Context API for global state with custom `use*` hooks
- Context providers wrap relevant component trees
- Throw error in use hook when context is missing: `if (!useCtx) throw new Error("No Context found")`

### Code Style Configuration
- ESLint rules: TypeScript recommended, SolidJS recommended
- Disabled rules: `@typescript-eslint/ban-ts-comment`, `@typescript-eslint/no-non-null-assertion`
- Strict TypeScript mode enabled
- ESNext target with Node module resolution

### Important Notes
- This is a Tauri v2 desktop app with League of Legends client integration
- LCU API functions invoke Tauri commands
- Desktop-specific code checks `isDesktop` from `useMedia` hook
- Workspace package references use `workspace:*` protocol
- All packages use pnpm@9.2.0
