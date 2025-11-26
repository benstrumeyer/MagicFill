# MagicFill MCP Server

Model Context Protocol server for learning form field mappings using Playwright.

## What It Does

The MCP server enables the extension to learn new forms automatically:

1. **Scans pages** - Uses Playwright to extract all form fields
2. **Generates configs** - Creates field mappings for each site
3. **Iterative learning** - Improves fill rate with each scan
4. **Persistent storage** - Saves configs for reuse

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build:**
   ```bash
   npm run build
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

The server will run on `http://localhost:3000`

## API Endpoints

### Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "service": "magicfill-mcp-server"
}
```

### Scan Page
```bash
POST /scan
Content-Type: application/json

{
  "url": "https://jobs.company.com/apply"
}
```

Response:
```json
{
  "url": "https://jobs.company.com/apply",
  "fields": [
    {
      "selector": "#firstName",
      "type": "unknown",
      "context": "First Name firstName",
      "fieldType": "input",
      "inputType": "text",
      "label": "First Name"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z",
  "success": true
}
```

### Update Config
```bash
POST /update-config
Content-Type: application/json

{
  "url": "https://jobs.company.com/apply",
  "fields": [...]
}
```

Response:
```json
{
  "urlPattern": "jobs.company.com",
  "siteName": "jobs.company.com",
  "learnedAt": "2024-01-01T00:00:00.000Z",
  "lastUpdated": "2024-01-01T00:00:00.000Z",
  "scanIterations": 1,
  "fillRate": 75,
  "fields": [...]
}
```

## How It Works

### 1. Initial Scan
```
Extension → MCP Server → Playwright → Scan Page → Return Fields
```

### 2. Learning Loop
```
Scan → Match Fields → Fill Form → Detect Unfilled → Scan Again → Improve
```

### 3. Config Storage
Configs are saved in `../shared/configs/` as JSON files:
```
shared/configs/
  ├── jobs.company.com.json
  ├── greenhouse.io.json
  └── lever.co.json
```

## Integration with Extension

The extension can call the MCP server to learn new forms:

```typescript
// In content script
const response = await fetch('http://localhost:3000/scan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: window.location.href })
});

const { fields } = await response.json();
// Use fields to improve matching
```

## Development

```bash
# Watch mode
npm run watch

# Build
npm run build

# Start
npm start

# Dev mode (watch + restart)
npm run dev
```

## Example Workflow

1. **User encounters unknown form**
2. **Extension detects low fill rate** (e.g., 30%)
3. **Extension calls MCP `/scan`**
4. **MCP scans page with Playwright**
5. **MCP returns field mappings**
6. **Extension updates local config**
7. **Extension retries fill** → 100% fill rate!

## Future Enhancements

- AI-powered field type detection
- Multi-page form support
- Screenshot capture for debugging
- Field value suggestions
- Automatic form submission

---

Part of MagicFill Phase 2: MCP Learning System ✨
