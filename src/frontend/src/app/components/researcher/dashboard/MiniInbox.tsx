import { MessageSquare } from "lucide-react";
import { Button } from "../../ui/button";

export function MiniInbox() {
  const chats: { from: string; msg: string; time: string }[] = [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-accent" /> My Messages
      </h2>
      <div className="glass rounded-2xl overflow-hidden divide-y divide-border">
        {chats.length > 0 ? (
          chats.map((chat, i) => (
            <div key={i} className="p-4 hover:bg-primary/5 cursor-pointer transition-colors">
              <div className="flex justify-between mb-1">
                <span className="font-bold text-sm">{chat.from}</span>
                <span className="text-[10px] text-muted-foreground">{chat.time}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{chat.msg}</p>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">No messages yet. Data will be loaded from API.</p>
          </div>
        )}
        <div className="p-3 text-center">
          <Button variant="outline" size="sm" className="w-full text-xs">Go to Inbox</Button>
        </div>
      </div>
    </div>
  );
}