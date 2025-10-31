# Agent Guidelines for notion-editor

## Commands
- **Dev**: `npm run dev` - Start development server
- **Build**: `npm run build` - Build for production
- **Lint**: `npm run lint` - Run ESLint
- **Start**: `npm run start` - Start production server

## Code Style
- **TypeScript**: Strict mode enabled, use proper types
- **Imports**: Use `@/*` path alias for local imports, React types from `React`
- **Components**: PascalCase names, export as named exports when possible
- **Functions**: camelCase, prefer arrow functions for components
- **Props**: Use TypeScript interfaces, prefer `React.ComponentProps<"element">` for extending native elements
- **CSS**: Use Tailwind classes, use `cn()` utility from `@/lib/utils` for conditional classes
- **Files**: kebab-case for file names, use `.tsx` for React components
- **Error Handling**: No specific patterns found, use standard try/catch

## Architecture
- Next.js 16 with React 19, strict TypeScript
- Radix UI components with Tailwind styling
- Component variants using `class-variance-authority`
- Path alias `@/*` points to project root