import { useState, useMemo, useCallback } from "react";
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
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from "recharts";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../contexts/AuthContext";
import { ROLE_REPORTS } from "../../utils/constants";
import { useRealtimeCollection } from "../../hooks/useRealtimeCollection";
import { collectionsSeed, productionSeed } from "../../firebase/seedData";
import { formatCurrency } from "../../utils/helpers";

const COLORS = {
  primary: "#10B981",
  primaryDark: "#059669",
  emerald: "#059669",
  amber: "#F59E0B",
  blue: "#3B82F6",
  purple: "#8B5CF6",
  rose: "#F43F5E",
  slate: "#64748B",
};

const datePresets = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
  { value: "custom", label: "Custom Range" },
];

const allReportTypes = [
  { id: "collection", label: "Coffee Collections", icon: Coffee, desc: "Cherry delivery & farmer logs" },
  { id: "production", label: "Factory Production", icon: Factory, desc: "Processing stages & outturns" },
  { id: "payment", label: "Farmer Payments", icon: Banknote, desc: "Payouts & pending balances" },
  { id: "inventory", label: "Stock & Inventory", icon: Package, desc: "Raw cherries & processed grades" },
];

function StatCard({ icon: Icon, label, value, change, changeLabel, color = "emerald" }) {
  const isPositive = change >= 0;

  const bgColors = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <Card padding="md" className="relative overflow-hidden border border-border/80 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">{label}</p>
          <h3 className="text-2xl font-bold text-text-primary tracking-tight">{value}</h3>
          {change !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`inline-flex items-center text-xs font-bold px-1.5 py-0.5 rounded ${isPositive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                {isPositive ? <ArrowUpRight size={12} className="mr-0.5" /> : <ArrowDownRight size={12} className="mr-0.5" />}
                {isPositive ? "+" : ""}{change}%
              </span>
              {changeLabel && <span className="text-xs text-text-secondary">{changeLabel}</span>}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-2xl border ${bgColors[color] || bgColors.emerald}`}>
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );
}

function CollectionReportTab({ collections }) {
  const totalWeight = useMemo(() => collections.reduce((s, c) => s + (Number(c.weight) || 0), 0), [collections]);
  const totalValue = useMemo(() => collections.reduce((s, c) => s + (Number(c.amount) || 0), 0), [collections]);
  const uniqueFarmers = useMemo(() => new Set(collections.map((c) => c.farmer).filter(Boolean)).size, [collections]);
  const avgWeight = collections.length ? Math.round(totalWeight / collections.length) : 0;

  const chartData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, idx) => {
      const dayWeight = collections
        .filter((_, i) => i % 7 === idx)
        .reduce((s, c) => s + (Number(c.weight) || 0), 0) || Math.floor(1200 + Math.random() * 800);
      return { day, weight: dayWeight, target: 1500 };
    });
  }, [collections]);

  const gradePieData = useMemo(() => {
    const counts = {};
    collections.forEach((c) => {
      const g = c.grade || "AA";
      counts[g] = (counts[g] || 0) + (Number(c.weight) || 0);
    });
    return Object.keys(counts).map((g) => ({ name: `Grade ${g}`, value: counts[g] }));
  }, [collections]);

  const PIE_COLORS = [COLORS.emerald, COLORS.blue, COLORS.amber, COLORS.purple, COLORS.rose];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Coffee} label="Total Coffee Received" value={`${totalWeight.toLocaleString()} kg`} change={12.4} changeLabel="vs last month" color="emerald" />
        <StatCard icon={DollarSign} label="Total Cherry Value" value={formatCurrency(totalValue)} change={8.7} changeLabel="vs last month" color="blue" />
        <StatCard icon={Users} label="Active Farmers" value={uniqueFarmers.toString()} change={5.2} changeLabel="registered" color="purple" />
        <StatCard icon={TrendingUp} label="Avg Batch Weight" value={`${avgWeight} kg`} change={3.1} changeLabel="per delivery" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card padding="md" className="lg:col-span-2" header={
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600" /> Daily Cherry Collection Trend (kg)
            </h3>
            <Badge variant="success">Live Feed</Badge>
          </div>
        }>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', color: '#fff', border: 'none' }}
                  formatter={(val) => [`${val.toLocaleString()} kg`, "Collected"]}
                />
                <Area type="monotone" dataKey="weight" stroke={COLORS.emerald} strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card padding="md" header={
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <PieChart size={18} className="text-blue-600" /> Grade Distribution
          </h3>
        }>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradePieData.length ? gradePieData : [{ name: "Grade AA", value: 450 }, { name: "Grade AB", value: 300 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {gradePieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => `${val.toLocaleString()} kg`} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card padding="none" header={
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-sm font-bold text-text-primary">Recent Collection Logs</h3>
          <Badge variant="info">{collections.length} entries</Badge>
        </div>
      }>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-text-secondary text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5">Receipt #</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Farmer</th>
                <th className="px-6 py-3.5">Center</th>
                <th className="px-6 py-3.5">Grade</th>
                <th className="px-6 py-3.5 text-right">Weight (kg)</th>
                <th className="px-6 py-3.5 text-right">Total (RWF)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {collections.slice(0, 8).map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-3.5 font-mono font-medium text-emerald-600">{item.receiptNumber || item.id}</td>
                  <td className="px-6 py-3.5 text-text-secondary">{item.date}</td>
                  <td className="px-6 py-3.5 font-semibold text-text-primary">{item.farmer}</td>
                  <td className="px-6 py-3.5 text-text-secondary">{item.center || "Main Factory"}</td>
                  <td className="px-6 py-3.5">
                    <Badge variant={item.grade === "AA" ? "success" : item.grade === "AB" ? "info" : "warning"} dot>
                      Grade {item.grade || "AA"}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5 text-right font-semibold text-text-primary">{(Number(item.weight) || 0).toLocaleString()} kg</td>
                  <td className="px-6 py-3.5 text-right font-bold text-emerald-700">{formatCurrency(item.amount || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ProductionReportTab({ batches }) {
  const totalInput = batches.reduce((s, b) => s + (Number(b.cherryWeight) || Number(b.input) || 0), 0);
  const totalOutput = batches.reduce((s, b) => s + (Number(b.cleanWeight) || Number(b.output) || 0), 0);
  const avgYield = totalInput > 0 ? ((totalOutput / totalInput) * 100).toFixed(1) : "22.5";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Factory} label="Input Cherries" value={`${totalInput.toLocaleString()} kg`} change={14.2} changeLabel="processed" color="emerald" />
        <StatCard icon={Coffee} label="Clean Coffee Output" value={`${totalOutput.toLocaleString()} kg`} change={10.1} changeLabel="milled" color="blue" />
        <StatCard icon={TrendingUp} label="Outturn Yield %" value={`${avgYield}%`} change={1.8} changeLabel="conversion" color="purple" />
        <StatCard icon={Layers} label="Active Processing Batches" value={batches.length.toString()} change={0} changeLabel="in factory" color="amber" />
      </div>

      <Card padding="none" header={
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-sm font-bold text-text-primary">Factory Processing Batches Overview</h3>
          <Badge variant="success">Factory Active</Badge>
        </div>
      }>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-text-secondary text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5">Batch Code</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Coffee Grade</th>
                <th className="px-6 py-3.5 text-right">Input Weight (kg)</th>
                <th className="px-6 py-3.5 text-right">Clean Output (kg)</th>
                <th className="px-6 py-3.5 text-center">Stage</th>
                <th className="px-6 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-3.5 font-mono font-medium text-emerald-600">{b.batchNumber || b.id}</td>
                  <td className="px-6 py-3.5 text-text-secondary">{b.date}</td>
                  <td className="px-6 py-3.5 font-semibold text-text-primary">Grade {b.grade || "AA"}</td>
                  <td className="px-6 py-3.5 text-right text-text-primary">{(Number(b.cherryWeight) || Number(b.input) || 0).toLocaleString()} kg</td>
                  <td className="px-6 py-3.5 text-right font-semibold text-emerald-600">{(Number(b.cleanWeight) || Number(b.output) || 0).toLocaleString()} kg</td>
                  <td className="px-6 py-3.5 text-center">
                    <Badge variant="info" dot>{b.stage || "Drying"}</Badge>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <Badge variant="success" dot>{b.status || "Completed"}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function PaymentReportTab({ collections }) {
  const totalPaid = collections.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const pendingCount = collections.filter(c => c.status === "Pending").length;
  const pendingAmount = collections.filter(c => c.status === "Pending").reduce((s, c) => s + (Number(c.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Banknote} label="Total Disbursed Payouts" value={formatCurrency(totalPaid)} change={15.3} changeLabel="paid to farmers" color="emerald" />
        <StatCard icon={Clock} label="Pending Payout Balance" value={formatCurrency(pendingAmount || 450000)} change={-4.5} changeLabel="due" color="amber" />
        <StatCard icon={Users} label="Paid Farmers" value={collections.length.toString()} change={9.2} changeLabel="transactions" color="blue" />
        <StatCard icon={Check} label="Payout Success Rate" value="98.5%" change={1.2} changeLabel="on time" color="purple" />
      </div>

      <Card padding="none" header={
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-sm font-bold text-text-primary">Farmer Payout Disbursement Log</h3>
          <Badge variant="info">Mobile Money & Bank</Badge>
        </div>
      }>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-text-secondary text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5">Transaction ID</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Farmer Name</th>
                <th className="px-6 py-3.5">Grade</th>
                <th className="px-6 py-3.5 text-right">Qty Delivered</th>
                <th className="px-6 py-3.5 text-right">Amount (RWF)</th>
                <th className="px-6 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {collections.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-3.5 font-mono font-medium text-emerald-600">PAY-{(item.id || "101").slice(-5)}</td>
                  <td className="px-6 py-3.5 text-text-secondary">{item.date}</td>
                  <td className="px-6 py-3.5 font-semibold text-text-primary">{item.farmer}</td>
                  <td className="px-6 py-3.5">
                    <Badge variant="default" dot>Grade {item.grade || "AA"}</Badge>
                  </td>
                  <td className="px-6 py-3.5 text-right text-text-primary">{(Number(item.weight) || 0).toLocaleString()} kg</td>
                  <td className="px-6 py-3.5 text-right font-bold text-emerald-700">{formatCurrency(item.amount || 0)}</td>
                  <td className="px-6 py-3.5 text-center">
                    <Badge variant="success" dot>Paid</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function InventoryReportTab() {
  const stockItems = [
    { name: "Green Coffee (Grade AA)", stock: 4500, capacity: 6000, unit: "kg", value: 5400000, status: "Healthy" },
    { name: "Green Coffee (Grade AB)", stock: 2800, capacity: 5000, unit: "kg", value: 2800000, status: "Healthy" },
    { name: "Dry Parchment (AA)", stock: 850, capacity: 4000, unit: "kg", value: 935000, status: "Low" },
    { name: "Parchment Coffee (AB)", stock: 1200, capacity: 3500, unit: "kg", value: 1200000, status: "Healthy" },
    { name: "Export Grade Peaberry (PB)", stock: 640, capacity: 2000, unit: "kg", value: 896000, status: "Low" },
    { name: "Factory Packaging Bags", stock: 1250, capacity: 2000, unit: "pcs", value: 375000, status: "Healthy" },
  ];

  const totalValue = stockItems.reduce((s, i) => s + i.value, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Total Inventory Value" value={formatCurrency(totalValue)} change={6.4} changeLabel="in warehouse" color="emerald" />
        <StatCard icon={Coffee} label="Green Coffee Stock" value="7,300 kg" change={8.1} changeLabel="ready for export" color="blue" />
        <StatCard icon={AlertTriangle} label="Low Stock Items" value="2 SKUs" change={-1} changeLabel="reorder soon" color="rose" />
        <StatCard icon={TrendingUp} label="Warehouse Capacity" value="72%" change={3.2} changeLabel="filled" color="purple" />
      </div>

      <Card padding="none" header={
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-sm font-bold text-text-primary">Warehouse Stock Valuation & Levels</h3>
          <Badge variant="info">Mahembe Main Warehouse</Badge>
        </div>
      }>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-text-secondary text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5">Inventory Item</th>
                <th className="px-6 py-3.5 text-right">Current Stock</th>
                <th className="px-6 py-3.5 text-right">Max Capacity</th>
                <th className="px-6 py-3.5">Capacity Bar</th>
                <th className="px-6 py-3.5 text-right">Stock Value (RWF)</th>
                <th className="px-6 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stockItems.map((item) => {
                const fill = Math.round((item.stock / item.capacity) * 100);
                return (
                  <tr key={item.name} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-text-primary">{item.name}</td>
                    <td className="px-6 py-3.5 text-right text-text-primary">{item.stock.toLocaleString()} {item.unit}</td>
                    <td className="px-6 py-3.5 text-right text-text-secondary">{item.capacity.toLocaleString()} {item.unit}</td>
                    <td className="px-6 py-3.5 w-48">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${fill < 30 ? "bg-rose-500" : fill < 60 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${fill}%` }} />
                        </div>
                        <span className="text-xs font-bold text-text-secondary">{fill}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right font-bold text-emerald-700">{formatCurrency(item.value)}</td>
                    <td className="px-6 py-3.5 text-center">
                      <Badge variant={item.status === "Low" ? "danger" : "success"} dot>{item.status}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default function ReportsPage() {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const role = userProfile?.role || "admin";

  const allowedReportIds = ROLE_REPORTS[role] || ["collection", "production", "payment", "inventory"];
  const reportTypes = allReportTypes.filter((r) => allowedReportIds.includes(r.id));

  const [activeReportTab, setActiveReportTab] = useState(reportTypes[0]?.id || "collection");
  const [datePreset, setDatePreset] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: collectionsList } = useRealtimeCollection("coffeeCollections", collectionsSeed);
  const { data: productionList } = useRealtimeCollection("productionBatches", productionSeed);

  const handleExport = useCallback((type) => {
    if (type === "print") {
      window.print();
    } else {
      toast.info(`${type.toUpperCase()} report generation requested. Downloading...`);
    }
  }, [toast]);

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Report metrics recalculated!");
    }, 500);
  }, [toast]);

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-border shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <BarChart3 size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary tracking-tight">Reports & Factory Analytics</h1>
                <p className="text-xs text-text-secondary mt-0.5">Real-time overview of collection, production yield, and payouts</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" icon={Printer} onClick={() => handleExport("print")}>Print</Button>
            <Button variant="outline" size="sm" icon={Download} onClick={() => handleExport("pdf")}>PDF</Button>
            <Button variant="outline" size="sm" icon={FileText} onClick={() => handleExport("excel")}>Excel</Button>
            <Button variant="outline" size="sm" icon={Mail} onClick={() => handleExport("email")}>Email</Button>
          </div>
        </div>

        {/* Tab Switcher & Date Filters Toolbar */}
        <div className="bg-white p-3 rounded-2xl border border-border shadow-sm space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Report Type Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              {reportTypes.map((rt) => {
                const Icon = rt.icon;
                const isActive = activeReportTab === rt.id;
                return (
                  <button
                    key={rt.id}
                    onClick={() => setActiveReportTab(rt.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap cursor-pointer transition-all duration-200
                      ${isActive
                        ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                        : "text-text-secondary hover:text-text-primary hover:bg-gray-100"
                      }
                    `}
                  >
                    <Icon size={18} />
                    <span>{rt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Date Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1">
                {datePresets.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setDatePreset(p.value)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150
                      ${datePreset === p.value
                        ? "bg-white text-text-primary shadow-xs font-bold"
                        : "text-text-secondary hover:text-text-primary"
                      }
                    `}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <Button variant="secondary" size="sm" icon={Filter} onClick={handleGenerate} loading={isGenerating}>
                Apply Filter
              </Button>
            </div>
          </div>

          {/* Custom Date Range Picker (Conditional) */}
          {datePreset === "custom" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-3 border-t border-border flex items-center gap-3 flex-wrap"
            >
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
            </motion.div>
          )}
        </div>

        {/* Tab Content Rendering */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeReportTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeReportTab === "collection" && <CollectionReportTab collections={collectionsList || []} />}
            {activeReportTab === "production" && <ProductionReportTab batches={productionList || []} />}
            {activeReportTab === "payment" && <PaymentReportTab collections={collectionsList || []} />}
            {activeReportTab === "inventory" && <InventoryReportTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
