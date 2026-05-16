"use client";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { GanttChart } from "lucide-react";

export default function StrategicRoadmapPage() {
  const roadmapData = [
    { year: '2026', title: 'Enterprise AI Evolution', status: 'Active', desc: 'Deploying autonomous intelligence layers across all strategic departments.' },
    { year: '2026', title: 'Global Infrastructure Scale', status: 'Pending', desc: 'Expansion of primary data nodes into APAC and EMEA regions.' },
    { year: '2027', title: 'Neural Synergy Phase 1', status: 'Planned', desc: 'Integration of cross-functional neural networks for predictive analytics.' },
    { year: '2027', title: 'Zero-Latency Governance', status: 'Planned', desc: 'Automated compliance and risk mitigation orchestration.' }
  ];

  return (
    <div className="pb-10 space-y-8">
      <Breadcrumbs />
      
      <div>
        <h2 className="text-4xl font-black tracking-tight text-primary mb-3 uppercase tracking-widest">
          Strategic Roadmap
        </h2>
        <p className="text-muted-foreground font-medium max-w-2xl leading-relaxed">
          Long-term objective sequencing and milestone orchestration across multi-year tactical cycles.
        </p>
      </div>

      <div className="space-y-10 relative before:absolute before:inset-0 before:ml-10 before:-translate-x-px before:h-full before:w-1 before:bg-gradient-to-b before:from-primary before:to-transparent">
        {roadmapData.map((item, index) => (
          <div key={index} className="relative flex items-start gap-12 group">
            <div className="flex items-center justify-center w-20 h-20 rounded-full border-4 border-white bg-primary text-white shrink-0 relative z-10 shadow-xl font-black text-xs">
              {item.year}
            </div>
            
            <div className="flex-1 glass-panel p-8 rounded-[2rem] border border-black/5 hover:bg-black/5 transition-all shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full border ${
                  item.status === 'Active' ? 'bg-green-500/10 text-green-600 border-green-500/10' : 'bg-primary/5 text-primary border-primary/10'
                }`}>
                  {item.status}
                </span>
              </div>
              <h4 className="text-2xl font-black text-primary mb-3">{item.title}</h4>
              <p className="text-sm font-bold text-primary/70 leading-relaxed max-w-2xl">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
