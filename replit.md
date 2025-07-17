# Uno Tournament Game

## Overview

This is a full-stack SpongeBob-themed Uno card game application built with React frontend, Express.js backend, and WebSocket communication for real-time multiplayer gameplay. The game supports both human players and AI opponents with distinct personalities from the SpongeBob universe.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state, local React state for UI
- **Styling**: Tailwind CSS with custom SpongeBob theme colors
- **UI Components**: Radix UI primitives with custom styling (shadcn/ui)
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Real-time Communication**: WebSocket Server for game events
- **Game Logic**: Custom game engine with AI controller
- **API Design**: RESTful endpoints for authentication and room management
- **Module System**: ES modules throughout

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM (ACTIVE)
- **User & Room Persistence**: Database-backed user accounts and room management
- **Real-time Data**: In-memory storage for game states, chat, and connected players
- **Session Management**: Connect-pg-simple for PostgreSQL-backed sessions
- **Migration System**: Drizzle Kit for database schema management

## Key Components

### Game Engine
- **Core Logic**: Complete Uno game rules implementation
- **AI System**: Multiple AI personalities with different play styles
- **Tournament Mode**: Multi-round games with win tracking
- **Real-time Events**: WebSocket-based game state synchronization

### Authentication System
- **User Registration**: Username/password based authentication
- **Session Management**: Persistent user sessions
- **Player Profiles**: Level system and achievement tracking

### Room Management
- **Room Creation**: Customizable game rooms with password protection
- **Player Joining**: Real-time room updates via WebSocket
- **Game Settings**: Configurable tournament parameters

### AI Personalities
- **SpongeBob Characters**: Six distinct AI personalities (SpongeBob, Patrick, Squidward, Mr. Krabs, Sandy, Plankton)
- **Play Styles**: Different strategies (aggressive, defensive, random, strategic)
- **Voice Lines**: Character-specific messages and reactions

## Data Flow

1. **Authentication Flow**: User registers/logs in → Session created → Redirected to lobby
2. **Room Flow**: Create/join room → WebSocket connection established → Real-time updates
3. **Game Flow**: Game starts → Turn-based actions → AI responses → State updates via WebSocket
4. **Achievement Flow**: Game events trigger achievement checks → Database updates → UI notifications

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React, React DOM, React Router (Wouter)
- **Backend**: Express.js, WebSocket (ws), TypeScript execution (tsx)
- **Database**: Drizzle ORM, PostgreSQL driver (@neondatabase/serverless)

### UI and Styling
- **Component Library**: Extensive Radix UI components
- **Styling**: Tailwind CSS with PostCSS
- **Animations**: CSS-based animations for cards and particles

### Development Tools
- **Build System**: Vite with React plugin
- **Type Checking**: TypeScript with strict configuration
- **Code Quality**: ESBuild for production bundling

### Specialized Libraries
- **State Management**: TanStack React Query
- **Form Handling**: React Hook Form with Zod validation
- **Date Handling**: date-fns
- **Utility Libraries**: clsx, class-variance-authority

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite development server with HMR
- **WebSocket**: Development WebSocket server on same port
- **Database**: Environment variable configuration for database URL
- **Error Handling**: Runtime error overlay for development

### Production Build
- **Frontend**: Vite builds to `dist/public` directory
- **Backend**: ESBuild bundles server to `dist/index.js`
- **Static Serving**: Express serves built frontend files
- **WebSocket**: Production WebSocket server with reconnection logic

### Database Management
- **Schema**: Drizzle schema definitions in `shared/schema.ts`
- **Migrations**: Generated migrations in `./migrations` directory
- **Environment**: DATABASE_URL environment variable required
- **Backup Strategy**: PostgreSQL-compatible backup procedures

The application follows a monorepo structure with clear separation between client, server, and shared code, enabling efficient development and deployment workflows.