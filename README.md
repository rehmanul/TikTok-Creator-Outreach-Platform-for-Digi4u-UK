# TikTok Affiliate Marketing Automation Platform

A comprehensive platform for automating TikTok creator outreach and managing affiliate marketing campaigns for mobile phone accessories and related products.

## Features

- **Creator Discovery**: Advanced search and filtering to find relevant TikTok creators
- **Campaign Management**: Automated invitation sending with budget and performance tracking
- **AI Assistant**: Powered by Google Gemini for creator analysis and message optimization
- **Analytics Dashboard**: Performance metrics and ROI visualization
- **TikTok API Integration**: Official TikTok Business API integration for real data

## Quick Start

1. **Environment Setup**
   ```bash
   cp .env.example .env
   # Add your API keys to .env file
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## Required API Keys

- **TIKTOK_CLIENT_SECRET**: Your TikTok Business API client secret
- **GEMINI_API_KEY**: Google Gemini AI API key for intelligent features

## TikTok Business API Configuration

Your app is configured with:
- App ID: `7519035078651936769`
- Sandbox Advertiser ID: `7519829315018588178`
- Environment: Development (uses sandbox endpoints)

## Project Structure

```
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Application pages
│   └── └── lib/          # Utilities and configurations
├── server/               # Express backend
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── middleware/       # Authentication & security
│   └── config/           # Environment configuration
├── shared/               # Shared types and schemas
└── docs/                 # Documentation
```

## Development

The application uses:
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (with in-memory storage for development)
- **Build**: Vite for frontend, esbuild for backend

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/login` - User authentication
- `GET /api/tiktok/auth/url` - TikTok OAuth URL
- `GET /api/tiktok/test` - Test TikTok API connection
- `GET /api/creators/search` - Search creators
- `POST /api/campaigns` - Create campaign
- `GET /api/analytics/dashboard` - Dashboard metrics

## Security Features

- JWT token authentication
- Rate limiting on API endpoints
- CORS configuration
- Input validation with Zod schemas
- Environment variable validation

## License

Private project for TikTok affiliate marketing automation.