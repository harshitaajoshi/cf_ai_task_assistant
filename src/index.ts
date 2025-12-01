import { AgentNamespace } from "agents";
import { TaskAssistantAgent } from "./agent";

export interface Env {
  AI: Ai;
  TaskAssistantAgent: DurableObjectNamespace<TaskAssistantAgent>;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle WebSocket upgrade requests
    if (request.headers.get("Upgrade") === "websocket") {
      const agentNamespace = new AgentNamespace(env.TaskAssistantAgent);
      const agentId = url.searchParams.get("agentId") || "default";
      return agentNamespace.connect(agentId, request);
    }

    // Serve HTML page
    if (url.pathname === "/" && request.method === "GET") {
      // Try to serve static HTML if available, otherwise return API info
      return new Response(
        `<!DOCTYPE html>
<html>
<head>
  <title>CF AI Task Assistant</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  <h1>CF AI Task Assistant API</h1>
  <p>Connect via WebSocket: <code>wss://${url.host}/?agentId=your-agent-id</code></p>
  <p>For a full UI, deploy this worker with Pages or use the WebSocket endpoint directly.</p>
  <h2>Endpoints:</h2>
  <ul>
    <li><code>GET /</code> - This page</li>
    <li><code>GET /health</code> - Health check</li>
    <li><code>WebSocket /?agentId=&lt;id&gt;</code> - Connect to agent</li>
  </ul>
</body>
</html>`,
        {
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Handle HTTP requests
    if (url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "ok",
          message: "Task Assistant Agent API",
          endpoints: {
            websocket: "/?agentId=<agentId>",
            health: "/health"
          }
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Proxy to agent for HTTP requests
    if (url.pathname.startsWith("/api/")) {
      const agentNamespace = new AgentNamespace(env.TaskAssistantAgent);
      const agentId = url.searchParams.get("agentId") || "default";
      const agent = await agentNamespace.get(agentId);
      return agent.fetch(request);
    }

    return new Response("Not Found", { status: 404 });
  },
};

