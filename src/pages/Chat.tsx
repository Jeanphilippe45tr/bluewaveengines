import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatMsg {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  message: string;
  created_at: string;
  is_read: boolean;
}

export default function Chat() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [adminId, setAdminId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    // Find admin user
    supabase.from("profiles").select("id").eq("is_admin", true).limit(1).single().then(({ data }) => {
      if (data) setAdminId(data.id);
    });
  }, [user, navigate]);

  useEffect(() => {
    if (!user || !adminId) return;
    const loadMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${adminId}),and(sender_id.eq.${adminId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });
      setMessages((data as ChatMsg[]) || []);
    };
    loadMessages();

    const channel = supabase
      .channel("chat-" + user.id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const msg = payload.new as ChatMsg;
        if ((msg.sender_id === user.id && msg.receiver_id === adminId) || (msg.sender_id === adminId && msg.receiver_id === user.id)) {
          setMessages((prev) => [...prev, msg]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, adminId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !user || !adminId) return;
    await supabase.from("chat_messages").insert({ sender_id: user.id, receiver_id: adminId, message: newMsg.trim() });
    setNewMsg("");
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold font-serif mb-6">Chat with <span className="text-gradient-gold">Support</span></h1>
        <div className="border border-border rounded-lg h-[500px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && <p className="text-center text-muted-foreground py-8">Start a conversation with our team!</p>}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender_id === user.id ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${msg.sender_id === user.id ? "gradient-gold text-primary-foreground" : "bg-muted text-foreground"}`}>
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
        </div>
      </div>
    </Layout>
  );
}