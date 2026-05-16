import { 
  LayoutDashboard, 
  Target, 
  PlusCircle, 
  Copy, 
  Share2, 
  Users, 
  CheckSquare, 
  LineChart, 
  FileText, 
  Bell, 
  Calendar, 
  MessageSquare, 
  History, 
  Settings, 
  HelpCircle, 
  ShieldCheck, 
  UserCog, 
  Activity, 
  AlertTriangle,
  Briefcase,
  Network,
  GanttChart,
  Lock,
  LogOut
} from "lucide-react";

export type Role = "employee" | "manager" | "admin";

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  roles: Role[];
  isBottom?: boolean;
}

export const navigationConfig: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["employee", "manager", "admin"] },
  { title: "My Goals", href: "/my-goals", icon: Target, roles: ["employee", "manager", "admin"] },
  { title: "Create Goals", href: "/create-goals", icon: PlusCircle, roles: ["employee", "manager", "admin"] },
  { title: "Goal Templates", href: "/templates", icon: Copy, roles: ["employee", "manager", "admin"] },
  { title: "Shared Goals", href: "/shared-goals", icon: Share2, roles: ["employee", "manager", "admin"] },
  { title: "Team Goals", href: "/team-goals", icon: Users, roles: ["employee", "manager", "admin"] },
  { title: "Department KPIs", href: "/department-kpis", icon: Activity, roles: ["employee", "manager", "admin"] },
  { title: "Check-ins", href: "/quarterly-check-ins", icon: CheckSquare, roles: ["employee", "manager", "admin"] },
  { title: "Analytics", href: "/analytics", icon: LineChart, roles: ["employee", "manager", "admin"] },
  { title: "Reports", href: "/reports", icon: FileText, roles: ["employee", "manager", "admin"] },
  { title: "Notifications", href: "/notifications", icon: Bell, roles: ["employee", "manager", "admin"] },
  { title: "Calendar", href: "/calendar", icon: Calendar, roles: ["employee", "manager", "admin"] },
  { title: "Discussions", href: "/discussions", icon: MessageSquare, roles: ["employee", "manager", "admin"] },
  { title: "Audit Logs", href: "/admin/audit", icon: History, roles: ["employee", "manager", "admin"] },
  { title: "Company", href: "/company", icon: Briefcase, roles: ["employee", "manager", "admin"] },
  { title: "Team Structure", href: "/structure", icon: Network, roles: ["employee", "manager", "admin"] },
  { title: "Roadmap", href: "/roadmap", icon: GanttChart, roles: ["employee", "manager", "admin"] },
  { title: "Governance", href: "/governance", icon: Lock, roles: ["employee", "manager", "admin"] },
  { title: "Support", href: "/support", icon: HelpCircle, roles: ["employee", "manager", "admin"] },
  { title: "Settings", href: "/settings", icon: Settings, roles: ["employee", "manager", "admin"] },
  { title: "Admin Center", href: "/admin", icon: ShieldCheck, roles: ["employee", "manager", "admin"] },
];
