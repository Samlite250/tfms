import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Coffee, Factory, Package, Users, TrendingUp,
  Clock, FileText, ArrowRight, Weight,
  UserPlus, ClipboardList, Tractor, AlertTriangle, Banknote,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { ROLES, ROLE_LABELS } from "../../utils/constants";
import StatCard from "../../components/ui/StatCard";
import { farmersService, coffeeCollectionsService, productionService, paymentsService, inventoryService } from "../../firebase/firestoreService";
import { formatCurrency } from "../../utils/helpers";


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
          { label: "Coffee Collected Today", value: "1,250 kg", change: "+12%", up: true, icon: Coffee, color: "text-primary", bg: "bg-primary/10", borderColor: "#2E7D32" },
          { label: "Production Today", value: "320 kg", change: "+8%", up: true, icon: Factory, color: "text-info", bg: "bg-info/10", borderColor: "#0288D1" },
          { label: "Active Employees", value: "48", change: "On shift", up: true, icon: Users, color: "text-purple-600", bg: "bg-purple-100", borderColor: "#9333EA" },
          { label: "Monthly Revenue", value: "RWF 128,500", change: "+22%", up: true, icon: Banknote, color: "text-accent-dark", bg: "bg-accent/10", borderColor: "#F9A825" },
        ],
        quickActions: [
          { label: "Record Collection", icon: Coffee, to: "/collections/new", color: "bg-primary" },
          { label: "New Production", icon: Factory, to: "/production/new", color: "bg-secondary" },
          { label: "Add Farmer", icon: UserPlus, to: "/farmers/new", color: "bg-info" },
          { label: "View Reports", icon: ClipboardList, to: "/reports", color: "bg-purple-600" },
        ],
        activities: [
          { id: 1, icon: Coffee, description: "Collection recorded: 450 kg from Mahembe cooperative", time: "12 min ago", module: "Collection", color: "text-primary", bg: "bg-primary/10" },
          { id: 2, icon: Factory, description: "Batch #1042 completed: 320 kg green coffee", time: "2 hrs ago", module: "Production", color: "text-secondary", bg: "text-secondary" },
          { id: 3, icon: Users, description: "Shift assignment updated for evening crew", time: "3 hrs ago", module: "Employees", color: "text-info", bg: "bg-info/10" },
          { id: 4, icon: Banknote, description: "Payment of RWF 4,200 processed for cooperative", time: "4 hrs ago", module: "Payment", color: "text-accent-dark", bg: "bg-accent/10" },
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
          { id: 1, icon: Coffee, description: "Collection: 450 kg from Mahembe cooperative", time: "12 min ago", module: "Collection", color: "text-primary", bg: "bg-primary/10" },
          { id: 2, icon: UserPlus, description: "New farmer: Jean Mugabo registered", time: "1 hr ago", module: "Farmers", color: "text-info", bg: "bg-info/10" },
          { id: 3, icon: Coffee, description: "Collection: 320 kg from Ruyanza cooperative", time: "3 hrs ago", module: "Collection", color: "text-primary", bg: "bg-primary/10" },
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
          { id: 1, icon: Factory, description: "Batch #1042 completed: 320 kg green coffee", time: "2 hrs ago", module: "Production", color: "text-secondary", bg: "bg-secondary/10" },
          { id: 2, icon: Package, description: "Inventory alert: Green coffee below threshold", time: "3 hrs ago", module: "Inventory", color: "text-warning", bg: "bg-warning/10" },
          { id: 3, icon: Factory, description: "Batch #1043 started: Washed process", time: "4 hrs ago", module: "Production", color: "text-info", bg: "bg-info/10" },
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
          { id: 1, icon: Package, description: "Stock entry: 500 kg Green Coffee AB received", time: "1 hr ago", module: "Inventory", color: "text-primary", bg: "bg-primary/10" },
          { id: 2, icon: AlertTriangle, description: "Low stock alert: Packaging materials", time: "3 hrs ago", module: "Inventory", color: "text-warning", bg: "bg-warning/10" },
          { id: 3, icon: ArrowRight, description: "Stock transfer: 200 kg Warehouse A to Processing", time: "4 hrs ago", module: "Inventory", color: "text-info", bg: "bg-info/10" },
          { id: 4, icon: Package, description: "Weekly inventory audit completed - Warehouse B", time: "Yesterday", module: "Inventory", color: "text-secondary", bg: "bg-secondary/10" },
        ],
      };

    case ROLES.ACCOUNTANT:
      return {
        subtitle: "Track payments and financials",
        stats: [
          { label: "Total Payments", value: "RWF 128,500", change: "+22%", up: true, icon: Banknote, color: "text-primary", bg: "bg-primary/10", borderColor: "#2E7D32" },
          { label: "Monthly Revenue", value: "RWF 128,500", change: "+22%", up: true, icon: TrendingUp, color: "text-accent-dark", bg: "bg-accent/10", borderColor: "#F9A825" },
          { label: "Pending Payments", value: "RWF 12,400", change: "3 pending", up: false, icon: Clock, color: "text-warning", bg: "bg-warning/10", borderColor: "#F57C00" },
          { label: "Completed This Month", value: "RWF 116,100", change: "+18%", up: true, icon: FileText, color: "text-secondary", bg: "bg-secondary/10", borderColor: "#1B5E20" },
        ],
        quickActions: [
          { label: "Create Payment", icon: Banknote, to: "/payments/new", color: "bg-primary" },
          { label: "View Reports", icon: ClipboardList, to: "/reports", color: "bg-purple-600" },
        ],
        activities: [
          { id: 1, icon: Banknote, description: "Payment of RWF 5,200 processed for Jean Mugabo", time: "3 hrs ago", module: "Payment", color: "text-primary", bg: "bg-primary/10" },
          { id: 2, icon: Banknote, description: "Payment of RWF 1,850 processed for Emmanuel Ndayisaba", time: "4 hrs ago", module: "Payment", color: "text-primary", bg: "bg-primary/10" },
          { id: 3, icon: Clock, description: "Payment pending for COL-5005: RWF 675,000", time: "5 hrs ago", module: "Payment", color: "text-warning", bg: "bg-warning/10" },
          { id: 4, icon: FileText, description: "Monthly financial report generated", time: "Yesterday", module: "Reports", color: "text-accent-dark", bg: "bg-accent/10" },
        ],
      };

    case ROLES.FARMER:
      return {
        subtitle: "View your coffee collections and payments",
        stats: [
          { label: "My Collections", value: "8", change: "Total deliveries", up: true, icon: Coffee, color: "text-primary", bg: "bg-primary/10", borderColor: "#2E7D32" },
          { label: "Total Collected", value: "965 kg", change: "+120 kg this month", up: true, icon: Weight, color: "text-info", bg: "bg-info/10", borderColor: "#0288D1" },
          { label: "Total Earnings", value: "RWF 4,027,500", change: "All time", up: true, icon: Banknote, color: "text-accent-dark", bg: "bg-accent/10", borderColor: "#F9A825" },
          { label: "Pending Payment", value: "RWF 1,017,000", change: "2 invoices", up: false, icon: Clock, color: "text-warning", bg: "bg-warning/10", borderColor: "#F57C00" },
        ],
        quickActions: [
          { label: "My Collections", icon: Coffee, to: "/my-collections", color: "bg-primary" },
        ],
        activities: [
          { id: 1, icon: Coffee, description: "Collection completed: 120 kg AA grade at Mahembe Central", time: "2 days ago", module: "Collection", color: "text-primary", bg: "bg-primary/10" },
          { id: 2, icon: Banknote, description: "Payment of RWF 540,000 received for COL-5001", time: "2 days ago", module: "Payment", color: "text-success", bg: "bg-success/10" },
          { id: 3, icon: Coffee, description: "Collection completed: 85 kg AB grade at Mahembe Central", time: "6 days ago", module: "Collection", color: "text-primary", bg: "bg-primary/10" },
          { id: 4, icon: Clock, description: "Payment pending for COL-5005: RWF 675,000", time: "1 week ago", module: "Payment", color: "text-warning", bg: "bg-warning/10" },
        ],
      };

    default:
      return {
        subtitle: "Here's your overview",
        stats: [
          { label: "Coffee Collected Today", value: "1,250 kg", change: "+12%", up: true, icon: Coffee, color: "text-primary", bg: "bg-primary/10", borderColor: "#2E7D32" },
        ],
        quickActions: [],
        activities: [],
      };
  }
}

export default function DashboardPage() {
  const { userProfile } = useAuth();
  const role = userProfile?.role || ROLES.ADMIN;
  const greeting = useMemo(() => getGreeting(), []);
  const date = useMemo(() => formatDate(), []);

  const [stats, setStats] = useState({
    farmers: 0,
    collectionsToday: 0,
    totalCollected: 0,
    productionBatches: 0,
    paymentsPending: 0,
    paymentsTotal: 0,
    inventoryItems: 0,
    loading: true,
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [farmers, collections, production, payments, inventory] = await Promise.all([
          farmersService.count([]).catch(() => 0),
          coffeeCollectionsService.getAll({ filters: [], limitCount: 100 }).catch(() => []),
          productionService.count([]).catch(() => 0),
          paymentsService.getAll({ filters: [], limitCount: 100 }).catch(() => []),
          inventoryService.count([]).catch(() => 0),
        ]);

        const today = new Date().toISOString().split('T')[0];
        const collectionsToday = Array.isArray(collections) 
          ? collections.filter(c => c.date === today).reduce((sum, c) => sum + (c.weight || 0), 0)
          : 0;
        const totalCollected = Array.isArray(collections) 
          ? collections.reduce((sum, c) => sum + (c.weight || 0), 0)
          : 0;
        const paymentsPending = Array.isArray(payments) 
          ? payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + (p.totalAmount || 0), 0)
          : 0;
        const paymentsTotal = Array.isArray(payments) 
          ? payments.reduce((sum, p) => sum + (p.totalAmount || 0), 0)
          : 0;

        setStats({
          farmers,
          collectionsToday,
          totalCollected,
          productionBatches: production,
          paymentsPending,
          paymentsTotal,
          inventoryItems: inventory,
          loading: false,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    }

    fetchDashboardData();
  }, []);

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
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Farmers"
          value={stats.farmers.toString()}
          change="+3"
          up={true}
          color="text-primary"
          bg="bg-primary/10"
          borderColor="#2E7D32"
          delay={0}
        />
        <StatCard
          icon={Coffee}
          label="Coffee Received Today"
          value={`${stats.collectionsToday.toLocaleString()} kg`}
          change="+12%"
          up={true}
          color="text-info"
          bg="bg-info/10"
          borderColor="#0288D1"
          delay={0.06}
        />
        <StatCard
          icon={Factory}
          label="Total Coffee Processed"
          value={`${stats.totalCollected.toLocaleString()} kg`}
          change="+8%"
          up={true}
          color="text-secondary"
          bg="bg-secondary/10"
          borderColor="#1B5E20"
          delay={0.12}
        />
        <StatCard
          icon={Banknote}
          label="Payments Made"
          value={formatCurrency(stats.paymentsTotal)}
          change={`${stats.paymentsPending > 0 ? `${stats.paymentsPending} pending` : 'All clear'}`}
          up={stats.paymentsPending === 0}
          color="text-accent-dark"
          bg="bg-accent/10"
          borderColor="#F9A825"
          delay={0.18}
        />
      </motion.div>

      {/* Second Row Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={ClipboardList}
          label="Production Batches"
          value={stats.productionBatches.toString()}
          change="Active"
          up={true}
          color="text-purple-600"
          bg="bg-purple-100"
          borderColor="#9333EA"
          delay={0.24}
        />
        <StatCard
          icon={Package}
          label="Inventory Items"
          value={stats.inventoryItems.toString()}
          change="Tracked"
          up={true}
          color="text-teal-600"
          bg="bg-teal-100"
          borderColor="#0D9488"
          delay={0.3}
        />
        <StatCard
          icon={Clock}
          label="Pending Payments"
          value={formatCurrency(stats.paymentsPending)}
          change={stats.paymentsPending > 0 ? "Needs attention" : "Clear"}
          up={stats.paymentsPending === 0}
          color="text-warning"
          bg="bg-warning/10"
          borderColor="#F57C00"
          delay={0.36}
        />
      </motion.div>

      {/* Bottom Row: Quick Actions */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-text-primary">Quick Actions</h3>
          <p className="text-sm text-text-secondary">Shortcuts to common tasks</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Record Collection", icon: Coffee, to: "/collections/new", color: "bg-primary" },
            { label: "New Production", icon: Factory, to: "/production/new", color: "bg-secondary" },
            { label: "Add Farmer", icon: UserPlus, to: "/farmers/new", color: "bg-info" },
            { label: "Create Payment", icon: Banknote, to: "/payments/new", color: "bg-accent-dark" },
            { label: "View Reports", icon: ClipboardList, to: "/reports", color: "bg-purple-600" },
            { label: "Inventory", icon: Package, to: "/inventory", color: "bg-teal-600" },
          ].map((action) => (
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
    </motion.div>
  );
}
