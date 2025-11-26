# Playwright File Upload Helper

This tool connects to your running Chrome browser and automatically uploads files to detected file input fields.

## Setup

1. **Install dependencies:**
   ```bash
   cd playwright-helper
   npm install
   ```

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` with your file paths:**
   ```env
   RESUME_PATH=C:\Users\YourName\Documents\resume.pdf
   COVER_LETTER_PATH=C:\Users\YourName\Documents\cover-letter.pdf
   ```

## Usage

### Method 1: Connect to Running Chrome

1. **Close Chrome completely**

2. **Start Chrome with debugging enabled:**
   ```bash
   npm run chrome-debug
   ```
   Or manually:
   ```bash
   chrome --remote-debugging-port=9222
   ```

3. **Navigate to the job application page** (with the extension filling other fields)

4. **Run the upload script:**
   ```bash
   npm run upload
   ```

The script will:
- Connect to your Chrome browser
- Find all file upload fields
- Detect what type of file each field needs (resume, cover letter, etc.)
- Upload the appropriate files
- Show you what was uploaded

### Method 2: Standalone Script

You can also import and use the functions in your own scripts:

```typescript
import { connectAndUpload } from './upload-files';

await connectAndUpload({
  resumePath: './resume.pdf',
  coverLetterPath: './cover-letter.pdf'
});
```

## How It Works

1. **Detects file fields** - Finds all `<input type="file">` elements
2. **Reads context** - Checks labels, placeholders, names, and IDs
3. **Matches file type** - Determines if it's asking for resume, cover letter, etc.
4. **Uploads file** - Uses Playwright's `setInputFiles()` to upload

## Field Detection

The script recognizes these field types:

- **Resume/CV** - Keywords: resume, cv
- **Cover Letter** - Keywords: cover letter
- **Transcript** - Keywords: transcript
- **Portfolio** - Keywords: portfolio, sample, work

If a field type is unclear, it defaults to uploading your resume.

## Workflow Example

```bash
# Terminal 1: Start Chrome with debugging
npm run chrome-debug

# Terminal 2: Navigate to job site, fill form with extension, then:
npm run upload
```

Output:
```
🚀 Connecting to Chrome...
📄 Connected to: https://jobs.company.com/apply
🔍 Looking for file upload fields...
📎 Found 2 file upload field(s)

📋 Field context: upload your resume
  → Detected: Resume field
  ✅ Uploaded: resume.pdf

📋 Field context: cover letter optional
  → Detected: Cover Letter field
  ✅ Uploaded: cover-letter.pdf

✨ File upload complete!
✅ Done!
```

## Troubleshooting

### "No browser contexts found"
- Make sure Chrome is running with `--remote-debugging-port=9222`
- Close all Chrome instances and restart with the debug flag

### "File not found"
- Check your `.env` file paths
- Use absolute paths (e.g., `C:\Users\...`)
- Make sure the files exist

### "Connection refused"
- Chrome isn't running with debugging enabled
- Try: `chrome --remote-debugging-port=9222`

## Integration with Extension

This tool works perfectly with the MagicFill extension:

1. Extension fills text fields (name, email, etc.)
2. Extension highlights file upload fields in blue
3. You run this script to upload files
4. Complete automation!

## Future: Full Automation

In Phase 2, we'll integrate this directly into the MCP server for fully automated job applications including file uploads.

---

Happy uploading! 📎✨
