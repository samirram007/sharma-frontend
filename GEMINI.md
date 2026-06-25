# Project Overview

This project is a React-based web application built with [TanStack](https://tanstack.com/) technologies. It leverages file-based routing and a modern frontend stack.

## Technology Stack

- **Framework:** React
- **Language:** TypeScript
- **Routing:** TanStack Router (File-based)
- **Styling:** Tailwind CSS
- **Data Fetching:** TanStack Query (optional/recommended)
- **State Management:** TanStack Store (optional/recommended)
- **Testing:** Vitest
- **Tooling:** Vite, ESLint, Prettier

## Commands

### Development

- `npm install`: Install dependencies.
- `npm run start`: Start the development server.
- `npm run build`: Build for production.

### Quality Assurance

- `npm run lint`: Run ESLint.
- `npm run format`: Format code with Prettier.
- `npm run check`: Perform type checking and linting (check package.json for exact definition).
- `npm run test`: Run tests using Vitest.

### Development Workflow

- **Routing:** Add new routes by creating files in `src/routes`. TanStack Router will automatically manage the routing.
- **Components:** Add Shadcn components using `pnpx shadcn@latest add <component-name>`.
- **Layouts:** Managed in `src/routes/__root.tsx`.

## Coding Standards & Conventions

- Adhere to the existing project structure.
- Follow TypeScript best practices.
- Use the `Link` component from `@tanstack/react-router` for SPA navigation.
- Consistent formatting via Prettier and linting via ESLint is enforced.
