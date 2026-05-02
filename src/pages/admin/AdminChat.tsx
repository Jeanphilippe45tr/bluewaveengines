import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatUser {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface ChatMsg {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  message: string;
  created_at: string;
}

export default function AdminChat() {
  const { user } = useAuth();
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    // Get unique users who have chatted
    supabase.from("chat_messages").select("sender_id, receiver_id").then(({ data }) => {
      if (!data) return;
      const userIds = new Set<string>();
      data.forEach((m) => {
        if (m.sender_id !== user.id) userIds.add(m.sender_id);
        if (m.receiver_id && m.receiver_id !== user.id) userIds.add(m.receiver_id);
      });
      if (userIds.size > 0) {
        supabase.from("profiles").select("id, full_name, email").in("id", Array.from(userIds)).then(({ data: profiles }) => {
          setChatUsers((profiles as ChatUser[]) || []);
        });
      }
    });
  }, [user]);

  useEffect(() => {
    if (!user || !selectedUser) return;
    const loadMsgs = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser}),and(sender_id.eq.${selectedUser},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });
      setMessages((data as ChatMsg[]) || []);
    };
    loadMsgs();

    const channel = supabase
      .channel("admin-chat-" + selectedUser)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const msg = payload.new as ChatMsg;
        if ((msg.sender_id === user.id && msg.receiver_id === selectedUser) || (msg.sender_id === selectedUser && msg.receiver_id === user.id)) {
          setMessages((prev) => [...prev, msg]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, selectedUser]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !user || !selectedUser) return;
    await supabase.from("chat_messages").insert({ sender_id: user.id, receiver_id: selectedUser, message: newMsg.trim() });
    setNewMsg("");
  };

  return (
    <div className="p-8 h-full">
      <h1 className="text-3xl font-bold font-serif mb-6">Chat</h1>
      <div className="flex gap-4 h-[calc(100vh-200px)]">
        <div className="w-64 border border-border rounded-lg overflow-y-auto bg-card">
          <div className="p-3 border-b border-border font-semibold text-sm">Conversations</div>
          {chatUsers.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No conversations</p>}
          {chatUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelectedUser(u.id)}
              className={`w-full text-left px-4 py-3 border-b border-border text-sm hover:bg-muted transition-colors ${selectedUser === u.id ? "bg-primary/10" : ""}`}
            >
              <p className="font-medium">{u.full_name || "User"}</p>
              <p className="text-xs text-muted-foreground">{u.email}</p>
            </button>
          ))}
        </div>
        <div className="flex-1 border border-border rounded-lg flex flex-col bg-card">
          {!selectedUser ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a conversation</div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${msg.sender_id === user?.id ? "gradient-gold text-primary-foreground" : "bg-muted text-foreground"}`}>
                      {msg.message}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="border-t border-border p-4 flex gap-2">
                <Input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="Type a message..." onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
                <Button onClick={sendMessage} className="gradient-gold text-primary-foreground shadow-gold hover:opacity-90">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}