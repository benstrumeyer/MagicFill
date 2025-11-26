# Development Data Setup

For easier testing, you can create a `dev-data.json` file that will automatically populate your personal information when the extension loads.

## Setup

1. **Copy the example file:**
   ```bash
   cp personal-data.example.json dev-data.json
   ```

2. **Edit `dev-data.json` with your information:**
   ```json
   {
     "firstName": "Your Name",
     "lastName": "Your Last Name",
     "email": "your.email@example.com",
     ...
   }
   ```

3. **Rebuild the extension:**
   ```bash
   npm run build
   ```

4. **Reload the extension in Chrome**

## How It Works

- The `dev-data.json` file is automatically copied to the `dist` folder during build
- When you open the extension for the first time (or if storage is empty), it automatically loads data from `dev-data.json`
- The file is gitignored so your personal data stays private
- In production (without dev-data.json), the extension works normally

## Benefits

- ✅ No need to manually fill in the Manage Answers page every time
- ✅ Faster testing and development
- ✅ Your data stays private (gitignored)
- ✅ Easy to switch between different test profiles

## Multiple Profiles

You can create multiple test profiles:

```bash
# Create different profiles
cp dev-data.json dev-data-profile1.json
cp dev-data.json dev-data-profile2.json

# Switch profiles
cp dev-data-profile1.json dev-data.json
npm run build
```

## Disabling Auto-Load

To disable auto-loading:
1. Delete or rename `dev-data.json`
2. Rebuild: `npm run build`
3. The extension will use empty defaults

## Security Note

**Never commit `dev-data.json` to git!** It's already in `.gitignore`, but double-check before pushing.

---

Happy testing! ✨
