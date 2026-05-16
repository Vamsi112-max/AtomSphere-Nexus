"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Send, Paperclip, Loader2, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createNotification } from "@/lib/notifications";

interface ChatInterfaceProps {
  discussion: any;
}

export function ChatInterface({ discussion }: ChatInterfaceProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!discussion) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('discussion_messages')
        .select('*')
        .eq('discussion_id', discussion.id)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data.map(doc => ({
          id: doc.id,
          discussionId: doc.discussion_id,
          userId: doc.user_id,
          userName: doc.user_name,
          userPhoto: doc.user_photo,
          text: doc.text,
          mentions: doc.mentions,
          createdAt: doc.created_at,
        })));
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`discussion_${discussion.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'discussion_messages', filter: `discussion_id=eq.${discussion.id}` }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [discussion]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !discussion) return;
    setIsSending(true);

    try {
      const mentions = newMessage.match(/@(\w+)/g) || [];
      const cleanMentions = mentions.map(m => m.substring(1));

      await supabase.from('discussion_messages').insert({
        discussion_id: discussion.id,
        user_id: user.id,
        user_name: user.user_metadata?.name || "User",
        user_photo: null,
        text: newMessage,
        mentions: cleanMentions,
      });

      if (cleanMentions.length > 0) {
        const { data: usersData } = await supabase.from('users').select('*');
        const mentionedUsers = usersData ? usersData.filter(data => {
          return data.name && cleanMentions.some(m => data.name.toLowerCase().includes(m.toLowerCase()));
        }) : [];
        
        for (const mUser of mentionedUsers) {
          if (mUser.id !== user.id) {
            await createNotification(
              mUser.id,
              "You were mentioned",
              `${user.user_metadata?.name || 'Someone'} mentioned you in: ${discussion.title}`,
              "system",
              "/discussions"
            );
          }
        }
      }

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTextWithMentions = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        return <span key={i} className="text-primary font-semibold">{part}</span>;
      }
      return part;
    });
  };

  if (!discussion) return null;

  return (
    <div className="flex flex-col h-[700px] glass-panel rounded-[2rem] border border-black/5 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-black/5 bg-black/5">
        <h3 className="font-black text-xl text-primary">{discussion.title}</h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black mt-1">
          {discussion.type} Mission Channel
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar bg-white/20">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
             <MessageSquare className="h-12 w-12 opacity-5 mb-4 text-primary" />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary/30">Intelligence stream empty</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.userId === user?.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-4 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <Avatar className="h-10 w-10 shrink-0 border border-black/5 shadow-sm">
                  <AvatarFallback className="bg-primary/10 text-primary font-black">
                    {msg.userName?.[0].toUpperCase() || <UserIcon className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-baseline gap-2 mb-2 px-1">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{msg.userName}</span>
                    <span className="text-[9px] text-muted-foreground font-bold uppercase">
                      {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : 'Just now'}
                    </span>
                  </div>
                  <div className={`p-5 rounded-[2rem] text-sm font-bold shadow-sm leading-relaxed ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-white border border-black/5 text-primary rounded-tl-none'}`}>
                    <p className="whitespace-pre-wrap">{formatTextWithMentions(msg.text)}</p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-black/5 border-t border-black/5">
        <div className="flex gap-4 items-end">
          <Button variant="ghost" size="icon" className="shrink-0 h-12 w-12 text-muted-foreground hover:text-primary hover:bg-white/60 rounded-full transition-all">
            <Paperclip className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type mission update... Use @ to mention operative"
              className="min-h-[56px] max-h-[150px] bg-white border-black/5 resize-none py-4 px-6 pr-16 focus-visible:ring-primary/10 rounded-[1.5rem] font-bold text-primary placeholder:text-muted-foreground/30 shadow-sm transition-all"
              rows={1}
            />
            <Button 
              size="icon" 
              className="absolute right-2 bottom-2 h-10 w-10 bg-primary text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
              onClick={handleSend}
              disabled={isSending || !newMessage.trim()}
            >
              {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
