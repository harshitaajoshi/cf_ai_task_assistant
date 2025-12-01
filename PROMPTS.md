# AI Prompts Used in Development

This document contains the AI prompts used to assist in building this Cloudflare AI application.

## Initial Project Setup

**Prompt**: "I need to build a Cloudflare AI app assignment. The requirements are:
- LLM (Llama 3.3 on Workers AI)
- Workflow/coordination (Workflows, Workers, or Durable Objects)
- User input via chat or voice (Pages or Realtime)
- Memory or state
- Repository name must be prefixed with cf_ai_
- Need README.md and PROMPTS.md files

Please help me create a complete working application with all these components."

## Agent Architecture Design

**Prompt**: "Design a Task Assistant Agent class that:
1. Extends Cloudflare's Agent class
2. Uses Durable Objects for state management
3. Integrates with Workers AI (Llama 3.3)
4. Supports WebSocket connections for real-time chat
5. Has methods for task management (add, list, update, delete)
6. Maintains conversation history
7. Uses scheduled tasks for cleanup"

## WebSocket Integration

**Prompt**: "How do I set up WebSocket connections in a Cloudflare Worker that uses the Agents SDK? I need to:
- Handle WebSocket upgrade requests
- Connect clients to specific agent instances
- Enable bidirectional real-time communication"

## State Management

**Prompt**: "Implement state management in a Cloudflare Agent using Durable Objects. The state should include:
- Array of tasks with properties: id, title, description, status, timestamps
- Conversation history with role, content, timestamp
- User preferences
- Last activity timestamp

Show how to initialize state, update it, and persist changes."

## LLM Integration

**Prompt**: "Integrate Llama 3.3 70B model from Workers AI into a Cloudflare Agent. The integration should:
- Accept user messages
- Include conversation history for context
- Include current task state in system prompt
- Handle errors gracefully
- Return assistant responses"

## System Prompt Design

**Prompt**: "Create a system prompt for a task assistant AI agent. The prompt should:
- Explain the agent's role as a helpful task assistant
- Include context about current tasks (pending, in progress, completed counts)
- Explain available capabilities (add tasks, manage tasks, answer questions)
- Set the tone (friendly, concise, helpful)
- Guide the agent to suggest using functions when appropriate"

## TypeScript Configuration

**Prompt**: "What TypeScript configuration should I use for a Cloudflare Workers project that uses:
- Workers AI
- Durable Objects
- Agents SDK
- Modern ES modules"

## Wrangler Configuration

**Prompt**: "Create a wrangler.toml configuration file for a Cloudflare Worker that:
- Uses Workers AI binding
- Has a Durable Object binding for an Agent class
- Includes migrations for SQLite classes
- Sets appropriate compatibility flags"

## Error Handling

**Prompt**: "How should I handle errors in a Cloudflare Agent when:
- AI model calls fail
- WebSocket connections drop
- Invalid method calls are made
- State updates fail"

## Scheduled Tasks

**Prompt**: "Implement a scheduled task in a Cloudflare Agent that:
- Runs daily at 2am
- Cleans up completed tasks older than 30 days
- Trims conversation history to keep it manageable
- Updates last activity timestamp"

## Documentation

**Prompt**: "Write comprehensive documentation for a Cloudflare AI app that includes:
- Feature overview
- Architecture explanation
- Component breakdown (LLM, state, chat, workflow)
- Installation instructions
- Local development setup
- Deployment steps
- Usage examples
- API reference
- Testing instructions
- Troubleshooting guide"

## Code Structure

**Prompt**: "Organize a Cloudflare Workers project with:
- Entry point (index.ts) for routing
- Agent class in separate file
- Type definitions in separate file
- Proper imports and exports
- Clean separation of concerns"

## Testing Strategy

**Prompt**: "How can I test a Cloudflare AI agent application to verify:
- LLM integration works
- State persists across connections
- WebSocket communication is bidirectional
- Scheduled tasks execute
- All callable methods function correctly"

## Best Practices

**Prompt**: "What are best practices for:
- Managing conversation history length
- Handling WebSocket reconnections
- Structuring agent state
- Error messages for users
- Security considerations for agent methods"

