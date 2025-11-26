# MagicFill Playwright Analysis Server

Intelligent form analysis server that uses Playwright to deeply analyze job application forms and generate reusable profiles.

## Features

- 🔍 **Deep Form Analysis** - Detects all fields, types, and relationships
- 🎯 **Platform Detection** - Identifies Greenhouse, Lever, Workday, etc.
- 📋 **Custom Dropdown Handling** - Analyzes non-native select elements
- 📄 **Multi-Page Detection** - Maps form flow across pages
- ⚡ **Fast & Reusable** - Generate once, use for all jobs on that platform

## Installation

```bash
cd playwright-server
npm install
npx playwright install chromium
```

## Usage

### Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm run build
npm start
```

Server will run on `http://localhost:3000`

### Test Analyzer

```bash
# Test with default URL
npm test

# Test with custom URL
npm test https://jobs.lever.co/company/job-id
```

## API Endpoints

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "browserReady": true
}
```

### `POST /analyze`

Analyze a job application form.

**Request:**
```json
{
  "url": "https://job-boards.greenhouse.io/company/jobs/123",
  "waitForSelector": "#first_name",  // optional
  "timeout": 30000                    // optional
}
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "platform": "greenhouse",
    "url": "https://...",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "fields": {
      "first_name": {
        "selector": "#first_name",
        "type": "text",
        "label": "First Name",
        "required": true
      },
      "gender": {
        "selector": "#gender",
        "type": "text",
        "isCustomDropdown": true,
        "dropdownStrategy": "click-input",
        "options": ["Male", "Female", "Non-binary", "Prefer not to say"]
      }
    },
    "pages": [
      {
        "name": "page_1",
        "fields": ["first_name", "last_name", "email"],
        "nextButton": "button:has-text('Next')"
      }
    ],
    "totalFields": 20,
    "hasMultiPage": true,
    "customDropdownCount": 3
  },
  "duration": 5432
}
```

## Configuration

Edit `.env` file:

```env
PORT=3000
NODE_ENV=development
HEADLESS=true
TIMEOUT=30000
```

## Architecture

```
playwright-server/
├── src/
│   ├── server.ts                    # Express server
│   ├── ProfileGenerator.ts          # Main orchestrator
│   ├── PlatformDetector.ts          # Platform identification
│   ├── analyzers/
│   │   ├── FieldAnalyzer.ts         # Field detection
│   │   └── MultiPageDetector.ts     # Page flow detection
│   ├── types/
│   │   └── profile.ts               # TypeScript types
│   └── test-analyzer.ts             # Test script
├── package.json
├── tsconfig.json
└── .env
```

## How It Works

1. **Receive URL** - Extension sends job application URL
2. **Launch Browser** - Playwright opens the page
3. **Analyze Fields** - Detect all form fields and their properties
4. **Detect Patterns** - Identify custom dropdowns, multi-page flows
5. **Generate Profile** - Create reusable JSON profile
6. **Return to Extension** - Extension caches and uses profile

## Supported Platforms

- ✅ Greenhouse
- ✅ Lever
- ✅ Workday
- ✅ Ashby
- ✅ BambooHR
- ✅ JazzHR
- ✅ SmartRecruiters
- ✅ Generic (fallback)

## Troubleshooting

### Browser not launching
```bash
npx playwright install chromium
```

### Port already in use
Change `PORT` in `.env` file

### Timeout errors
Increase `TIMEOUT` in `.env` file

## Next Steps

1. Start the server: `npm run dev`
2. Test with a job URL: `npm test <url>`
3. Integrate with Chrome extension
4. Apply to jobs!
