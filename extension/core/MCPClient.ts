/**
 * Client for communicating with the MCP server
 */
export class MCPClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Check if MCP server is running
   */
  async isServerRunning(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000), // 2 second timeout
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Scan the current page for form fields
   */
  async scanPage(url: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`MCP scan failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Update form configuration
   */
  async updateConfig(url: string, fields: any[]): Promise<any> {
    const response = await fetch(`${this.baseUrl}/update-config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, fields }),
    });

    if (!response.ok) {
      throw new Error(`MCP config update failed: ${response.statusText}`);
    }

    return await response.json();
  }
}
