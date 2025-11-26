"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scanner_1 = require("./scanner");
const config_manager_1 = require("./config-manager");
/**
 * Test the MCP server functionality
 */
async function test() {
    console.log('🧪 Testing MCP Server...\n');
    // Test URL - a simple form page
    const testUrl = 'https://www.w3schools.com/html/html_forms.asp';
    try {
        // Test 1: Scan page
        console.log('Test 1: Scanning page...');
        const scanResult = await (0, scanner_1.scanPage)(testUrl);
        console.log(`✅ Scanned ${scanResult.fields.length} fields`);
        console.log('Sample field:', scanResult.fields[0]);
        // Test 2: Update config
        console.log('\nTest 2: Updating config...');
        const config = await (0, config_manager_1.updateConfig)(testUrl, scanResult.fields);
        console.log(`✅ Config saved with ${config.fillRate}% fill rate`);
        console.log('\n✨ All tests passed!');
    }
    catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}
test();
