"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Plus, Trash2, Search, Target, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export function TemplateList() {
  const [templates, setTemplates] = useState<any[]>([
    { id: '1', title: 'Revenue Growth 2026', description: 'Accelerate enterprise revenue through AI-driven sales orchestration.', uom: '$M', targetValue: 50, thrustArea: 'Financial' },
    { id: '2', title: 'Innovation Velocity', description: 'Increase the rate of new feature deployment by 40% using automated CI/CD.', uom: '%', targetValue: 40, thrustArea: 'Innovation' },
    { id: '3', title: 'Customer Retention Matrix', description: 'Maintain high-value customer satisfaction scores above 9.5.', uom: 'Score', targetValue: 9.5, thrustArea: 'Customer' },
    { id: '4', title: 'Security Protocol Alpha', description: 'Implement zero-trust architecture across all cloud nodes.', uom: '%', targetValue: 100, thrustArea: 'Infrastructure' }
  ]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    title: "",
    description: "",
    uom: "",
    targetValue: "",
    thrustArea: ""
  });

  const fetchTemplates = async () => {
    try {
      const { data } = await supabase.from('goal_templates').select('*');
      if (data && data.length > 0) {
        setTemplates(data.map(doc => ({
          id: doc.id,
          title: doc.title,
          description: doc.description,
          uom: doc.uom,
          targetValue: doc.target,
          thrustArea: doc.thrust_area,
          createdBy: doc.created_by,
        })));
      }
    } catch (error) {
      console.warn("Using offline intelligence matrix");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleAddTemplate = async () => {
    if (!newTemplate.title || !newTemplate.description) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await supabase.from('goal_templates').insert({
        title: newTemplate.title,
        description: newTemplate.description,
        uom: newTemplate.uom,
        target: Number(newTemplate.targetValue),
        thrust_area: newTemplate.thrustArea,
        created_by: user?.id
      });
      toast.success("Template created successfully");
      setIsDialogOpen(false);
      setNewTemplate({ title: "", description: "", uom: "", targetValue: "", thrustArea: "" });
      fetchTemplates();
    } catch (error) {
      toast.error("Failed to create template");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Permanently remove this strategic blueprint?")) {
      try {
        const { error } = await supabase.from('goal_templates').delete().eq('id', id);
        if (error) throw error;
        toast.success("Strategic blueprint terminated");
        fetchTemplates();
      } catch (error) {
        toast.error("Failed to terminate blueprint");
      }
    }
  };

  const handleDeploy = async (template: any) => {
    if (!user) {
      toast.error("Authentication required for deployment");
      return;
    }

    try {
      const { error } = await supabase.from('goals').insert({
        employee_id: user.id,
        title: template.title,
        description: template.description,
        uom: template.uom,
        target: template.targetValue,
        thrust_area: template.thrustArea,
        status: 'pending',
        quarter: `Q${Math.floor((new Date().getMonth() + 3) / 3)}`,
      });

      if (error) throw error;
      toast.success(`'${template.title}' has been deployed to your missions`);
    } catch (error) {
      toast.error("Deployment failed");
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.thrustArea.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between gap-6">
        <div className="relative w-full max-w-sm group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            placeholder="Search Intelligence Matrix..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/40 border-white/60 pl-11 h-12 rounded-full focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="pill-button h-12">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-panel border-white/80 max-w-lg p-10">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-primary uppercase tracking-widest">Create Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-8">
              <div className="space-y-2">
                <Label className="ml-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Title</Label>
                <Input 
                  value={newTemplate.title}
                  onChange={e => setNewTemplate({...newTemplate, title: e.target.value})}
                  className="pill-input"
                  placeholder="e.g. Revenue Growth Target"
                />
              </div>
              <div className="space-y-2">
                <Label className="ml-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</Label>
                <Textarea 
                  value={newTemplate.description}
                  onChange={e => setNewTemplate({...newTemplate, description: e.target.value})}
                  className="rounded-[2rem] bg-white/60 border-white/80 min-h-[120px] px-6 py-4 focus:bg-white transition-all"
                  placeholder="Detailed breakdown of the goal..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="ml-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">UOM</Label>
                  <Input 
                    value={newTemplate.uom}
                    onChange={e => setNewTemplate({...newTemplate, uom: e.target.value})}
                    className="pill-input"
                    placeholder="%, $, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="ml-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Value</Label>
                  <Input 
                    type="number"
                    value={newTemplate.targetValue}
                    onChange={e => setNewTemplate({...newTemplate, targetValue: e.target.value})}
                    className="pill-input"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="ml-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Thrust Area</Label>
                <Input 
                  value={newTemplate.thrustArea}
                  onChange={e => setNewTemplate({...newTemplate, thrustArea: e.target.value})}
                  className="pill-input"
                  placeholder="Innovation, Financial, etc."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-full">Cancel</Button>
              <Button onClick={handleAddTemplate} className="pill-button">Create Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center p-24">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="soft-card group relative"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary transition-colors duration-500">
                    <FileText className="h-6 w-6 text-primary group-hover:text-white" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <div className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-black/5 cursor-pointer transition-all">
                        <MoreHorizontal className="h-5 w-5 text-primary" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-panel border-white/80 p-2 min-w-[160px]">
                      <DropdownMenuItem onClick={() => handleDelete(template.id)} className="text-destructive rounded-xl p-3 focus:bg-red-50">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Template
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h4 className="text-xl font-black text-foreground mb-3 line-clamp-1 group-hover:text-primary transition-colors">{template.title}</h4>
                <p className="text-xs font-medium text-muted-foreground mb-8 line-clamp-2 h-10 leading-relaxed">{template.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-black/5 p-4 rounded-3xl border border-black/5">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Unit</p>
                    <p className="text-lg font-black text-foreground">{template.uom || "N/A"}</p>
                  </div>
                  <div className="bg-black/5 p-4 rounded-3xl border border-black/5">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Target</p>
                    <p className="text-lg font-black text-foreground">{template.targetValue || "0"}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-black/5 flex justify-between items-center">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{template.thrustArea || "STRATEGIC"}</span>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleDeploy(template)}
                    className="text-xs font-black text-primary hover:bg-primary/5 px-4 rounded-full"
                  >
                    Deploy <Copy className="h-3 w-3 ml-2" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
