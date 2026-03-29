export type CloudChatMessage = {
  id: string;
  role: "self" | "other";
  content: string;
  created_at: string;
};

export type ConversationHistoryResponse = {
  conversation_id: string;
  messages: CloudChatMessage[];
};

export type ChatSocketEvent =
  | {
      type: "connection_established";
      conversation_id: string;
    }
  | {
      type: "new_message";
      conversation_id: string;
      message: CloudChatMessage;
    }
  | {
      type: "error";
      message: string;
    };

const CHAT_HTTP_BASE_URL = "http://44.223.29.123:8000";
const CHAT_WS_BASE_URL = "ws://44.223.29.123:8000";

export async function fetchConversationHistory(
  conversationId: string
): Promise<ConversationHistoryResponse> {
  const response = await fetch(
    `${CHAT_HTTP_BASE_URL}/chat/history/${encodeURIComponent(conversationId)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch conversation history.");
  }

  return response.json();
}

export function createConversationSocket(
  conversationId: string,
  handlers?: {
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (event: Event) => void;
    onMessage?: (event: ChatSocketEvent) => void;
  }
): WebSocket {
  const socket = new WebSocket(
    `${CHAT_WS_BASE_URL}/chat/ws/${encodeURIComponent(conversationId)}`
  );

  socket.onopen = () => {
    handlers?.onOpen?.();
  };

  socket.onclose = () => {
    handlers?.onClose?.();
  };

  socket.onerror = (event) => {
    handlers?.onError?.(event);
  };

  socket.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data) as ChatSocketEvent;
      handlers?.onMessage?.(parsed);
    } catch (error) {
      console.error("Failed to parse websocket message:", error);
    }
  };

  return socket;
}

export function sendSocketMessage(
  socket: WebSocket,
  payload: {
    role: "self" | "other";
    content: string;
  }
) {
  if (socket.readyState !== WebSocket.OPEN) {
    throw new Error("WebSocket is not open.");
  }

  socket.send(JSON.stringify(payload));
}