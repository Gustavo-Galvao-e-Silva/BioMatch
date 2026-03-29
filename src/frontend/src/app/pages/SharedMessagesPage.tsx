import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { motion } from "motion/react";
import { MessageCircle, Search, UserRound, Send } from "lucide-react";
import { DashboardLayout } from "../components/shared/DashboardLayout";

type DashboardRole = "patient" | "researcher";

type ChatMessage = {
  id: string;
  role: "self" | "other";
  content: string;
};

type Conversation = {
  id: string;
  name: string;
  roleLabel: string;
  lastMessage: string;
  time: string;
  unread?: number;
  messages: ChatMessage[];
};

type PersonSearchResult = {
  id: number;
  full_name: string;
  email: string | null;
  role: string;
};

type SharedMessagesPageProps = {
  role: DashboardRole;
  title?: string;
  subtitle?: string;
  conversations?: Conversation[];
};

export function SharedMessagesPage({
  role,
  title,
  subtitle,
  conversations,
}: SharedMessagesPageProps) {
  const { user } = useUser();

  const initialConversations: Conversation[] = useMemo(
    () => conversations ?? [],
    [conversations]
  );

  const [conversationList, setConversationList] =
    useState<Conversation[]>(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState(
    initialConversations[0]?.id ?? ""
  );
  const [draftMessage, setDraftMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<PersonSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const runSearch = async () => {
      if (!debouncedSearchTerm) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      try {
        const response = await fetch(
          `http://localhost:8000/chat/search_people?name=${encodeURIComponent(
            debouncedSearchTerm
          )}`
        );

        if (!response.ok) {
          throw new Error("Failed to search people.");
        }

        const data: PersonSearchResult[] = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error(error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    runSearch();
  }, [debouncedSearchTerm]);

  const selectedConversation = useMemo(
    () =>
      conversationList.find(
        (conversation) => conversation.id === selectedConversationId
      ) ?? null,
    [conversationList, selectedConversationId]
  );

  const pageTitle =
    title ?? (role === "patient" ? "My Messages" : "Research Messages");

  const pageSubtitle =
    subtitle ??
    (role === "patient"
      ? "Connect directly with researchers and doctors about your trial journey."
      : "Manage conversations with patients and keep communication organized.");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftMessage.trim() || !selectedConversation) return;

    console.log("Send message to:", selectedConversation.id, draftMessage);

    setConversationList((prev) =>
      prev.map((conversation) =>
        conversation.id === selectedConversation.id
          ? {
              ...conversation,
              lastMessage: draftMessage,
              time: "Now",
              messages: [
                ...conversation.messages,
                {
                  id: `${conversation.id}-${Date.now()}`,
                  role: "self",
                  content: draftMessage,
                },
              ],
            }
          : conversation
      )
    );

    setDraftMessage("");
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowSearchDropdown(false);
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setSearchResults([]);
  };

  const handleSelectSearchResult = (person: PersonSearchResult) => {
    const existingConversation = conversationList.find(
      (conversation) =>
        conversation.name.toLowerCase() === person.full_name.toLowerCase()
    );

    if (existingConversation) {
      setSelectedConversationId(existingConversation.id);
    } else {
      const newConversation: Conversation = {
        id: `search-${person.id}`,
        name: person.full_name,
        roleLabel: person.role,
        lastMessage: "Start a new conversation",
        time: "Now",
        unread: 0,
        messages: [],
      };

      setConversationList((prev) => [newConversation, ...prev]);
      setSelectedConversationId(newConversation.id);
    }

    setShowSearchDropdown(false);
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setSearchResults([]);
  };

  return (
    <DashboardLayout role={role}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="space-y-6"
      >
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-primary">
            {pageTitle},{" "}
            {user?.firstName ||
              (role === "patient" ? "Patient" : "Researcher")}{" "}
            👋
          </h1>
          <p className="text-muted-foreground">{pageSubtitle}</p>
        </header>

        <div className="glass overflow-hidden rounded-3xl border border-border/50">
          <div className="flex h-[72vh] min-h-[600px] flex-col lg:flex-row">
            <aside className="flex w-full flex-col border-b border-border/50 bg-background/40 lg:w-[360px] lg:border-b-0 lg:border-r">
              <div className="border-b border-border/50 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Conversations</h2>
                    <p className="text-sm text-muted-foreground">
                      Browse your active chats
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/70 px-4 py-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowSearchDropdown(true);
                      }}
                      onFocus={() => {
                        if (searchTerm.trim()) setShowSearchDropdown(true);
                      }}
                      placeholder="Search people..."
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </div>

                  {showSearchDropdown && searchTerm.trim() && (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 max-h-72 overflow-y-auto rounded-2xl border border-border/50 bg-background shadow-xl">
                      {isSearching ? (
                        <div className="px-4 py-3 text-sm text-muted-foreground">
                          Searching...
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="p-2">
                          {searchResults.map((person) => (
                            <button
                              key={person.id}
                              type="button"
                              onClick={() => handleSelectSearchResult(person)}
                              className="w-full rounded-xl px-3 py-3 text-left transition hover:bg-muted"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                  <UserRound className="h-4 w-4 text-primary" />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium">
                                    {person.full_name}
                                  </p>
                                  <p className="text-xs capitalize text-muted-foreground">
                                    {person.role}
                                  </p>
                                  {person.email ? (
                                    <p className="mt-1 truncate text-xs text-muted-foreground">
                                      {person.email}
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-3 text-sm text-muted-foreground">
                          No people found.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                <div className="space-y-2">
                  {conversationList.map((conversation) => {
                    const isActive =
                      conversation.id === selectedConversationId;

                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() =>
                          handleSelectConversation(conversation.id)
                        }
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          isActive
                            ? "border-primary/30 bg-primary/5"
                            : "border-transparent bg-background/50 hover:border-border/50 hover:bg-background/80"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                            <UserRound className="h-5 w-5 text-primary" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate font-medium">
                                  {conversation.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {conversation.roleLabel}
                                </p>
                              </div>

                              <div className="flex flex-col items-end gap-1">
                                <span className="text-xs text-muted-foreground">
                                  {conversation.time}
                                </span>
                                {conversation.unread ? (
                                  <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                                    {conversation.unread}
                                  </span>
                                ) : null}
                              </div>
                            </div>

                            <p className="mt-2 truncate text-sm text-muted-foreground">
                              {conversation.lastMessage}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            <section className="flex min-w-0 flex-1 flex-col bg-background/20">
              {selectedConversation ? (
                <>
                  <div className="flex items-center gap-3 border-b border-border/50 px-6 py-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10">
                      <UserRound className="h-5 w-5 text-secondary" />
                    </div>

                    <div>
                      <h2 className="font-semibold">
                        {selectedConversation.name}
                      </h2>
                      <p className="text-sm capitalize text-muted-foreground">
                        {selectedConversation.roleLabel}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    <div className="mx-auto flex max-w-3xl flex-col gap-4">
                      {selectedConversation.messages.length > 0 ? (
                        selectedConversation.messages.map((message) => (
                          <div
                            key={message.id}
                            className={
                              message.role === "self"
                                ? "ml-auto max-w-[75%]"
                                : "max-w-[75%]"
                            }
                          >
                            <div
                              className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                                message.role === "self"
                                  ? "rounded-br-md bg-primary text-primary-foreground"
                                  : "rounded-bl-md bg-muted"
                              }`}
                            >
                              {message.content}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No messages yet. Start the conversation below.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-border/50 px-6 py-4">
                    <form
                      onSubmit={handleSubmit}
                      className="mx-auto flex max-w-3xl items-end gap-3"
                    >
                      <textarea
                        rows={1}
                        value={draftMessage}
                        onChange={(e) => setDraftMessage(e.target.value)}
                        placeholder="Write your message..."
                        className="min-h-[52px] flex-1 resize-none rounded-2xl border border-border/50 bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40"
                      />

                      <button
                        type="submit"
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition hover:opacity-90"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center px-6 text-center text-muted-foreground">
                  Select a conversation to start messaging.
                </div>
              )}
            </section>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}