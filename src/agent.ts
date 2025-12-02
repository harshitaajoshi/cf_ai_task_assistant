import { Agent, callable } from "agents";
import { ChatMessage } from "./types";

export interface Env {
  AI: Ai;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  createdAt: string;
  completedAt?: string;
}

export interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface TaskAssistantState {
  tasks: Task[];
  conversationHistory: ConversationMessage[];
  preferences: {
    timezone?: string;
    language?: string;
  };
  lastActivity: string;
}

export class TaskAssistantAgent extends Agent<Env, TaskAssistantState> {
  private readonly MAX_HISTORY_LENGTH = 20;

  onStart() {
    // Initialize state if it doesn't exist
    const currentState = this.state;
    if (!currentState || !currentState.tasks) {
      this.setState({
        tasks: [],
        conversationHistory: [],
        preferences: {},
        lastActivity: new Date().toISOString(),
      });
    }

    // Schedule periodic cleanup of old tasks
    this.schedule("daily at 2am", "cleanupOldTasks");
  }

  @callable()
  async addTask(title: string, description?: string): Promise<Task> {
    const task: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description: description || "",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const state = this.state || {
      tasks: [],
      conversationHistory: [],
      preferences: {},
      lastActivity: new Date().toISOString(),
    };
    state.tasks.push(task);
    state.lastActivity = new Date().toISOString();
    this.setState(state);

    // Add to conversation history
    this.addToHistory("assistant", `I've added the task "${title}" to your list.`);

    return task;
  }

  @callable()
  async listTasks(status?: "pending" | "in_progress" | "completed"): Promise<Task[]> {
    const state = this.state || { tasks: [], conversationHistory: [], preferences: {}, lastActivity: new Date().toISOString() };
    let tasks = state.tasks || [];

    if (status) {
      tasks = tasks.filter((task) => task.status === status);
    }

    return tasks;
  }

  @callable()
  async updateTaskStatus(
    taskId: string,
    status: "pending" | "in_progress" | "completed"
  ): Promise<Task | null> {
    const state = this.state || { tasks: [], conversationHistory: [], preferences: {}, lastActivity: new Date().toISOString() };
    const task = (state.tasks || []).find((t) => t.id === taskId);

    if (!task) {
      return null;
    }

    task.status = status;
    if (status === "completed") {
      task.completedAt = new Date().toISOString();
    }

    state.lastActivity = new Date().toISOString();
    this.setState(state);

    this.addToHistory(
      "assistant",
      `I've updated task "${task.title}" to ${status}.`
    );

    return task;
  }

  @callable()
  async deleteTask(taskId: string): Promise<boolean> {
    const state = this.state || { tasks: [], conversationHistory: [], preferences: {}, lastActivity: new Date().toISOString() };
    const taskIndex = (state.tasks || []).findIndex((t) => t.id === taskId);

    if (taskIndex === -1) {
      return false;
    }

    const task = (state.tasks || [])[taskIndex];
    if (state.tasks) {
      state.tasks.splice(taskIndex, 1);
    }
    state.lastActivity = new Date().toISOString();
    this.setState(state);

    this.addToHistory("assistant", `I've deleted the task "${task.title}".`);

    return true;
  }

  @callable()
  async chat(message: string): Promise<string> {
    // Ensure state exists
    const state = this.state || {
      tasks: [],
      conversationHistory: [],
      preferences: {},
      lastActivity: new Date().toISOString(),
    };
    this.setState(state);

    // Add user message to history
    this.addToHistory("user", message);

    // Get recent conversation history for context
    const recentHistory = this.getRecentHistory();

    // Get current tasks for context
    const tasks = state.tasks || [];
    const pendingTasks = tasks.filter((t) => t.status === "pending");
    const inProgressTasks = tasks.filter((t) => t.status === "in_progress");

    // Build system prompt with context
    const systemPrompt = `You are a helpful AI task assistant. You help users manage their tasks and answer questions.

Current Tasks:
- Pending: ${pendingTasks.length} tasks
- In Progress: ${inProgressTasks.length} tasks
- Completed: ${tasks.filter((t) => t.status === "completed").length} tasks

You can help users:
1. Add new tasks
2. List and manage existing tasks
3. Answer questions about their tasks
4. Provide general assistance

Be friendly, concise, and helpful. If the user wants to add a task, suggest they use the addTask function.`;

    // Prepare messages for LLM
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...recentHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    try {
      // Call Llama 3.3 on Workers AI
      const response = await this.env.AI.run(
        "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
        {
          messages: messages as ChatMessage[],
          max_tokens: 512,
        }
      );

      // Workers AI returns the response directly as a string or in a response property
      const assistantMessage = typeof response === 'string' 
        ? response 
        : (response as any).response || String(response) || "I'm here to help!";
      this.addToHistory("assistant", assistantMessage);

      return assistantMessage;
    } catch (error) {
      console.error("AI call failed:", error);
      const errorMessage = "I'm having trouble processing that right now. Please try again.";
      this.addToHistory("assistant", errorMessage);
      return errorMessage;
    }
  }

  @callable()
  async getConversationHistory(): Promise<ConversationMessage[]> {
    const state = this.state || { tasks: [], conversationHistory: [], preferences: {}, lastActivity: new Date().toISOString() };
    return state.conversationHistory || [];
  }

  @callable()
  async clearHistory(): Promise<void> {
    const state = this.state;
    state.conversationHistory = [];
    state.lastActivity = new Date().toISOString();
    this.setState(state);
  }

  async cleanupOldTasks() {
    const state = this.state || { tasks: [], conversationHistory: [], preferences: {}, lastActivity: new Date().toISOString() };
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    state.tasks = (state.tasks || []).filter((task) => {
      if (task.status === "completed" && task.completedAt) {
        return new Date(task.completedAt) > thirtyDaysAgo;
      }
      return true; // Keep pending and in-progress tasks
    });

    // Trim conversation history
    if (state.conversationHistory.length > this.MAX_HISTORY_LENGTH) {
      state.conversationHistory = state.conversationHistory.slice(
        -this.MAX_HISTORY_LENGTH
      );
    }

    state.lastActivity = new Date().toISOString();
    this.setState(state);
  }

  private addToHistory(role: "user" | "assistant" | "system", content: string) {
    const state = this.state || {
      tasks: [],
      conversationHistory: [],
      preferences: {},
      lastActivity: new Date().toISOString(),
    };
    if (!state.conversationHistory) {
      state.conversationHistory = [];
    }
    state.conversationHistory.push({
      role,
      content,
      timestamp: new Date().toISOString(),
    });

    // Keep history within limits
    if (state.conversationHistory.length > this.MAX_HISTORY_LENGTH * 2) {
      state.conversationHistory = state.conversationHistory.slice(
        -this.MAX_HISTORY_LENGTH
      );
    }

    state.lastActivity = new Date().toISOString();
    this.setState(state);
  }

  private getRecentHistory(): ConversationMessage[] {
    const state = this.state || { tasks: [], conversationHistory: [], preferences: {}, lastActivity: new Date().toISOString() };
    const history = state.conversationHistory || [];
    return history.slice(-this.MAX_HISTORY_LENGTH);
  }
}

