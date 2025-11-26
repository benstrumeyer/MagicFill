import express from 'express';
import cors from 'cors';
import { scanPage } from './scanner';
import { updateConfig } from './config-manager';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'magicfill-mcp-server' });
});

// Scan a page and return field mappings
app.post('/scan', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    console.log(`Scanning page: ${url}`);
    const result = await scanPage(url);
    
    res.json(result);
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ 
      error: 'Failed to scan page',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update form config
app.post('/update-config', async (req, res) => {
  try {
    const { url, fields } = req.body;
    
    if (!url || !fields) {
      return res.status(400).json({ error: 'URL and fields are required' });
    }
    
    console.log(`Updating config for: ${url}`);
    const result = await updateConfig(url, fields);
    
    res.json(result);
  } catch (error) {
    console.error('Config update error:', error);
    res.status(500).json({ 
      error: 'Failed to update config',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MagicFill MCP Server running on http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
