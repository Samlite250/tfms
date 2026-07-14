import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Coffee, Factory, Package, ShoppingCart, DollarSign, Users, TrendingUp,
  ArrowUpRight, ArrowDownRight, Clock, FileText, BarChart3, ArrowRight,
  UserPlus, Receipt, ClipboardList, Tractor, AlertTriangle,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useAuth } from "../../contexts/AuthContext";
import { ROLES, ROLE_LABELS } from "../../utils/constants";

const monthlyCollectionData = [
  { month: "Jan", collected: 32000, target: 30000 },
  { month: "Feb", collected: 28500, target: 30000 },
  { month: "Mar", collected: 35200, target: 32000 },
  { month: "Apr", collected: 31800, target: 32000 },
  { month: "May", collected: 38600, target: 35000 },
  { month: "Jun", collected: 42100, target: 38000 },
];

const monthlyProductionData = [
  { month: "Jan", greenTea: 8200, blackTea: 6400, oolong: 2100 },
  { month: "Feb", greenTea: 7500, blackTea: 5800, oolong: 1900 },
  { month: "Mar", greenTea: 9100, blackTea: 7200, oolong: 2500 },
  { month: "Apr", greenTea: 8400, blackTea: 6800, oolong: 2300 },
  { month: "May", greenTea: 10200, blackTea: 7900, oolong: 2800 },
  { month: "Jun", greenTea: 11500, blackTea: 8600, oolong: 3100 },
];

const salesTrendData = [
  { month: "Jan", revenue: 85000, expenses: 62000 },
  { month: "Feb", revenue: 78000, expenses: 58000 },
  { month: "Mar", revenue: 92000, expenses: 65000 },
  { month: "Apr", revenue: 88000, expenses: 61000 },
  { month: "May", revenue: 105000, expenses: 72000 },
  { month: "Jun", revenue: 118000, expenses: 78000 },
  { month: "Jul", revenue: 112000, expenses: 75000 },
  { month: "Aug", revenue: 98000, expenses: 68000 },
  { month: "Sep", revenue: 125000, expenses: 82000 },
  { month: "Oct", revenue: 132000, expenses: 85000 },
  { month: "Nov", revenue: 128000, expenses: 80000 },
  { month: "Dec", revenue: 145000, expenses: 92000 },
];

const expenseBreakdownData = [
  { name: "Labor", value: 35000, color: "#2E7D32" },
  { name: "Transport", value: 18000, color: "#43A047" },
  { name: "Materials", value: 22000, color: "#F9A825" },
  { name: "Utilities", value: 12000, color: "#1565C0" },
  { name: "Maintenance", value: 8000, color: "#DC2626" },
  { name: "Other", value: 5000, color: "#7C3AED" },
];

const inventoryData = [
  { name: "Green Tea", stock: 4200, threshold: 1000 },
  { name: "Black Tea", stock: 3800, threshold: 1200 },
  { name: "Oolong", stock: 1500, threshold: 500 },
  { name: "Dust", stock: 2100, threshold: 800 },
  { name: "Fannings", stock: 1800, threshold: 600 },
];


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

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-white p-3 shadow-lg">
      <p className="mb-1 text-sm font-semibold text-text-primary">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
}

function getRoleConfig(role) {
  switch (role) {
    case ROLES.ADMIN:
      return {
        subtitle: "Here's your factory overview",
        stats: [
          { label: "Tea Collected Today", value: "1,250 kg", change: "+12%", up: true, icon: Coffee, color: "text-primary", bg: "bg-primary/10" },
          { label: "Production Today", value: "320 kg", change: "+8%", up: true, icon: Factory, color: "text-info", bg: "bg-info/10" },
          { label: "Inventory Available", value: "15,400 kg", change: "In stock", up: true, icon: Package, color: "text-purple-600", bg: "bg-purple-100" },
          { label: "Total Sales", value: "$45,200", change: "+15%", up: true, icon: ShoppingCart, color: "text-secondary", bg: "bg-secondary/10" },
          { label: "Monthly Revenue", value: "$128,500", change: "+22%", up: true, icon: DollarSign, color: "text-accent-dark", bg: "bg-accent/10" },
        ],
        charts: ["collection", "production", "sales"],
        quickActions: [
          { label: "Record Collection", icon: Coffee, to: "/collections/new", color: "bg-primary" },
          { label: "New Production", icon: Factory, to: "/production/new", color: "bg-secondary" },
          { label: "Add Farmer", icon: UserPlus, to: "/farmers/new", color: "bg-info" },
          { label: "Record Sale", icon: ShoppingCart, to: "/sales/new", color: "bg-accent-dark" },
          { label: "Add Expense", icon: Receipt, to: "/expenses/new", color: "bg-danger" },
          { label: "Admin Panel", icon: Users, to: "/admin", color: "bg-purple-600" },
        ],
        activities: [
          { id: 1, icon: Coffee, description: "Collection recorded: 450 kg from Kigali cooperative", time: "12 min ago", module: "Collection", color: "text-primary", bg: "bg-primary/10" },
          { id: 2, icon: UserPlus, description: "New farmer registered: Jean Mugabo", time: "1 hr ago", module: "Farmers", color: "text-info", bg: "bg-info/10" },
          { id: 3, icon: Factory, description: "Batch #1042 completed: 320 kg green tea", time: "2 hrs ago", module: "Production", color: "text-secondary", bg: "bg-secondary/10" },
          { id: 4, icon: ShoppingCart, description: "Invoice #2087 issued: $4,200 to Nairobi Traders", time: "3 hrs ago", module: "Sales", color: "text-accent-dark", bg: "bg-accent/10" },
          { id: 5, icon: Package, description: "Inventory alert: Black tea stock below threshold", time: "4 hrs ago", module: "Inventory", color: "text-warning", bg: "bg-warning/10" },
          { id: 6, icon: Receipt, description: "Expense: $1,850 for machinery maintenance", time: "5 hrs ago", module: "Expenses", color: "text-danger", bg: "bg-danger/10" },
        ],
      };

    case ROLES.FACTORY_MANAGER:
      return {
        subtitle: "Here's your management overview",
        stats: [
          { label: "Tea Collected Today", value: "1,250 kg", change: "+12%", up: true, icon: Coffee, color: "text-primary", bg: "bg-primary/10" },
          { label: "Production Today", value: "320 kg", change: "+8%", up: true, icon: Factory, color: "text-info", bg: "bg-info/10" },
          { label: "Active Employees", value: "48", change: "On shift", up: true, icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
          { label: "Monthly Revenue", value: "$128,500", change: "+22%", up: true, icon: DollarSign, color: "text-accent-dark", bg: "bg-accent/10" },
        ],
        charts: ["collection", "production", "sales"],
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
          { label: "Collected Today", value: "1,250 kg", change: "+12%", up: true, icon: Coffee, color: "text-primary", bg: "bg-primary/10" },
          { label: "Today's Farmers", value: "24", change: "Deliveries", up: true, icon: Tractor, color: "text-info", bg: "bg-info/10" },
          { label: "This Week", value: "8,400 kg", change: "+5%", up: true, icon: TrendingUp, color: "text-secondary", bg: "bg-secondary/10" },
          { label: "Total Farmers", value: "156", change: "Registered", up: true, icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
        ],
        charts: ["collection"],
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
          { label: "Produced Today", value: "320 kg", change: "+8%", up: true, icon: Factory, color: "text-info", bg: "bg-info/10" },
          { label: "Active Batches", value: "4", change: "In progress", up: true, icon: ClipboardList, color: "text-primary", bg: "bg-primary/10" },
          { label: "Inventory Stock", value: "15,400 kg", change: "Available", up: true, icon: Package, color: "text-purple-600", bg: "bg-purple-100" },
          { label: "Low Stock Items", value: "2", change: "Alerts", up: false, icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
        ],
        charts: ["production", "inventory"],
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
          { label: "Total Items", value: "35", change: "Tracked", up: true, icon: Package, color: "text-purple-600", bg: "bg-purple-100" },
          { label: "In Stock", value: "15,400 kg", change: "Available", up: true, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
          { label: "Low Stock", value: "2", change: "Items below threshold", up: false, icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
          { label: "Movements Today", value: "8", change: "In/Out", up: true, icon: ArrowRight, color: "text-info", bg: "bg-info/10" },
        ],
        charts: ["inventory"],
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
          { label: "Total Sales", value: "$45,200", change: "+15%", up: true, icon: ShoppingCart, color: "text-secondary", bg: "bg-secondary/10" },
          { label: "Monthly Revenue", value: "$128,500", change: "+22%", up: true, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
          { label: "Total Expenses", value: "$78,400", change: "+8%", up: false, icon: Receipt, color: "text-danger", bg: "bg-danger/10" },
          { label: "Net Profit", value: "$50,100", change: "+35%", up: true, icon: TrendingUp, color: "text-accent-dark", bg: "bg-accent/10" },
        ],
        charts: ["sales", "expense"],
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
          { label: "Tea Collected Today", value: "1,250 kg", change: "+12%", up: true, icon: Coffee, color: "text-primary", bg: "bg-primary/10" },
        ],
        charts: [],
        quickActions: [],
        activities: [],
      };
  }
}

function renderChart(chartType) {
  switch (chartType) {
    case "collection":
      return (
        <motion.div key="collection" variants={itemVariants} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Monthly Collection</h3>
              <p className="text-sm text-text-secondary">Tea leaves collected over 6 months</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <TrendingUp className="h-4.5 w-4.5 text-primary" />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyCollectionData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F9A825" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#F9A825" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="collected" name="Collected" stroke="#2E7D32" strokeWidth={2.5} fill="url(#colorCollected)" />
                <Area type="monotone" dataKey="target" name="Target" stroke="#F9A825" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorTarget)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      );

    case "production":
      return (
        <motion.div key="production" variants={itemVariants} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Monthly Production</h3>
              <p className="text-sm text-text-secondary">Tea production by type</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-info/10">
              <Factory className="h-4.5 w-4.5 text-info" />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyProductionData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="greenTea" name="Green Tea" fill="#2E7D32" radius={[4, 4, 0, 0]} />
                <Bar dataKey="blackTea" name="Black Tea" fill="#43A047" radius={[4, 4, 0, 0]} />
                <Bar dataKey="oolong" name="Oolong" fill="#F9A825" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      );

    case "sales":
      return (
        <motion.div key="sales" variants={itemVariants} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Sales Trend</h3>
              <p className="text-sm text-text-secondary">Revenue vs expenses over 12 months</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
              <BarChart3 className="h-4.5 w-4.5 text-accent-dark" />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrendData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#2E7D32" strokeWidth={2.5} dot={{ r: 4, fill: "#2E7D32", strokeWidth: 0 }} />
                <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#DC2626" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: "#DC2626", strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      );

    case "expense":
      return (
        <motion.div key="expense" variants={itemVariants} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Expense Breakdown</h3>
              <p className="text-sm text-text-secondary">Expenses by category this month</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-danger/10">
              <Receipt className="h-4.5 w-4.5 text-danger" />
            </div>
          </div>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseBreakdownData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {expenseBreakdownData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      );

    case "inventory":
      return (
        <motion.div key="inventory" variants={itemVariants} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Stock Levels</h3>
              <p className="text-sm text-text-secondary">Current inventory vs threshold</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100">
              <Package className="h-4.5 w-4.5 text-purple-600" />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="stock" name="Current Stock" fill="#2E7D32" radius={[0, 4, 4, 0]} />
                <Bar dataKey="threshold" name="Min Threshold" fill="#F9A825" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      );

    default:
      return null;
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
        {config.stats.map((card) => (
          <motion.div
            key={card.label}
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group cursor-default rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${card.up ? "text-success" : "text-danger"}`}>
                {card.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {card.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-text-primary">{card.value}</p>
            <p className="mt-1 text-sm text-text-secondary">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      {config.charts.length > 0 && (
        <div className={`grid grid-cols-1 gap-6 ${config.charts.length >= 2 ? "lg:grid-cols-2" : ""}`}>
          {config.charts.map((chartType) => renderChart(chartType))}
        </div>
      )}

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
