import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Coffee, Factory, Package, ShoppingCart, DollarSign, Users, TrendingUp,
  Clock, FileText, ArrowRight,
  UserPlus, Receipt, ClipboardList, Tractor, AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { ROLES, ROLE_LABELS } from "../../utils/constants";
import StatCard from "../../components/ui/StatCard";


function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function getRoleConfig(role) {
  switch (role) {
    case ROLES.ADMIN:
      return {
        subtitle: "Here's your management overview",
        stats: [
          { label: "Tea Collected Today", value: "1,250 kg", change: "+12%", up: true, icon: Coffee, color: "text-primary", bg: "bg-primary/10", borderColor: "#2E7D32" },
          { label: "Production Today", value: "320 kg", change: "+8%", up: true, icon: Factory, color: "text-info", bg: "bg-info/10", borderColor: "#0288D1" },
          { label: "Active Employees", value: "48", change: "On shift", up: true, icon: Users, color: "text-purple-600", bg: "bg-purple-100", borderColor: "#9333EA" },
          { label: "Monthly Revenue", value: "$128,500", change: "+22%", up: true, icon: DollarSign, color: "text-accent-dark", bg: "bg-accent/10", borderColor: "#F9A825" },
        ],
        quickActions: [
          { label: "Record Collection", icon: Coffee, to: "/collections/new", color: "bg-primary" },
          { label: "New Production", icon: Factory, to: "/production/new", color: "bg-secondary" },
          { label: "Add Farmer", icon: UserPlus, to: "/farmers/new", color: "bg-info" },
          { label: "View Reports", icon: ClipboardList, to: "/reports", color: "bg-purple-600" },
        ],
        activities: [
          { id: 1, icon: Coffee, description: "Collection recorded: 450 kg from Kigali cooperative", time: "12 min ago", module: "Collection", color: "text-primary", bg: "bg-primary/10" },
          { id: 2, icon: Factory, description: "Batch #1042 completed: 320 kg green tea", time: "2 hrs ago", module: "Production", color: "text-secondary", bg: "bg-secondary/10" },
          { id: 3, icon: Users, description: "Shift assignment updated for evening crew", time: "3 hrs ago", module: "Employees", color: "text-info", bg: "bg-info/10" },
          { id: 4, icon: ShoppingCart, description: "Invoice #2087 issued: $4,200 to Nairobi Traders", time: "4 hrs ago", module: "Sales", color: "text-accent-dark", bg: "bg-accent/10" },
        ],
      };

    case ROLES.COLLECTION_OFFICER:
      return {
        subtitle: "Manage farmer collections and registrations",
        stats: [
          { label: "Collected Today", value: "1,250 kg", change: "+12%", up: true, icon: Coffee, color: "text-primary", bg: "bg-primary/10", borderColor: "#2E7D32" },
          { label: "Today's Farmers", value: "24", change: "Deliveries", up: true, icon: Tractor, color: "text-info", bg: "bg-info/10", borderColor: "#0288D1" },
          { label: "This Week", value: "8,400 kg", change: "+5%", up: true, icon: TrendingUp, color: "text-secondary", bg: "bg-secondary/10", borderColor: "#1B5E20" },
          { label: "Total Farmers", value: "156", change: "Registered", up: true, icon: Users, color: "text-purple-600", bg: "bg-purple-100", borderColor: "#9333EA" },
        ],
        quickActions: [
          { label: "Record Collection", icon: Coffee, to: "/collections/new", color: "bg-primary" },
          { label: "Add Farmer", icon: UserPlus, to: "/farmers/new", color: "bg-info" },
        ],
        activities: [
          { id: 1, icon: Coffee, description: "Collection: 450 kg from Kigali cooperative", time: "12 min ago", module: "Collection", color: "text-primary", bg: "bg-primary/10" },
          { id: 2, icon: UserPlus, description: "New farmer: Jean Mugabo registered", time: "1 hr ago", module: "Farmers", color: "text-info", bg: "bg-info/10" },
          { id: 3, icon: Coffee, description: "Collection: 320 kg from Nyungwe cooperative", time: "3 hrs ago", module: "Collection", color: "text-primary", bg: "bg-primary/10" },
          { id: 4, icon: Tractor, description: "Farmer profile updated: Emmanuel Ndayisaba", time: "5 hrs ago", module: "Farmers", color: "text-secondary", bg: "bg-secondary/10" },
        ],
      };

    case ROLES.PRODUCTION_OFFICER:
      return {
        subtitle: "Monitor production and inventory levels",
        stats: [
          { label: "Produced Today", value: "320 kg", change: "+8%", up: true, icon: Factory, color: "text-info", bg: "bg-info/10", borderColor: "#0288D1" },
          { label: "Active Batches", value: "4", change: "In progress", up: true, icon: ClipboardList, color: "text-primary", bg: "bg-primary/10", borderColor: "#2E7D32" },
          { label: "Inventory Stock", value: "15,400 kg", change: "Available", up: true, icon: Package, color: "text-purple-600", bg: "bg-purple-100", borderColor: "#9333EA" },
          { label: "Low Stock Items", value: "2", change: "Alerts", up: false, icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", borderColor: "#F57C00" },
        ],
        quickActions: [
          { label: "New Production", icon: Factory, to: "/production/new", color: "bg-secondary" },
          { label: "View Inventory", icon: Package, to: "/inventory", color: "bg-purple-600" },
        ],
        activities: [
          { id: 1, icon: Factory, description: "Batch #1042 completed: 320 kg green tea", time: "2 hrs ago", module: "Production", color: "text-secondary", bg: "bg-secondary/10" },
          { id: 2, icon: Package, description: "Inventory alert: Black tea below threshold", time: "3 hrs ago", module: "Inventory", color: "text-warning", bg: "bg-warning/10" },
          { id: 3, icon: Factory, description: "Batch #1043 started: Oolong processing", time: "4 hrs ago", module: "Production", color: "text-info", bg: "bg-info/10" },
          { id: 4, icon: ClipboardList, description: "Quality check passed for batch #1040", time: "5 hrs ago", module: "Production", color: "text-primary", bg: "bg-primary/10" },
        ],
      };

    case ROLES.STORE_KEEPER:
      return {
        subtitle: "Manage inventory and stock levels",
        stats: [
          { label: "Total Items", value: "35", change: "Tracked", up: true, icon: Package, color: "text-purple-600", bg: "bg-purple-100", borderColor: "#9333EA" },
          { label: "In Stock", value: "15,400 kg", change: "Available", up: true, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10", borderColor: "#2E7D32" },
          { label: "Low Stock", value: "2", change: "Items below threshold", up: false, icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", borderColor: "#F57C00" },
          { label: "Movements Today", value: "8", change: "In/Out", up: true, icon: ArrowRight, color: "text-info", bg: "bg-info/10", borderColor: "#0288D1" },
        ],
        quickActions: [
          { label: "View Inventory", icon: Package, to: "/inventory", color: "bg-purple-600" },
          { label: "Stock Movement", icon: ArrowRight, to: "/inventory/movements", color: "bg-primary" },
        ],
        activities: [
          { id: 1, icon: Package, description: "Stock entry: 500 kg Black Tea BOP1 received", time: "1 hr ago", module: "Inventory", color: "text-primary", bg: "bg-primary/10" },
          { id: 2, icon: AlertTriangle, description: "Low stock alert: Packaging materials", time: "3 hrs ago", module: "Inventory", color: "text-warning", bg: "bg-warning/10" },
          { id: 3, icon: ArrowRight, description: "Stock transfer: 200 kg Warehouse A to Processing", time: "4 hrs ago", module: "Inventory", color: "text-info", bg: "bg-info/10" },
          { id: 4, icon: Package, description: "Weekly inventory audit completed - Warehouse B", time: "Yesterday", module: "Inventory", color: "text-secondary", bg: "bg-secondary/10" },
        ],
      };

    case ROLES.ACCOUNTANT:
      return {
        subtitle: "Track sales, expenses, and financials",
        stats: [
          { label: "Total Sales", value: "$45,200", change: "+15%", up: true, icon: ShoppingCart, color: "text-secondary", bg: "bg-secondary/10", borderColor: "#1B5E20" },
          { label: "Monthly Revenue", value: "$128,500", change: "+22%", up: true, icon: DollarSign, color: "text-primary", bg: "bg-primary/10", borderColor: "#2E7D32" },
          { label: "Total Expenses", value: "$78,400", change: "+8%", up: false, icon: Receipt, color: "text-danger", bg: "bg-danger/10", borderColor: "#D32F2F" },
          { label: "Net Profit", value: "$50,100", change: "+35%", up: true, icon: TrendingUp, color: "text-accent-dark", bg: "bg-accent/10", borderColor: "#F9A825" },
        ],
        quickActions: [
          { label: "Record Sale", icon: ShoppingCart, to: "/sales/new", color: "bg-secondary" },
          { label: "Add Expense", icon: Receipt, to: "/expenses/new", color: "bg-danger" },
          { label: "View Reports", icon: ClipboardList, to: "/reports", color: "bg-purple-600" },
        ],
        activities: [
          { id: 1, icon: ShoppingCart, description: "Invoice #2087 issued: $4,200 to Nairobi Traders", time: "3 hrs ago", module: "Sales", color: "text-secondary", bg: "bg-secondary/10" },
          { id: 2, icon: Receipt, description: "Expense: $1,850 for machinery maintenance", time: "4 hrs ago", module: "Expenses", color: "text-danger", bg: "bg-danger/10" },
          { id: 3, icon: DollarSign, description: "Payment received: $5,200 from Mombasa Tea Co.", time: "5 hrs ago", module: "Sales", color: "text-primary", bg: "bg-primary/10" },
          { id: 4, icon: FileText, description: "Monthly financial report generated", time: "Yesterday", module: "Reports", color: "text-accent-dark", bg: "bg-accent/10" },
        ],
      };

    default:
      return {
        subtitle: "Here's your overview",
        stats: [
          { label: "Tea Collected Today", value: "1,250 kg", change: "+12%", up: true, icon: Coffee, color: "text-primary", bg: "bg-primary/10", borderColor: "#2E7D32" },
        ],
        quickActions: [],
        activities: [],
      };
  }
}

export default function DashboardPage() {
  const { userProfile } = useAuth();
  const role = userProfile?.role || ROLES.ADMIN;
  const config = useMemo(() => getRoleConfig(role), [role]);
  const greeting = useMemo(() => getGreeting(), []);
  const date = useMemo(() => formatDate(), []);

  const userName = userProfile?.displayName || ROLE_LABELS[role] || "User";

  return (
    <motion.div
      className="min-h-screen space-y-8 p-6 lg:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-text-primary lg:text-3xl">
          {greeting}, {userName}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">{date}</p>
        <p className="mt-1 text-sm text-text-secondary">{config.subtitle}</p>
      </motion.div>

      {/* Stat Cards */}
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${config.stats.length <= 4 ? "lg:grid-cols-4" : "lg:grid-cols-5"}`}>
        {config.stats.map((card, idx) => (
          <StatCard
            key={card.label}
            icon={card.icon}
            label={card.label}
            value={card.value}
            change={card.change}
            up={card.up}
            color={card.color}
            bg={card.bg}
            borderColor={card.borderColor}
            delay={idx * 0.06}
          />
        ))}
      </div>

      {/* Bottom Row: Activities & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activities */}
        {config.activities.length > 0 && (
          <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-text-primary">Recent Activities</h3>
              <p className="text-sm text-text-secondary">Latest updates relevant to your role</p>
            </div>
            <div className="space-y-1">
              {config.activities.map((activity) => (
                <div key={activity.id} className="group flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-bg">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${activity.bg}`}>
                    <activity.icon className={`h-4 w-4 ${activity.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-text-primary">{activity.description}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs text-text-secondary">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </span>
                      <span className="rounded-full bg-bg px-2 py-0.5 text-xs font-medium text-text-secondary">
                        {activity.module}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        {config.quickActions.length > 0 && (
          <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-text-primary">Quick Actions</h3>
              <p className="text-sm text-text-secondary">Shortcuts to common tasks</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {config.quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className={`group flex flex-col items-center gap-2.5 rounded-xl border border-border p-4 text-center transition-all hover:border-transparent hover:shadow-md ${action.color} text-white`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium leading-tight">{action.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
