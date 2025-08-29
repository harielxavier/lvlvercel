# Overview

LVL UP Performance is a next-generation HR performance management and feedback system designed as a SaaS platform. The application enables organizations to create living, breathing performance ecosystems where every employee becomes a feedback node. The core innovation is a Universal Feedback Link System that allows seamless feedback collection through personalized URLs, QR codes, and various integration methods.

The platform serves multiple organizational roles from platform super admins to individual employees, with a sophisticated multi-tenant architecture supporting different subscription tiers. It's built as a full-stack application with modern web technologies and focuses on making feedback collection as easy as sharing a link.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built with **React 18** and **TypeScript**, using **Vite** as the build tool and development server. The UI leverages **shadcn/ui** components built on top of **Radix UI** primitives with **Tailwind CSS** for styling. The application uses **wouter** for client-side routing instead of React Router, providing a lightweight routing solution.

State management is handled through **TanStack Query (React Query)** for server state management, avoiding the complexity of Redux or Zustand for global state. The application supports both light and dark themes through CSS variables, with a sophisticated design system that includes glass morphism effects and gradient styling.

The frontend follows a component-based architecture with clear separation between UI components (`/components/ui`), feature components (`/components`), pages, and utility functions. Path aliases are configured to make imports cleaner and more maintainable.

## Backend Architecture
The server is built with **Express.js** and **TypeScript**, configured as an ES module application. The backend implements a proper multi-tenant SaaS architecture with tenant isolation at the database level.

**Authentication** is handled through Replit's OpenID Connect (OIDC) system using Passport.js strategies. Sessions are stored in PostgreSQL using `connect-pg-simple` for session management, providing scalable session storage.

The API follows RESTful conventions with proper error handling middleware and request logging. The server implements role-based access control with different permission levels for platform admins, tenant admins, managers, and employees.

## Data Storage Solutions
The application uses **PostgreSQL** as the primary database with **Drizzle ORM** for type-safe database operations. The database is hosted on **Neon** (serverless PostgreSQL) for scalability and performance.

Database schema includes proper relationships between users, tenants, employees, departments, feedback, goals, and performance reviews. The schema supports soft deletes, timestamps, and proper foreign key relationships with cascading rules.

**Drizzle-Zod** integration provides runtime schema validation, ensuring type safety from the database to the frontend. Database migrations are managed through Drizzle Kit with proper version control.

## Multi-Tenant Architecture
The system implements a shared database, shared schema multi-tenant model where tenant isolation is achieved through `tenantId` foreign keys. Each user belongs to a specific tenant (organization), and all data access is filtered by tenant ID to ensure complete data isolation.

The subscription system supports 6 different tiers (MJ Scott, Forming, Storming, Norming, Performing, AppSumo) with different feature sets and user limits. This is implemented through enum types in the database and business logic enforcement.

## Development and Build System
The project uses **ESBuild** for production builds, providing fast compilation and bundling. Development mode uses Vite's hot module replacement for rapid development cycles.

TypeScript configuration includes strict mode with proper path mapping for clean imports. The build process creates separate bundles for client and server code, optimizing for deployment.

# External Dependencies

## Database and Infrastructure
- **@neondatabase/serverless**: Serverless PostgreSQL database connection for scalable data storage
- **Neon Database**: Cloud-hosted PostgreSQL with automatic scaling and branching capabilities

## Authentication and Session Management  
- **Replit Authentication**: OpenID Connect integration for user authentication
- **connect-pg-simple**: PostgreSQL-based session store for scalable session management
- **Passport.js**: Authentication middleware with OpenID Connect strategy

## UI and Design System
- **shadcn/ui**: Complete UI component library built on Radix UI primitives
- **Radix UI**: Unstyled, accessible UI primitives for building custom design systems
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide React**: Modern icon library with React components

## Development and Build Tools
- **Vite**: Fast build tool and development server with hot module replacement
- **ESBuild**: Fast JavaScript/TypeScript bundler for production builds
- **TypeScript**: Static type checking for enhanced developer experience
- **Drizzle Kit**: Database migration and schema management tool

## State Management and Data Fetching
- **TanStack Query**: Server state management with caching, synchronization, and background updates
- **React Hook Form**: Performant forms with easy validation and minimal re-renders
- **Zod**: Runtime type validation and schema validation library

## Communication and Notifications
The application is prepared for integration with communication services for the feedback system, including email notifications, SMS capabilities, and real-time updates. The architecture supports future integration with services like SendGrid, Twilio, and WebSocket connections for real-time features.