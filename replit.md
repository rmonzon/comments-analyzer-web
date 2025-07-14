# YouTube Comments Analyzer

## Overview

This is a full-stack web application that analyzes YouTube video comments using AI-powered sentiment analysis and summarization. The application provides users with insights into comment sentiment, key discussion points, and comprehensive summaries of YouTube video comment sections.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with custom YouTube-themed colors and shadcn/ui components
- **Routing**: Wouter for client-side navigation
- **State Management**: React Query (@tanstack/react-query) for server state management
- **Authentication**: Clerk for user authentication and subscription management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication Middleware**: Clerk Express middleware for protected routes

## Key Components

### Database Schema
- **Videos**: Stores YouTube video metadata (title, description, channel info, statistics)
- **Comments**: Stores individual comment data with author information and engagement metrics
- **Analyses**: Stores AI-generated analysis results (sentiment stats, key points, summaries)
- **Users**: User account information managed through Clerk
- **Premium Interest**: Tracks users interested in premium features

### External Service Integrations
- **YouTube Data API**: Fetches video information and comments
- **OpenAI API**: Generates sentiment analysis and content summaries
- **Clerk**: Authentication, user management, and subscription handling
- **Stripe**: Payment processing for premium subscriptions (integrated via Clerk)

### AI Analysis Pipeline
- **Comment Processing**: Filters and processes comments based on user subscription tier
- **Sentiment Analysis**: Categorizes comments as positive, negative, or neutral
- **Key Points Extraction**: Identifies main discussion topics and themes
- **Summary Generation**: Creates comprehensive summaries of comment sections

## Data Flow

1. **User Input**: User provides YouTube video URL through the web interface
2. **Video ID Extraction**: System extracts video ID from various YouTube URL formats
3. **Data Fetching**: Concurrent API calls to YouTube Data API for video info and comments
4. **Comment Processing**: Comments are filtered and prepared for AI analysis based on user tier
5. **AI Analysis**: OpenAI processes comments to generate sentiment analysis and summaries
6. **Data Storage**: Results are cached in PostgreSQL for future access
7. **Response**: Formatted analysis data is returned to the frontend for display

## External Dependencies

### APIs and Services
- **YouTube Data API v3**: Video and comment data retrieval
- **OpenAI API**: AI-powered content analysis and generation
- **Clerk**: Authentication and subscription management
- **Neon Database**: Serverless PostgreSQL hosting

### Key Libraries
- **Frontend**: React, TypeScript, Tailwind CSS, Radix UI, React Query
- **Backend**: Express.js, Drizzle ORM, Google APIs client
- **Authentication**: Clerk React and Express SDKs
- **Database**: @neondatabase/serverless with connection pooling

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: ESBuild bundles Express server to `dist/index.js`
- **Database**: Drizzle Kit manages schema migrations

### Environment Configuration
- **Development**: Uses Vite dev server with Express API proxy
- **Production**: Serves static files from Express with API routes
- **Database**: Requires `DATABASE_URL` environment variable
- **APIs**: Requires `YOUTUBE_API_KEY`, `OPENAI_API_KEY`, and Clerk keys

### Subscription Tiers
- **Free**: Up to 100 comments analyzed using basic AI model
- **Starter**: Up to 1,000 comments with improved AI model
- **Pro**: Up to 300,000 comments with advanced AI model and features

### Key Features
- **Caching**: Analysis results are cached to avoid duplicate API calls
- **Error Handling**: Comprehensive error states for API failures and quota limits
- **Responsive Design**: Mobile-first UI with dark/light theme support
- **Chrome Extension**: Available for direct YouTube integration
- **Sharing**: Shareable analysis links with URL parameters