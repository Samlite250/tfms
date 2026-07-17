import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Coffee,
  Factory,
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
  Filter,
  Check,
  Clock,
  Layers,
  Banknote,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
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
  { month: "Jan", greenCoffee: 8200, blackCoffee: 6400, robusta: 2100, total: 16700 },
  { month: "Feb", greenCoffee: 7500, blackCoffee: 5800, robusta: 1900, total: 15200 },
  { month: "Mar", greenCoffee: 9100, blackCoffee: 7200, robusta: 2500, total: 18800 },
  { month: "Apr", greenCoffee: 8400, blackCoffee: 6800, robusta: 2300, total: 17500 },
  { month: "May", greenCoffee: 10200, blackCoffee: 7900, robusta: 2800, total: 20900 },
  { month: "Jun", greenCoffee: 11500, blackCoffee: 8600, robusta: 3100, total: 23200 },
  { month: "Jul", greenCoffee: 9800, blackCoffee: 7400, robusta: 2600, total: 19800 },
];

const productionBatches = [
  { id: "BAT-1048", date: "2026-07-14", type: "Green Coffee", input: 1200, output: 285, yield: 23.75, quality: "A+", status: "Completed" },
  { id: "BAT-1047", date: "2026-07-13", type: "Black Coffee", input: 1500, output: 340, yield: 22.67, quality: "A", status: "Completed" },
  { id: "BAT-1046", date: "2026-07-12", type: "Robusta", input: 800, output: 178, yield: 22.25, quality: "A+", status: "Completed" },
  { id: "BAT-1045", date: "2026-07-11", type: "Green Coffee", input: 1100, output: 262, yield: 23.82, quality: "A", status: "Completed" },
  { id: "BAT-1044", date: "2026-07-10", type: "Black Coffee", input: 1400, output: 310, yield: 22.14, quality: "B+", status: "Completed" },
  { id: "BAT-1043", date: "2026-07-09", type: "Green Coffee", input: 1300, output: 312, yield: 24.0, quality: "A+", status: "Completed" },
];

const inventoryItems = [
  { name: "Green Coffee (Premium)", stock: 2800, capacity: 5000, unit: "kg", value: 35000, status: "Healthy" },
  { name: "Green Coffee (Grade A)", stock: 1950, capacity: 4000, unit: "kg", value: 19500, status: "Healthy" },
  { name: "Black Coffee (Premium)", stock: 420, capacity: 3500, unit: "kg", value: 5250, status: "Low" },
  { name: "Black Coffee (Grade A)", stock: 1200, capacity: 3500, unit: "kg", value: 12000, status: "Healthy" },
  { name: "Robusta", stock: 280, capacity: 2000, unit: "kg", value: 4200, status: "Low" },
  { name: "Coffee Pods (Green)", stock: 15000, capacity: 30000, unit: "pcs", value: 7500, status: "Healthy" },
  { name: "Coffee Pods (Black)", stock: 3200, capacity: 25000, unit: "pcs", value: 1600, status: "Low" },
  { name: "Packaging Boxes", stock: 8500, capacity: 12000, unit: "pcs", value: 4250, status: "Healthy" },
];

const paymentMonthlyData = [
  { month: "Jan", total: 420000, paid: 380000, pending: 40000 },
  { month: "Feb", total: 380000, paid: 350000, pending: 30000 },
  { month: "Mar", total: 520000, paid: 480000, pending: 40000 },
  { month: "Apr", total: 490000, paid: 450000, pending: 40000 },
  { month: "May", total: 610000, paid: 560000, pending: 50000 },
  { month: "Jun", total: 720000, paid: 680000, pending: 40000 },
  { month: "Jul", total: 650000, paid: 600000, pending: 50000 },
];

const paymentRecords = [
  { id: "PAY-2087", date: "2026-07-14", farmer: "Jean-Paul Habimana", grade: "AA", weight: 120, amount: 144000, status: "Paid", method: "Bank Transfer" },
  { id: "PAY-2086", date: "2026-07-13", farmer: "Marie Claire Uwimana", grade: "AB", weight: 85, amount: 85000, status: "Pending", method: "Mobile Money" },
  { id: "PAY-2085", date: "2026-07-12", farmer: "Emmanuel Ndayisaba", grade: "PB", weight: 150, amount: 165000, status: "Paid", method: "Cash" },
  { id: "PAY-2084", date: "2026-07-11", farmer: "Claudine Mukamana", grade: "AA", weight: 95, amount: 114000, status: "Paid", method: "Bank Transfer" },
  { id: "PAY-2083", date: "2026-07-10", farmer: "Jean Mugabo", grade: "C", weight: 200, amount: 160000, status: "Approved", method: "Mobile Money" },
  { id: "PAY-2082", date: "2026-07-09", farmer: "Arsene Nshimiyimana", grade: "TT", weight: 110, amount: 77000, status: "Paid", method: "Cash" },
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

function InventoryReport() {
  const lowStockItems = inventoryItems.filter((item) => item.status === "Low");
  const totalValue = inventoryItems.reduce((s, item) => s + item.value, 0);
  return (
    <motion.div {...fadeIn} className="space-y-6">
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={staggerContainer} initial="initial" animate="animate">
        <StatCard icon={Package} label="Total SKUs" value={inventoryItems.length.toString()} change={2.1} changeLabel="new items" color="primary" />
        <StatCard icon={DollarSign} label="Total Value" value={`RWF ${(totalValue / 1000).toFixed(1)}K`} change={6.8} changeLabel="increase" color="secondary" />
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

function PaymentReport() {
  const totalPayments = paymentMonthlyData.reduce((s, d) => s + d.total, 0);
  const totalPaid = paymentMonthlyData.reduce((s, d) => s + d.paid, 0);
  const totalPending = paymentMonthlyData.reduce((s, d) => s + d.pending, 0);
  const paidPercentage = ((totalPaid / totalPayments) * 100).toFixed(1);

  return (
    <motion.div {...fadeIn} className="space-y-6">
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={staggerContainer} initial="initial" animate="animate">
        <StatCard icon={Banknote} label="Total Payments" value={`RWF ${(totalPayments / 1000).toFixed(0)}K`} change={12.5} changeLabel="vs last period" color="primary" />
        <StatCard icon={Check} label="Paid" value={`RWF ${(totalPaid / 1000).toFixed(0)}K`} change={8.3} changeLabel="completed" color="secondary" />
        <StatCard icon={Clock} label="Pending" value={`RWF ${(totalPending / 1000).toFixed(0)}K`} change={-3.2} changeLabel="decrease" color="danger" />
        <StatCard icon={TrendingUp} label="Payment Rate" value={`${paidPercentage}%`} change={2.1} changeLabel="improvement" color="accent" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="md" header={<h3 className="text-sm font-semibold text-text-primary">Monthly Payments</h3>}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paymentMonthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `RWF ${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="paid" fill={COLORS.primary} name="Paid" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" fill={COLORS.accent} name="Pending" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card padding="md" header={<h3 className="text-sm font-semibold text-text-primary">Payment Distribution</h3>}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Paid', value: totalPaid },
                  { name: 'Pending', value: totalPending },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill={COLORS.primary} />
                <Cell fill={COLORS.accent} />
              </Pie>
              <Tooltip formatter={(value) => `RWF ${value.toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card padding="none" header={<div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-text-primary">Payment Records</h3><Badge variant="info">{paymentRecords.length} payments</Badge></div>}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50/80">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Payment #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Farmer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Grade</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Weight (kg)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paymentRecords.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-primary">{r.id}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{r.date}</td>
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">{r.farmer}</td>
                  <td className="px-4 py-3">
                    <Badge variant="info" dot>{r.grade}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-text-primary">{r.weight.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-primary">RWF {r.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={r.status === "Paid" ? "success" : r.status === "Pending" ? "warning" : "info"} dot>{r.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="default">{r.method}</Badge>
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

const allReportTypes = [
  { id: "collection", label: "Collection", icon: Coffee, description: "Coffee collection records and farmer participation" },
  { id: "production", label: "Production", icon: Factory, description: "Production batches and output metrics" },
  { id: "payment", label: "Payments", icon: Banknote, description: "Payment records, pending amounts, and disbursements" },
  { id: "inventory", label: "Inventory", icon: Package, description: "Stock levels, valuation, and alerts" },
];

const reportComponents = {
  collection: CollectionReport,
  production: ProductionReport,
  payment: PaymentReport,
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
            <p className="text-sm text-text-secondary mt-1">Comprehensive reporting dashboard for Coffee Factory Management</p>
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
