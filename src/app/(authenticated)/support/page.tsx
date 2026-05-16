"use client";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { 
  HelpCircle, 
  Book, 
  MessageSquare, 
  LifeBuoy, 
  ExternalLink,
  Search,
  ChevronRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const faqs = [
  { question: "How do I create a new goal?", answer: "Navigate to the 'Create Goals' section in your sidebar. Fill out the multi-goal form, ensuring your total weightage equals exactly 100%." },
  { question: "How are quarterly check-ins tracked?", answer: "Each quarter, you can update your achievement values in the 'Quarterly Check-ins' module. Managers can then provide narrative feedback." },
  { question: "What is the escalation workflow?", answer: "If a goal is not submitted or approved within the defined SLAs, it automatically escalates from Employee to Manager, and finally to HR/Admin." },
  { question: "Can I edit an approved goal?", answer: "Once approved, goals are locked. Only an Admin can unlock a goal for modification." },
];

export default function SupportPage() {
  return (
    <div className="pb-10 space-y-6">
      <Breadcrumbs />
      
      <div className="text-center mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex p-3 bg-primary/10 rounded-2xl mb-4"
        >
          <LifeBuoy className="h-8 w-8 text-primary" />
        </motion.div>
        <h2 className="text-4xl font-black text-white mb-4">How can we <span className="text-primary">help?</span></h2>
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search documentation, FAQs, or support articles..." 
            className="pl-12 h-12 glass-panel border-white/10 rounded-2xl"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-12">
        {[
          { title: "Documentation", desc: "Detailed guides on every Nexus module.", icon: Book, color: "text-blue-400" },
          { title: "Community", desc: "Join discussions with other users.", icon: MessageSquare, color: "text-purple-400" },
          { title: "Contact Admin", desc: "Direct line for system-level issues.", icon: HelpCircle, color: "text-green-400" },
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-8 rounded-3xl border border-white/10 hover:border-primary/50 group cursor-pointer"
          >
            <item.icon className={`h-8 w-8 mb-4 ${item.color}`} />
            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground mb-6">{item.desc}</p>
            <div className="flex items-center text-primary text-sm font-bold">
              Learn More <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-white/10">
        <h3 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h3>
        <div className="grid gap-6 md:grid-cols-2">
          {faqs.map((faq, i) => (
            <div key={i} className="space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {faq.question}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-primary/10 to-transparent flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Still need help?</h3>
          <p className="text-sm text-muted-foreground">Our support team is available 24/7 for enterprise-level assistance.</p>
        </div>
        <Button className="bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:bg-primary/90 h-12 px-8 rounded-xl">
          Submit Support Ticket
        </Button>
      </div>
    </div>
  );
}
