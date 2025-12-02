import { routeAgentRequest } from "agents";
import { TaskAssistantAgent } from "./agent";

export interface Env {
  AI: Ai;
  TaskAssistantAgent: DurableObjectNamespace<TaskAssistantAgent>;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Route agent requests (handles WebSocket and HTTP)
    // routeAgentRequest automatically detects agents from env bindings
    const agentResponse = await routeAgentRequest(request, env);

    if (agentResponse) {
      return agentResponse;
    }

    const url = new URL(request.url);

    // Serve HTML page
    if (url.pathname === "/" && request.method === "GET") {
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
  <p>Connect via WebSocket: <code>wss://${url.host}/TaskAssistantAgent/your-agent-id</code></p>
  <p>For a full UI, deploy this worker with Pages or use the WebSocket endpoint directly.</p>
  <h2>Endpoints:</h2>
  <ul>
    <li><code>GET /</code> - This page</li>
    <li><code>GET /health</code> - Health check</li>
    <li><code>WebSocket /TaskAssistantAgent/&lt;id&gt;</code> - Connect to agent</li>
  </ul>
</body>
</html>`,
        {
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Health check endpoint
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

    return new Response("Not Found", { status: 404 });
  },
};

