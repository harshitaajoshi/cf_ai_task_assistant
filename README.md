# CF AI Task Assistant

An AI-powered Task Assistant Agent built on Cloudflare's platform. This application demonstrates a complete AI agent system with chat interface, state management, memory, and LLM integration.

> **Note**: This repository should be named with the `cf_ai_` prefix (e.g., `cf_ai_task_assistant`) as per assignment requirements.

## Features

- 🤖 **AI-Powered Chat**: Interactive chat interface using Llama 3.3 (70B) on Workers AI
- 📝 **Task Management**: Create, update, and manage tasks with status tracking
- 💾 **Persistent State**: State management using Durable Objects with SQLite
- 🔄 **Real-time Communication**: WebSocket support for real-time chat
- 🧠 **Conversation Memory**: Maintains conversation history for context-aware responses
- ⏰ **Scheduled Tasks**: Automatic cleanup of old tasks

## Architecture

This application uses the following Cloudflare services:

1. **Workers AI** - Runs Llama 3.3 70B model for natural language processing
2. **Durable Objects** - Provides stateful, persistent storage and WebSocket connections
3. **Agents SDK** - Framework for building AI agents with built-in state management
4. **Workers** - Serverless compute for handling HTTP and WebSocket requests

## Components

### 1. LLM Integration
- **Model**: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
- **Provider**: Cloudflare Workers AI
- **Usage**: Powers the chat interface and task assistance

### 2. State & Memory
- **Storage**: Durable Objects with SQLite backend
- **Data**: Tasks, conversation history, user preferences
- **Persistence**: Automatic state synchronization across requests

### 3. User Input (Chat)
- **Protocol**: WebSocket for real-time bidirectional communication
- **Interface**: HTTP endpoint for WebSocket upgrades
- **Features**: Real-time message streaming and state updates

### 4. Workflow/Coordination
- **Agent Class**: Extends Cloudflare Agents SDK
- **Scheduled Tasks**: Daily cleanup of old completed tasks
- **Callable Methods**: Exposed API for task management and chat

## Project Structure

```
.
├── src/
│   ├── index.ts          # Worker entry point and routing
│   ├── agent.ts          # TaskAssistantAgent class
│   └── types.ts          # TypeScript type definitions
├── public/
│   └── index.html        # Test HTML page for WebSocket testing
├── wrangler.toml         # Cloudflare Workers configuration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── README.md             # This file
└── PROMPTS.md            # AI prompts used in development
```

## Prerequisites

- Node.js 18+ and npm
- Cloudflare account
- Wrangler CLI installed globally (or use npx)

## Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Authenticate with Cloudflare:
```bash
npx wrangler login
```

## Running Locally

Start the development server:

```bash
npm run dev
```

Or using wrangler directly:

```bash
npx wrangler dev
```

The server will start on `http://localhost:8787` (or the port shown in the terminal).

## Deployment

Deploy to Cloudflare:

```bash
npm run deploy
```

Or:

```bash
npx wrangler deploy
```

After deployment, you'll receive a URL like `https://cf-ai-task-assistant.your-subdomain.workers.dev`

## Usage

### WebSocket Connection

Connect to the agent via WebSocket:

```javascript
const ws = new WebSocket('wss://your-worker-url.workers.dev/?agentId=my-agent');

ws.onopen = () => {
  console.log('Connected to agent');
  
  // Send a chat message
  ws.send(JSON.stringify({
    method: 'chat',
    params: ['Hello! Can you help me manage my tasks?']
  }));
};

ws.onmessage = (event) => {
  const response = JSON.parse(event.data);
  console.log('Agent response:', response);
};
```

### HTTP API

#### Health Check
```bash
curl https://your-worker-url.workers.dev/health
```

#### Chat via HTTP (using agent namespace)
```bash
curl -X POST https://your-worker-url.workers.dev/api/chat?agentId=my-agent \
  -H "Content-Type: application/json" \
  -d '{"method": "chat", "params": ["Hello!"]}'
```

### Available Methods

The agent exposes the following callable methods:

- `chat(message: string)` - Chat with the AI assistant
- `addTask(title: string, description?: string)` - Add a new task
- `listTasks(status?: string)` - List tasks (optionally filtered by status)
- `updateTaskStatus(taskId: string, status: string)` - Update task status
- `deleteTask(taskId: string)` - Delete a task
- `getConversationHistory()` - Get conversation history
- `clearHistory()` - Clear conversation history

## Example Interaction

1. **Connect to the agent** via WebSocket
2. **Chat**: "I need to finish my project report"
3. **Agent responds**: "I can help you manage that! Would you like me to add 'Finish project report' as a task?"
4. **Add task**: Call `addTask("Finish project report", "Complete the quarterly project report")`
5. **Check tasks**: Call `listTasks()` to see all tasks
6. **Update status**: Call `updateTaskStatus(taskId, "in_progress")` when you start
7. **Complete**: Call `updateTaskStatus(taskId, "completed")` when done

## Testing Components

### Test LLM Integration
```bash
# Connect via WebSocket and send a chat message
# The agent will use Llama 3.3 to respond
```

### Test State Management
```bash
# Add a task, disconnect, reconnect with same agentId
# The task should still be there (persisted in Durable Object)
```

### Test WebSocket
```bash
# Use a WebSocket client to connect and send messages
# Verify real-time bidirectional communication
```

### Test Scheduled Tasks
```bash
# Wait for scheduled cleanup (or manually trigger)
# Verify old completed tasks are removed
```

## Configuration

Edit `wrangler.toml` to configure:
- Worker name
- Durable Object bindings
- AI bindings
- Environment variables

## Development Notes

- The agent maintains conversation history for context
- Tasks are stored in the agent's state (Durable Object)
- WebSocket connections are managed by the Agents SDK
- State changes automatically sync to connected clients

## Troubleshooting

1. **Authentication errors**: Run `npx wrangler login`
2. **Build errors**: Ensure TypeScript and dependencies are installed
3. **WebSocket connection fails**: Check that the URL uses `wss://` (not `ws://`)
4. **AI model not found**: Ensure Workers AI is enabled in your Cloudflare account

## License

MIT

## Author

Built for Cloudflare AI assignment submission.

