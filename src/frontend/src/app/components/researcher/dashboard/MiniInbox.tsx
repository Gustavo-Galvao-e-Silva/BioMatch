import { MessageSquare } from "lucide-react";
import { Button } from "../../ui/button";

export function MiniInbox() {
  const chats = [
    { from: "Dr. Smith", msg: "Regarding Patient #442...", time: "2m ago" },
    { from: "Leo HLN", msg: "Interested in Phase II trial", time: "1h ago" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-accent" /> My Messages
      </h2>
      <div className="glass rounded-2xl overflow-hidden divide-y divide-border">
        {chats.map((chat, i) => (
          <div key={i} className="p-4 hover:bg-primary/5 cursor-pointer transition-colors">
            <div className="flex justify-between mb-1">
              <span className="font-bold text-sm">{chat.from}</span>
              <span className="text-[10px] text-muted-foreground">{chat.time}</span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{chat.msg}</p>
          </div>
        ))}
        <div className="p-3 text-center">
          <Button variant="outline" size="sm" className="w-full text-xs">Go to Inbox</Button>
        </div>
      </div>
    </div>
  );
}