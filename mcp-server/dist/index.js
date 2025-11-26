"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const scanner_1 = require("./scanner");
const config_manager_1 = require("./config-manager");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
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
        const result = await (0, scanner_1.scanPage)(url);
        res.json(result);
    }
    catch (error) {
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
        const result = await (0, config_manager_1.updateConfig)(url, fields);
        res.json(result);
    }
    catch (error) {
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
