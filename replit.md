# TikTok Affiliate Bot - System Architecture

## Overview

This is a full-stack TikTok affiliate marketing automation platform built to help businesses discover creators, manage outreach campaigns, and track performance analytics. The system automates the process of finding relevant TikTok creators and managing collaboration campaigns for mobile phone accessories and related products.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React hooks and context
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Radix UI primitives for accessible, headless components

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Development**: tsx for TypeScript execution in development
- **Production Build**: esbuild for fast, optimized bundling

### Data Storage Solutions
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for production)
- **Development Storage**: In-memory storage implementation for rapid prototyping
- **Session Storage**: connect-pg-simple for PostgreSQL session storage
- **Database Provider**: Neon Database (serverless PostgreSQL)

## Key Components

### 1. Creator Discovery System
- Advanced search and filtering capabilities
- Creator profile analysis and scoring
- Follower count, engagement rate, and GMV tracking
- Geographic and category-based filtering

### 2. Campaign Management
- Automated invitation sending with rate limiting
- Campaign budget and performance tracking
- Multi-campaign support with different targeting criteria
- Real-time status monitoring (active, paused, completed)

### 3. AI Assistant (Gemini Integration)
- Creator analysis and recommendation engine
- Message optimization for better response rates
- Campaign strategy development
- Market insights and trend analysis
- Multiple Gemini model support (2.0 Flash, 2.5 Pro, etc.)

### 4. Analytics Dashboard
- Performance metrics visualization using Recharts
- Conversion funnel tracking
- Revenue and ROI calculations
- Creator tier analysis and response rate comparison

### 5. Bot Automation Engine
- Configurable invitation limits and delays
- Automatic retry mechanisms
- Response tracking and follow-up automation
- Anti-spam protection with rate limiting

## Data Flow

1. **Creator Discovery**: Search TikTok creators → Filter by criteria → Analyze profiles → Score relevance
2. **Campaign Creation**: Define target criteria → Set budget/limits → Configure automation rules
3. **Automated Outreach**: Send invitations → Track responses → Manage follow-ups → Record outcomes
4. **Analytics**: Collect performance data → Generate insights → Display visualizations → Export reports
5. **AI Assistance**: Analyze creator data → Optimize messaging → Provide strategic recommendations

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives

### Development Tools
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Replit integration for development

### AI/ML Integration
- Google Gemini API for AI-powered features
- Multiple model support for different use cases
- Configurable AI parameters and response optimization

## Deployment Strategy

### Development Environment
- Vite development server with HMR
- In-memory storage for rapid iteration
- Replit integration for cloud development
- Runtime error overlay for debugging

### Production Build
- Vite builds React frontend to `dist/public`
- esbuild bundles Express server to `dist/index.js`
- Static file serving from Express
- PostgreSQL database with Drizzle migrations

### Database Management
- Drizzle Kit for schema management and migrations
- Environment-based configuration (DATABASE_URL)
- Support for both development and production databases

## Changelog
- June 29, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.