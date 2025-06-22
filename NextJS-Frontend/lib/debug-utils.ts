// Debug utilities for API integration testing
export interface DebugInfo {
  timestamp: string;
  user_id?: string;
  user_email?: string;
  api_base_url?: string;
  request_details: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: any;
  };
  response_details: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: any;
  };
  error?: string;
}

export class DebugLogger {
  private logs: DebugInfo[] = [];

  async logRequest(
    url: string,
    options: RequestInit,
    response: Response,
    responseData: any,
    userInfo?: { id?: string; email?: string },
    error?: string,
  ) {
    const debugInfo: DebugInfo = {
      timestamp: new Date().toISOString(),
      user_id: userInfo?.id,
      user_email: userInfo?.email,
      api_base_url: process.env.NEXT_PUBLIC_API_BASE_URL,
      request_details: {
        url,
        method: options.method || "GET",
        headers: this.headersToObject(options.headers),
        body: options.body ? this.parseBody(options.body) : undefined,
      },
      response_details: {
        status: response.status,
        statusText: response.statusText,
        headers: this.headersToObject(response.headers),
        data: responseData,
      },
      error,
    };

    this.logs.push(debugInfo);
    console.group(`🔍 API Debug: ${options.method || "GET"} ${url}`);
    console.log("📤 Request:", debugInfo.request_details);
    console.log("📥 Response:", debugInfo.response_details);
    if (error) console.error("❌ Error:", error);
    console.groupEnd();

    return debugInfo;
  }

  private headersToObject(headers?: HeadersInit): Record<string, string> {
    if (!headers) return {};

    if (headers instanceof Headers) {
      return Object.fromEntries(headers.entries());
    }

    if (Array.isArray(headers)) {
      return Object.fromEntries(headers);
    }

    return headers as Record<string, string>;
  }

  private parseBody(body: BodyInit): any {
    if (typeof body === "string") {
      try {
        return JSON.parse(body);
      } catch {
        return body;
      }
    }
    return body;
  }

  getLogs(): DebugInfo[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  async downloadLogs() {
    const blob = new Blob([this.exportLogs()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `api-debug-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Global debug logger instance
export const debugLogger = new DebugLogger();

// Enhanced API client with debugging
export async function debuggedFetch(
  url: string,
  options: RequestInit = {},
  userInfo?: { id?: string; email?: string },
): Promise<Response> {
  const startTime = Date.now();
  let response: Response;
  let responseData: any;
  let error: string | undefined;

  try {
    // Add default headers
    const defaultHeaders = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const fetchOptions = {
      ...options,
      headers: defaultHeaders,
    };

    console.log(`🚀 Starting request to ${url}`, {
      method: options.method || "GET",
      headers: defaultHeaders,
      body: options.body,
    });

    response = await fetch(url, fetchOptions);

    // Try to parse response
    const responseText = await response.text();
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    const endTime = Date.now();
    console.log(`⏱️ Request completed in ${endTime - startTime}ms`);

    // Log the request/response
    await debugLogger.logRequest(
      url,
      fetchOptions,
      response,
      responseData,
      userInfo,
      error,
    );

    // Create a new response with the text we already read
    return new Response(JSON.stringify(responseData), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
    console.error(`❌ Request failed:`, err);

    // Create a mock response for logging
    response = new Response(null, { status: 0, statusText: "Network Error" });
    responseData = null;

    await debugLogger.logRequest(
      url,
      options,
      response,
      responseData,
      userInfo,
      error,
    );

    throw err;
  }
}

// Network connectivity test
export async function testNetworkConnectivity(): Promise<{
  online: boolean;
  latency?: number;
  backend_reachable: boolean;
  cors_enabled: boolean;
}> {
  const startTime = Date.now();
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  try {
    // Test basic connectivity
    const response = await fetch(`${apiBaseUrl}/health/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const latency = Date.now() - startTime;

    return {
      online: navigator.onLine,
      latency,
      backend_reachable: response.ok,
      cors_enabled: !response.headers.get("access-control-allow-origin")
        ? false
        : true,
    };
  } catch (error) {
    return {
      online: navigator.onLine,
      backend_reachable: false,
      cors_enabled: false,
    };
  }
}
