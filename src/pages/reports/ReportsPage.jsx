import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Coffee,
  Factory,
  Receipt,
  DollarSign,
  Package,
  Download,
  FileText,
  Printer,
  Mail,
  TrendingUp,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  Filter,
  Check,
  Layers,
} from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../contexts/AuthContext";
import { ROLE_REPORTS } from "../../utils/constants";

const COLORS = {
  primary: "#2E7D32",
  secondary: "#43A047",
  accent: "#F9A825",
  danger: "#E53935",
  info: "#1E88E5",
  purple: "#7B1FA2",
  teal: "#00897B",
  pink: "#D81B60",
};

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3, ease: "easeInOut" },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const datePresets = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
  { value: "custom", label: "Custom Range" },
];

const collectionDailyData = [
  { day: "Mon", collected: 4200, target: 4000, farmers: 48 },
  { day: "Tue", collected: 3800, target: 4000, farmers: 42 },
  { day: "Wed", collected: 5100, target: 4200, farmers: 55 },
  { day: "Thu", collected: 4600, target: 4200, farmers: 51 },
  { day: "Fri", collected: 5400, target: 4500, farmers: 58 },
  { day: "Sat", collected: 3900, target: 4000, farmers: 43 },
  { day: "Sun", collected: 2800, target: 3000, farmers: 31 },
];

const collectionRecords = [
  { id: "COL-2081", date: "2026-07-14", farmer: "Jean Mugabo", cooperative: "Kigali Co-op", grade: "Premium", quantity: 245, rate: 12.5, total: 3062.5 },
  { id: "COL-2080", date: "2026-07-14", farmer: "Marie Uwimana", cooperative: "Huye Society", grade: "Grade A", quantity: 180, rate: 10.0, total: 1800 },
  { id: "COL-2079", date: "2026-07-13", farmer: "Emmanuel Niyonzima", cooperative: "Musanze Union", grade: "Premium", quantity: 312, rate: 12.5, total: 3900 },
  { id: "COL-2078", date: "2026-07-13", farmer: "Claudine Mukamana", cooperative: "Kigali Co-op", grade: "Grade A", quantity: 195, rate: 10.0, total: 1950 },
  { id: "COL-2077", date: "2026-07-12", farmer: "Patrick Habimana", cooperative: "Nyungwe Co-op", grade: "Grade B", quantity: 158, rate: 8.0, total: 1264 },
  { id: "COL-2076", date: "2026-07-12", farmer: "Diane Iradukunda", cooperative: "Huye Society", grade: "Premium", quantity: 267, rate: 12.5, total: 3337.5 },
  { id: "COL-2075", date: "2026-07-11", farmer: "Alexis Bizimana", cooperative: "Musanze Union", grade: "Grade A", quantity: 210, rate: 10.0, total: 2100 },
  { id: "COL-2074", date: "2026-07-11", farmer: "Rose Nyirahabimana", cooperative: "Kigali Co-op", grade: "Grade B", quantity: 142, rate: 8.0, total: 1136 },
];

const productionData = [
  { month: "Jan", greenTea: 8200, blackTea: 6400, oolong: 2100, total: 16700 },
  { month: "Feb", greenTea: 7500, blackTea: 5800, oolong: 1900, total: 15200 },
  { month: "Mar", greenTea: 9100, blackTea: 7200, oolong: 2500, total: 18800 },
  { month: "Apr", greenTea: 8400, blackTea: 6800, oolong: 2300, total: 17500 },
  { month: "May", greenTea: 10200, blackTea: 7900, oolong: 2800, total: 20900 },
  { month: "Jun", greenTea: 11500, blackTea: 8600, oolong: 3100, total: 23200 },
  { month: "Jul", greenTea: 9800, blackTea: 7400, oolong: 2600, total: 19800 },
];

const productionBatches = [
  { id: "BAT-1048", date: "2026-07-14", type: "Green Tea", input: 1200, output: 285, yield: 23.75, quality: "A+", status: "Completed" },
  { id: "BAT-1047", date: "2026-07-13", type: "Black Tea", input: 1500, output: 340, yield: 22.67, quality: "A", status: "Completed" },
  { id: "BAT-1046", date: "2026-07-12", type: "Oolong Tea", input: 800, output: 178, yield: 22.25, quality: "A+", status: "Completed" },
  { id: "BAT-1045", date: "2026-07-11", type: "Green Tea", input: 1100, output: 262, yield: 23.82, quality: "A", status: "Completed" },
  { id: "BAT-1044", date: "2026-07-10", type: "Black Tea", input: 1400, output: 310, yield: 22.14, quality: "B+", status: "Completed" },
  { id: "BAT-1043", date: "2026-07-09", type: "Green Tea", input: 1300, output: 312, yield: 24.0, quality: "A+", status: "Completed" },
];

const salesData = [
  { month: "Jan", revenue: 85000, orders: 42, avgOrder: 2024 },
  { month: "Feb", revenue: 78000, orders: 38, avgOrder: 2053 },
  { month: "Mar", revenue: 92000, orders: 45, avgOrder: 2044 },
  { month: "Apr", revenue: 88000, orders: 43, avgOrder: 2047 },
  { month: "May", revenue: 105000, orders: 51, avgOrder: 2059 },
  { month: "Jun", revenue: 118000, orders: 56, avgOrder: 2107 },
  { month: "Jul", revenue: 112000, orders: 53, avgOrder: 2113 },
];

const salesRecords = [
  { id: "INV-2087", date: "2026-07-14", customer: "Nairobi Traders Ltd", items: "Green Tea (Premium)", quantity: 500, amount: 6250, status: "Paid" },
  { id: "INV-2086", date: "2026-07-13", customer: "Kampala Exports Co", items: "Black Tea (Grade A)", quantity: 800, amount: 8000, status: "Paid" },
  { id: "INV-2085", date: "2026-07-12", customer: "Dar es Salaam Tea House", items: "Oolong Tea", quantity: 350, amount: 5250, status: "Pending" },
  { id: "INV-2084", date: "2026-07-11", customer: "Addis Fine Foods", items: "Green Tea (Grade A)", quantity: 600, amount: 6000, status: "Paid" },
  { id: "INV-2083", date: "2026-07-10", customer: "Mombasa Beverages", items: "Black Tea (Premium)", quantity: 450, amount: 5625, status: "Paid" },
  { id: "INV-2082", date: "2026-07-09", customer: "Nairobi Traders Ltd", items: "Green Tea (Grade B)", quantity: 700, amount: 5600, status: "Overdue" },
];

const expenseByCategory = [
  { name: "Raw Materials", value: 42500, color: COLORS.primary },
  { name: "Labor", value: 35200, color: COLORS.secondary },
  { name: "Utilities", value: 18600, color: COLORS.info },
  { name: "Transport", value: 15400, color: COLORS.accent },
  { name: "Maintenance", value: 12800, color: COLORS.purple },
  { name: "Packaging", value: 9500, color: COLORS.teal },
  { name: "Admin", value: 7200, color: COLORS.pink },
];

const expenseRecords = [
  { id: "EXP-421", date: "2026-07-14", category: "Raw Materials", description: "Premium tea leaves procurement", amount: 4500, vendor: "Kigali Suppliers" },
  { id: "EXP-420", date: "2026-07-13", category: "Labor", description: "Overtime pay - weekend shift", amount: 3200, vendor: "Internal" },
  { id: "EXP-419", date: "2026-07-12", category: "Utilities", description: "Electricity bill - July", amount: 2800, vendor: "REWAG" },
  { id: "EXP-418", date: "2026-07-11", category: "Transport", description: "Collection route fuel costs", amount: 1850, vendor: "Shell Station" },
  { id: "EXP-417", date: "2026-07-10", category: "Maintenance", description: "Processing machine servicing", amount: 3500, vendor: "TechFix Rwanda" },
  { id: "EXP-416", date: "2026-07-09", category: "Packaging", description: "Tea packaging materials", amount: 2100, vendor: "PackPro Ltd" },
];

const financialMonthly = [
  { month: "Jan", revenue: 85000, expenses: 62000, profit: 23000 },
  { month: "Feb", revenue: 78000, expenses: 58000, profit: 20000 },
  { month: "Mar", revenue: 92000, expenses: 65000, profit: 27000 },
  { month: "Apr", revenue: 88000, expenses: 61000, profit: 27000 },
  { month: "May", revenue: 105000, expenses: 72000, profit: 33000 },
  { month: "Jun", revenue: 118000, expenses: 78000, profit: 40000 },
  { month: "Jul", revenue: 112000, expenses: 75000, profit: 37000 },
];

const inventoryItems = [
  { name: "Green Tea (Premium)", stock: 2800, capacity: 5000, unit: "kg", value: 35000, status: "Healthy" },
  { name: "Green Tea (Grade A)", stock: 1950, capacity: 4000, unit: "kg", value: 19500, status: "Healthy" },
  { name: "Black Tea (Premium)", stock: 420, capacity: 3500, unit: "kg", value: 5250, status: "Low" },
  { name: "Black Tea (Grade A)", stock: 1200, capacity: 3500, unit: "kg", value: 12000, status: "Healthy" },
  { name: "Oolong Tea", stock: 280, capacity: 2000, unit: "kg", value: 4200, status: "Low" },
  { name: "Tea Bags (Green)", stock: 15000, capacity: 30000, unit: "pcs", value: 7500, status: "Healthy" },
  { name: "Tea Bags (Black)", stock: 3200, capacity: 25000, unit: "pcs", value: 1600, status: "Low" },
  { name: "Packaging Boxes", stock: 8500, capacity: 12000, unit: "pcs", value: 4250, status: "Healthy" },
];

function StatCard({ icon: Icon, label, value, change, changeLabel, color = "primary", delay = 0 }) {
  const isPositive = change >= 0;
  return (
    <motion.div variants={staggerItem}>
      <Card hover padding="md" className="h-full">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1">{label}</p>
            <p className="text-2xl font-bold text-text-primary truncate">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {isPositive ? (
                  <ArrowUpRight size={14} className="text-success" />
                ) : (
                  <ArrowDownRight size={14} className="text-danger" />
                )}
                <span className={`text-xs font-semibold ${isPositive ? "text-success" : "text-danger"}`}>
                  {isPositive ? "+" : ""}{change}%
                </span>
                {changeLabel && <span className="text-xs text-text-secondary">{changeLabel}</span>}
              </div>
            )}
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-${color}/10`}>
            <Icon size={22} className={`text-${color}`} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function ReportTypeSelector({ selected, onSelect, reportTypes }) {
  return (
    <div className={`grid gap-3 ${reportTypes.length <= 3 ? "grid-cols-1 md:grid-cols-3" : reportTypes.length <= 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-6"}`}>
      {reportTypes.map((rt) => {
        const isActive = selected === rt.id;
        return (
          <motion.button
            key={rt.id}
            onClick={() => onSelect(rt.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer
              ${isActive
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border bg-white hover:border-primary/30 hover:shadow-sm"
              }
            `}
          >
            {isActive && (
              <motion.div
                layoutId="reportActiveIndicator"
                className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <Check size={12} className="text-white" />
              </motion.div>
            )}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isActive ? "bg-primary/15" : "bg-gray-100"}`}>
              <rt.icon size={20} className={isActive ? "text-primary" : "text-text-secondary"} />
            </div>
            <p className={`text-sm font-semibold mb-0.5 ${isActive ? "text-primary" : "text-text-primary"}`}>{rt.label}</p>
            <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{rt.description}</p>
          </motion.button>
        );
      })}
    </div>
  );
}

function DateRangePanel({ datePreset, setDatePreset, startDate, setStartDate, endDate, setEndDate }) {
  return (
    <Card padding="md">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        <div className="flex-1">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Quick Preset</label>
          <div className="flex flex-wrap gap-2">
            {datePresets.map((p) => (
              <button
                key={p.value}
                onClick={() => setDatePreset(p.value)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer
                  ${datePreset === p.value
                    ? "bg-primary text-white shadow-sm"
                    : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                  }
                `}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        {datePreset === "custom" && (
          <div className="flex gap-3">
            <Input
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-44"
            />
            <Input
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-44"
            />
          </div>
        )}
      </div>
    </Card>
  );
}

function CollectionReport() {
  const totalCollected = collectionDailyData.reduce((s, d) => s + d.collected, 0);
  const avgPerDay = Math.round(totalCollected / collectionDailyData.length);
  return (
    <motion.div {...fadeIn} className="space-y-6">
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={staggerContainer} initial="initial" animate="animate">
        <StatCard icon={Coffee} label="Total Collected" value={`${totalCollected.toLocaleString()} kg`} change={8.3} changeLabel="vs last week" color="primary" />
        <StatCard icon={BarChart3} label="Average per Day" value={`${avgPerDay.toLocaleString()} kg`} change={3.1} changeLabel="vs last week" color="secondary" />
        <StatCard icon={Users} label="Top Farmer" value="E. Niyonzima" change={12.5} changeLabel="contribution" color="info" />
        <StatCard icon={TrendingUp} label="Top Grade" value="Premium" change={5.8} changeLabel="share" color="accent" />
      </motion.div>

      <Card padding="none" header={<div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-text-primary">Collection Records</h3><Badge variant="info">{collectionRecords.length} records</Badge></div>}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50/80">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Farmer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Cooperative</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Grade</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Qty (kg)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Rate</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {collectionRecords.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-primary">{r.id}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{r.date}</td>
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">{r.farmer}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{r.cooperative}</td>
                  <td className="px-4 py-3">
                    <Badge variant={r.grade === "Premium" ? "success" : r.grade === "Grade A" ? "info" : "default"} dot>{r.grade}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-text-primary">{r.quantity.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-text-secondary">${r.rate.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-text-primary">${r.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-primary/20 bg-primary/5">
                <td colSpan={5} className="px-4 py-3 text-sm font-bold text-text-primary">Total</td>
                <td className="px-4 py-3 text-sm text-right font-bold text-text-primary">{collectionRecords.reduce((s, r) => s + r.quantity, 0).toLocaleString()} kg</td>
                <td />
                <td className="px-4 py-3 text-sm text-right font-bold text-primary">${collectionRecords.reduce((s, r) => s + r.total, 0).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </motion.div>
  );
}

function ProductionReport() {
  const totalProduced = productionData.reduce((s, d) => s + d.total, 0);
  const avgYield = (productionBatches.reduce((s, b) => s + b.yield, 0) / productionBatches.length).toFixed(2);
  return (
    <motion.div {...fadeIn} className="space-y-6">
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={staggerContainer} initial="initial" animate="animate">
        <StatCard icon={Factory} label="Total Produced" value={`${totalProduced.toLocaleString()} kg`} change={11.2} changeLabel="vs last period" color="primary" />
        <StatCard icon={TrendingUp} label="Average Yield" value={`${avgYield}%`} change={1.5} changeLabel="improvement" color="secondary" />
        <StatCard icon={Check} label="Best Grade" value="A+ Green" change={4.2} changeLabel="share increase" color="accent" />
        <StatCard icon={Layers} label="Batches Count" value={productionBatches.length.toString()} change={7.8} changeLabel="vs last week" color="info" />
      </motion.div>

      <Card padding="none" header={<div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-text-primary">Production Batches</h3><Badge variant="info">{productionBatches.length} batches</Badge></div>}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50/80">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Batch ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Input (kg)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Output (kg)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Yield %</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">Quality</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {productionBatches.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-primary">{b.id}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{b.date}</td>
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">{b.type}</td>
                  <td className="px-4 py-3 text-sm text-right text-text-primary">{b.input.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right text-text-primary">{b.output.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-primary">{b.yield}%</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={b.quality === "A+" ? "success" : b.quality === "A" ? "info" : "default"} dot>{b.quality}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="success" dot>{b.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
}

function SalesReport() {
  const totalRevenue = salesData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = salesData.reduce((s, d) => s + d.orders, 0);
  const avgOrder = Math.round(totalRevenue / totalOrders);
  return (
    <motion.div {...fadeIn} className="space-y-6">
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={staggerContainer} initial="initial" animate="animate">
        <StatCard icon={DollarSign} label="Total Revenue" value={`$${(totalRevenue / 1000).toFixed(0)}K`} change={14.5} changeLabel="vs last period" color="primary" />
        <StatCard icon={FileText} label="Invoices" value={totalOrders.toString()} change={9.2} changeLabel="vs last period" color="info" />
        <StatCard icon={BarChart3} label="Average Order" value={`$${avgOrder.toLocaleString()}`} change={3.8} changeLabel="increase" color="secondary" />
        <StatCard icon={Users} label="Top Customer" value="Nairobi Traders" change={18.3} changeLabel="volume" color="accent" />
      </motion.div>

      <Card padding="none" header={<div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-text-primary">Sales Records</h3><Badge variant="info">{salesRecords.length} invoices</Badge></div>}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50/80">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Items</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Qty (kg)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {salesRecords.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-primary">{r.id}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{r.date}</td>
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">{r.customer}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{r.items}</td>
                  <td className="px-4 py-3 text-sm text-right text-text-primary">{r.quantity.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-text-primary">${r.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={r.status === "Paid" ? "success" : r.status === "Pending" ? "warning" : "danger"} dot>{r.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
}

function ExpenseReport() {
  const totalSpent = expenseByCategory.reduce((s, c) => s + c.value, 0);
  const biggestCategory = expenseByCategory.reduce((max, c) => (c.value > max.value ? c : max), expenseByCategory[0]);
  const dailyAvg = Math.round(totalSpent / 30);
  return (
    <motion.div {...fadeIn} className="space-y-6">
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={staggerContainer} initial="initial" animate="animate">
        <StatCard icon={Receipt} label="Total Spent" value={`$${(totalSpent / 1000).toFixed(1)}K`} change={-5.2} changeLabel="vs last period" color="danger" />
        <StatCard icon={PieChartIcon} label="Biggest Category" value={biggestCategory.name} change={8.4} changeLabel={`${((biggestCategory.value / totalSpent) * 100).toFixed(1)}% of total`} color="primary" />
        <StatCard icon={BarChart3} label="Daily Average" value={`$${dailyAvg.toLocaleString()}`} change={-2.1} changeLabel="decrease" color="info" />
      </motion.div>

      <Card padding="none" header={<div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-text-primary">Expense Records</h3><Badge variant="warning">{expenseRecords.length} entries</Badge></div>}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50/80">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Vendor</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {expenseRecords.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-primary">{r.id}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{r.date}</td>
                  <td className="px-4 py-3">
                    <Badge variant={r.category === "Raw Materials" ? "success" : r.category === "Labor" ? "info" : r.category === "Utilities" ? "warning" : "default"} dot>{r.category}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-primary">{r.description}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{r.vendor}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-danger">${r.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
}

function FinancialSummary() {
  const totalRevenue = financialMonthly.reduce((s, d) => s + d.revenue, 0);
  const totalExpenses = financialMonthly.reduce((s, d) => s + d.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1);
  return (
    <motion.div {...fadeIn} className="space-y-6">
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={staggerContainer} initial="initial" animate="animate">
        <StatCard icon={DollarSign} label="Total Revenue" value={`$${(totalRevenue / 1000).toFixed(0)}K`} change={12.8} changeLabel="vs last period" color="primary" />
        <StatCard icon={Receipt} label="Total Expenses" value={`$${(totalExpenses / 1000).toFixed(0)}K`} change={6.4} changeLabel="vs last period" color="danger" />
        <StatCard icon={TrendingUp} label="Net Profit" value={`$${(totalProfit / 1000).toFixed(0)}K`} change={18.5} changeLabel="growth" color="secondary" />
        <StatCard icon={BarChart3} label="Profit Margin" value={`${profitMargin}%`} change={2.3} changeLabel="improvement" color="accent" />
      </motion.div>

      <Card padding="none" header={<h3 className="text-sm font-semibold text-text-primary px-6 py-4">Monthly Profit & Loss</h3>}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50/80">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Month</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Revenue</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Expenses</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Profit</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {financialMonthly.map((r) => {
                const margin = ((r.profit / r.revenue) * 100).toFixed(1);
                return (
                  <tr key={r.month} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-text-primary">{r.month} 2026</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-primary">${r.revenue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right text-danger">${r.expenses.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-secondary">${r.profit.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={`font-semibold ${Number(margin) >= 30 ? "text-success" : Number(margin) >= 20 ? "text-warning" : "text-danger"}`}>
                        {margin}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-primary/20 bg-primary/5">
                <td className="px-4 py-3 text-sm font-bold text-text-primary">Total</td>
                <td className="px-4 py-3 text-sm text-right font-bold text-primary">${totalRevenue.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-right font-bold text-danger">${totalExpenses.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-right font-bold text-secondary">${totalProfit.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-right font-bold text-primary">{profitMargin}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </motion.div>
  );
}

function InventoryReport() {
  const lowStockItems = inventoryItems.filter((item) => item.status === "Low");
  const totalValue = inventoryItems.reduce((s, item) => s + item.value, 0);
  return (
    <motion.div {...fadeIn} className="space-y-6">
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={staggerContainer} initial="initial" animate="animate">
        <StatCard icon={Package} label="Total SKUs" value={inventoryItems.length.toString()} change={2.1} changeLabel="new items" color="primary" />
        <StatCard icon={DollarSign} label="Total Value" value={`$${(totalValue / 1000).toFixed(1)}K`} change={6.8} changeLabel="increase" color="secondary" />
        <StatCard icon={AlertTriangle} label="Low Stock Alerts" value={lowStockItems.length.toString()} change={-12.5} changeLabel="fewer alerts" color="danger" />
        <StatCard icon={TrendingUp} label="Avg Fill Rate" value={`${Math.round(inventoryItems.reduce((s, i) => s + (i.stock / i.capacity) * 100, 0) / inventoryItems.length)}%`} change={3.4} changeLabel="improvement" color="info" />
      </motion.div>

        <Card padding="md" header={<div className="flex items-center gap-2"><AlertTriangle size={16} className="text-danger" /><h3 className="text-sm font-semibold text-text-primary">Low Stock Alerts</h3></div>}>
          <div className="space-y-3">
            {lowStockItems.map((item, i) => {
              const fillPercent = Math.round((item.stock / item.capacity) * 100);
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 rounded-xl border border-danger/20 bg-danger/5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-text-primary">{item.name}</p>
                    <Badge variant="danger" dot>Low</Badge>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${fillPercent}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full rounded-full bg-danger"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span>{item.stock.toLocaleString()} / {item.capacity.toLocaleString()} {item.unit}</span>
                    <span className="font-semibold text-danger">{fillPercent}%</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>

      <Card padding="none" header={<h3 className="text-sm font-semibold text-text-primary px-6 py-4">Inventory Valuation</h3>}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50/80">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Item</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Capacity</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Fill %</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Value</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {inventoryItems.map((item) => {
                const fillPercent = Math.round((item.stock / item.capacity) * 100);
                return (
                  <tr key={item.name} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-text-primary">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-right text-text-primary">{item.stock.toLocaleString()} {item.unit}</td>
                    <td className="px-4 py-3 text-sm text-right text-text-secondary">{item.capacity.toLocaleString()} {item.unit}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${fillPercent < 30 ? "bg-danger" : fillPercent < 60 ? "bg-warning" : "bg-success"}`} style={{ width: `${fillPercent}%` }} />
                        </div>
                        <span className={`font-semibold text-xs ${fillPercent < 30 ? "text-danger" : fillPercent < 60 ? "text-warning" : "text-success"}`}>{fillPercent}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-text-primary">${item.value.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={item.status === "Low" ? "danger" : "success"} dot>{item.status}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-primary/20 bg-primary/5">
                <td colSpan={4} className="px-4 py-3 text-sm font-bold text-text-primary">Total Inventory Value</td>
                <td className="px-4 py-3 text-sm text-right font-bold text-primary">${totalValue.toLocaleString()}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </motion.div>
  );
}

const reportComponents = {
  collection: CollectionReport,
  production: ProductionReport,
  sales: SalesReport,
  expense: ExpenseReport,
  financial: FinancialSummary,
  inventory: InventoryReport,
};

export default function ReportsPage() {
  const { success, info } = useToast();
  const { userProfile } = useAuth();
  const role = userProfile?.role || "admin";
  const allowedReportIds = ROLE_REPORTS[role] || [];
  const reportTypes = allReportTypes.filter((r) => allowedReportIds.includes(r.id));

  const [selectedReport, setSelectedReport] = useState(reportTypes[0]?.id || "collection");
  const [datePreset, setDatePreset] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      success("Report generated successfully!");
    }, 800);
  }, [success]);

  const handleExport = useCallback((type) => {
    if (type === "print") {
      window.print();
    } else if (type === "pdf") {
      info("PDF export coming soon!");
    } else if (type === "excel") {
      info("Excel export coming soon!");
    } else if (type === "email") {
      info("Email report coming soon!");
    }
  }, [info]);

  const ReportContent = reportComponents[selectedReport];
  const selectedReportInfo = reportTypes.find((r) => r.id === selectedReport);

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <BarChart3 size={28} className="text-primary" />
              Reports & Analytics
            </h1>
            <p className="text-sm text-text-secondary mt-1">Comprehensive reporting dashboard for Tea Factory Management</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" icon={Printer} onClick={() => handleExport("print")}>Print</Button>
            <Button variant="outline" size="sm" icon={Download} onClick={() => handleExport("pdf")}>PDF</Button>
            <Button variant="outline" size="sm" icon={FileText} onClick={() => handleExport("excel")}>Excel</Button>
            <Button variant="outline" size="sm" icon={Mail} onClick={() => handleExport("email")}>Email</Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <ReportTypeSelector selected={selectedReport} onSelect={setSelectedReport} reportTypes={reportTypes} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <DateRangePanel
            datePreset={datePreset}
            setDatePreset={setDatePreset}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Badge variant="success" dot>{selectedReportInfo?.label}</Badge>
            <span className="text-xs text-text-secondary">
              {datePreset === "custom" && startDate && endDate
                ? `${startDate} to ${endDate}`
                : `Showing data for ${datePresets.find((p) => p.value === datePreset)?.label || "This Month"}`
              }
            </span>
          </div>
          <Button variant="primary" size="md" icon={Filter} onClick={handleGenerate} loading={isGenerating}>
            Generate Report
          </Button>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div key={selectedReport}>
            <ReportContent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
