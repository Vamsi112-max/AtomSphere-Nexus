"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { MessageSquare, Hash, Search, PlusCircle, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "./ChatInterface";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

export function DiscussionBoard() {
  const [discussions, setDiscussions] = useState<any[]>([
    { id: '1', title: 'Q3 Strategic Marketing', type: 'team', createdBy: 'system' },
    { id: '2', title: 'Innovation Pipeline Feedback', type: 'team', createdBy: 'system' },
    { id: '3', title: 'Revenue Growth Target (Mission)', type: 'goal', createdBy: 'system' },
    { id: '4', title: 'Security Infrastructure 2026', type: 'goal', createdBy: 'system' }
  ]);
  const [search, setSearch] = useState("");
  const [activeDiscussion, setActiveDiscussion] = useState<any>({ id: '1', title: 'Q3 Strategic Marketing', type: 'team' });
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchDiscussions = async () => {
      const { data } = await supabase
        .from('discussions')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        const docs = data.map(doc => ({
          id: doc.id,
          title: doc.title,
          type: doc.type,
          createdBy: doc.created_by,
          createdAt: doc.created_at,
        }));
        setDiscussions(docs);
        if (docs.length > 0 && !activeDiscussion) {
          setActiveDiscussion(docs[0]);
        }
      }
    };

    fetchDiscussions();

    const channel = supabase
      .channel('public:discussions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'discussions' }, () => {
        fetchDiscussions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeDiscussion]);

  const handleCreate = async () => {
    if (!newTitle.trim() || !user) return;
    try {
      const { data, error } = await supabase.from('discussions').insert({
        title: newTitle,
        type: "team",
        created_by: user.id,
      }).select().single();
      
      if (error) throw error;
      
      setIsCreating(false);
      setNewTitle("");
      if (data) {
        setActiveDiscussion({ id: data.id, title: data.title, type: data.type });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = discussions.filter(d => d.title?.toLowerCase().includes(search.toLowerCase()));

  const teamDiscussions = filtered.filter(d => d.type === "team");
  const goalDiscussions = filtered.filter(d => d.type === "goal");

  return (
    <div className="grid md:grid-cols-12 gap-6 h-[700px]">
      <div className="md:col-span-4 lg:col-span-3 flex flex-col glass-panel rounded-[2rem] border border-black/5 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-black/5 bg-black/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-primary uppercase tracking-widest">Intelligence Board</h3>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger
                render={
                  <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-black/5 rounded-full">
                    <PlusCircle className="h-5 w-5 text-primary" />
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-[425px] glass-panel border-black/5 p-10">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black text-primary uppercase tracking-widest">Deploy Thread</DialogTitle>
                </DialogHeader>
                <div className="py-8">
                  <Input 
                    placeholder="e.g., Q3 Marketing Strategy" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="pill-input"
                  />
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsCreating(false)} className="rounded-full">Cancel</Button>
                  <Button onClick={handleCreate} disabled={!newTitle.trim()} className="pill-button px-8">
                    Create Thread
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search Intelligence Matrix..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 bg-white/40 border-black/5 rounded-full text-xs font-bold text-primary focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
          <div>
            <p className="px-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">Strategic Channels</p>
            <div className="space-y-2">
              {teamDiscussions.map(d => (
                <button
                  key={d.id}
                  onClick={() => setActiveDiscussion(d)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs text-left transition-all ${
                    activeDiscussion?.id === d.id ? 'bg-primary text-white shadow-lg shadow-primary/20 font-black' : 'hover:bg-black/5 text-muted-foreground font-bold'
                  }`}
                >
                  <Hash className={`h-4 w-4 shrink-0 ${activeDiscussion?.id === d.id ? 'text-white' : 'text-primary/40'}`} />
                  <span className="truncate">{d.title}</span>
                </button>
              ))}
              {teamDiscussions.length === 0 && <p className="text-xs px-3 text-muted-foreground/50">No strategic threads</p>}
            </div>
          </div>

          <div>
            <p className="px-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">Mission Intelligence</p>
            <div className="space-y-2">
              {goalDiscussions.map(d => (
                <button
                  key={d.id}
                  onClick={() => setActiveDiscussion(d)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs text-left transition-all ${
                    activeDiscussion?.id === d.id ? 'bg-primary text-white shadow-lg shadow-primary/20 font-black' : 'hover:bg-black/5 text-muted-foreground font-bold'
                  }`}
                >
                  <Target className={`h-4 w-4 shrink-0 ${activeDiscussion?.id === d.id ? 'text-white' : 'text-primary/40'}`} />
                  <span className="truncate">{d.title}</span>
                </button>
              ))}
              {goalDiscussions.length === 0 && <p className="text-xs px-3 text-muted-foreground/50">No mission intelligence</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="md:col-span-8 lg:col-span-9 h-full">
        {activeDiscussion ? (
          <ChatInterface discussion={activeDiscussion} />
        ) : (
          <div className="h-full glass-panel rounded-[2rem] border border-black/5 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="h-16 w-16 opacity-10 mb-6 text-primary" />
            <p className="font-black text-xs uppercase tracking-widest text-primary/40">Select Intelligence Thread</p>
          </div>
        )}
      </div>
    </div>
  );
}
