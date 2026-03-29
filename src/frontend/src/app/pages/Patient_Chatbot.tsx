import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

type PatientSummary = {
  findings_summary: string;
  confidence_score: number;
};

type ChatState = {
  current_goals: string[];
  patient_summary: PatientSummary;
  awaiting_patient: boolean;
  last_patient_message: string;
  last_doctor_message: string;
};

type ChatApiResponse = {
  state?: ChatState;
  response?: string;
  message?: string;
  end?: boolean;
};

export default function ChatBotPage() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hi! How can I help you today?",
    },
  ]);

  const [chatState, setChatState] = useState<ChatState>({
    current_goals: [
      "Determine duration of symptoms",
      "Check for history of allergies",
      "Confirm if pain is localized",
      "Determine patient age",
      "Determine which country patient is from",
      "Figure out the patient's occupation",
    ],
    patient_summary: {
      findings_summary: "",
      confidence_score: 0.0,
    },
    awaiting_patient: false,
    last_patient_message: "",
    last_doctor_message: "",
  });

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || isSending) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: trimmedInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch(
        "http://localhost:8000/chatbot/post_patient_message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            state: {
              ...chatState,
              last_patient_message: trimmedInput,
            },
            message: trimmedInput,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message.");
      }

      const data: ChatApiResponse = await response.json();

      if (data.state) {
        setChatState(data.state);
      }

      const assistantText =
        data.response ||
        data.message ||
        "The chatbot replied, but no message was returned.";

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: assistantText,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.end === true) {
        navigate("/patient");
        return;
      }
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "Something went wrong while sending your message.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFFAFF]">
      <nav className="border-b border-[#2FCED6]/30 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold text-[#296870]">
            Aura
          </Link>

          <Link
            to="/"
            className="rounded-xl border border-[#2FCED6]/40 px-4 py-2 text-sm font-medium text-[#296870] transition hover:bg-[#EFFAFF]"
          >
            Back
          </Link>
        </div>
      </nav>

      <div className="mx-auto flex h-[calc(100vh-73px)] max-w-5xl flex-col px-4 py-6 sm:px-6">
        <div className="mb-4 rounded-3xl border border-[#2FCED6]/30 bg-white px-6 py-4 shadow-sm">
          <h1 className="text-2xl font-semibold text-[#296870]">Chatbot</h1>
          <p className="mt-1 text-sm text-[#296870]/70">
            Ask questions and get answers in one clean conversation view.
          </p>
        </div>

        <div className="flex-1 overflow-hidden rounded-3xl border border-[#2FCED6]/30 bg-white shadow-xl">
          <div className="flex h-full flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                      message.role === "user"
                        ? "bg-[#0A7F8A] text-[#EFFAFF]"
                        : "border border-[#2FCED6]/30 bg-[#EFFAFF] text-[#296870]"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl border border-[#2FCED6]/30 bg-[#EFFAFF] px-4 py-3 text-sm leading-6 text-[#296870] shadow-sm">
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSend}
              className="border-t border-[#2FCED6]/20 bg-white p-4"
            >
              <div className="flex items-end gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={1}
                  placeholder="Type your message..."
                  disabled={isSending}
                  className="min-h-[48px] flex-1 resize-none rounded-2xl border border-[#2FCED6]/40 bg-[#EFFAFF] px-4 py-3 text-[#296870] outline-none placeholder:text-[#296870]/35 focus:border-[#0A7F8A] focus:ring-2 focus:ring-[#2FCED6]/30 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={isSending}
                  className="rounded-2xl bg-[#0A7F8A] px-5 py-3 font-medium text-[#EFFAFF] transition hover:bg-[#037682] disabled:opacity-60"
                >
                  {isSending ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}