import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import {
  Plus,
  Receipt,
  DollarSign,
  Calendar,
  Clock,
  Tag,
  Eye,
  Pencil,
  Trash2,
  Download,
  Filter,
  Zap,
  Fuel,
  Wrench,
  Truck,
  Droplets,
  Users,
  MoreHorizontal,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import SearchInput from "../../components/ui/SearchInput";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";

const CATEGORIES = ["Electricity", "Fuel", "Maintenance", "Transport", "Water", "Salaries", "Other"];

const CATEGORY_ICONS = {
  Electricity: Zap,
  Fuel: Fuel,
  Maintenance: Wrench,
  Transport: Truck,
  Water: Droplets,
  Salaries: Users,
  Other: MoreHorizontal,
};

const CATEGORY_COLORS = {
  Electricity: "#F9A825",
  Fuel: "#E53935",
  Maintenance: "#1E88E5",
  Transport: "#8E24AA",
  Water: "#00ACC1",
  Salaries: "#2E7D32",
  Other: "#757575",
};

const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Check", "Mobile Money"];

const STATUSES = ["Approved", "Pending", "Rejected"];

const STATUS_VARIANT = {
  Approved: "success",
  Pending: "warning",
  Rejected: "danger",
};

const VENDORS = [
  "Ceylon Electricity Board", "Lanka Petroleum Corp", "ABC Engineering",
  "QuickFix Maintenance", "GreenTrans Logistics", "National Water Board",
  "People's Bank", "Dialog Mobile", "Hayleys Energy", "Lanka Ashok Leyland",
  "Perfetto Catering", "Ceylon Paper Co", "Sri Lanka Insurance",
];

const RECORDERS = [
  "Ravi Wickrama", "Thilina Weerasinghe", "Nipuni Wijesinghe",
  "Kavisha Dissanayake", "Anita Jayawardena",
];

function generateExpenses() {
  const expenses = [];
  const now = new Date();
  const descriptions = {
    Electricity: ["Monthly power bill - Factory", "Generator fuel top-up", "Transformer maintenance charge", "Night shift electricity surcharge", "Sub-station repair invoice"],
    Fuel: ["Diesel for delivery trucks", "Petrol for field vehicles", "Forklift refueling", "Backup generator diesel", "Transport fleet fuel"],
    Maintenance: ["Tea processing machine service", "Conveyor belt replacement", "Boiler inspection fee", "Packaging machine repair", "Cooling system maintenance"],
    Transport: ["Outbound tea shipment to Colombo", "Raw material pickup - Nuwara Eliya", "Equipment delivery from Kandy", "Farmer collection route fuel", "Monthly vehicle servicing"],
    Water: ["Monthly water utility bill", "Water treatment chemicals", "Cooling tower water supply", "Borehole pump maintenance", "Wastewater disposal fee"],
    Salaries: ["Monthly staff payroll", "Overtime payment - July", "Seasonal worker wages", "Night shift allowance", "Performance bonus disbursement"],
    Other: ["Office stationery order", "Tea tasting event catering", "Legal consultation fee", "Insurance premium payment", "Certification renewal fee"],
  };

  for (let i = 1; i <= 28; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const desc = descriptions[category];
    const amount = Math.round((200 + Math.random() * 18000) * 100) / 100;
    expenses.push({
      id: `EXP-${String(i).padStart(4, "0")}`,
      date: date.toISOString().split("T")[0],
      category,
      description: desc[Math.floor(Math.random() * desc.length)],
      amount,
      paymentMethod: PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)],
      vendor: VENDORS[Math.floor(Math.random() * VENDORS.length)],
      receiptNumber: Math.random() > 0.3 ? `RCT-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}-${String(i).padStart(4, "0")}` : "",
      recordedBy: RECORDERS[Math.floor(Math.random() * RECORDERS.length)],
      status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
      hasReceipt: Math.random() > 0.25,
      notes: Math.random() > 0.5 ? "Approved by factory manager" : "",
    });
  }
  return expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
}

const MOCK_EXPENSES = generateExpenses();

const PIE_CHART_DATA = CATEGORIES.map((cat) => ({
  name: cat,
  value: MOCK_EXPENSES.filter((e) => e.category === cat).reduce((sum, e) => sum + e.amount, 0),
})).filter((d) => d.value > 0);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 20, stiffness: 200 } },
};

export default function ExpensesPage() {
  const [expensesList, setExpensesList] = useState(MOCK_EXPENSES);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { success } = useToast();

  const stats = useMemo(() => {
    const total = expensesList.reduce((s, e) => s + e.amount, 0);
    const now = new Date();
    const thisMonth = expensesList.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, e) => s + e.amount, 0);
    const pending = expensesList.filter((e) => e.status === "Pending").length;
    const categories = new Set(expensesList.map((e) => e.category)).size;
    return { total, thisMonth, pending, categories };
  }, [expensesList]);

  const filtered = useMemo(() => {
    return expensesList.filter((e) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !e.description.toLowerCase().includes(q) &&
          !e.vendor.toLowerCase().includes(q) &&
          !e.id.toLowerCase().includes(q) &&
          !e.receiptNumber.toLowerCase().includes(q)
        ) return false;
      }
      if (categoryFilter && e.category !== categoryFilter) return false;
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      return true;
    });
  }, [expensesList, search, categoryFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function handleDelete() {
    setExpensesList((prev) => prev.filter((e) => e.id !== deleteModal.id));
    success(`Expense ${deleteModal.id} deleted successfully`);
    setDeleteModal(null);
  }

  function formatCurrency(val) {
    return `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Receipt size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
            <p className="text-sm text-gray-500">Track and manage all factory expenses</p>
          </div>
        </div>
        <Link to="/expenses/new">
          <Button icon={Plus}>Add Expense</Button>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Expenses", value: formatCurrency(stats.total), icon: DollarSign, color: "bg-primary/10 text-primary" },
          { label: "This Month", value: formatCurrency(stats.thisMonth), icon: Calendar, color: "bg-secondary/10 text-secondary" },
          { label: "Pending Approvals", value: stats.pending, icon: Clock, color: "bg-accent/10 text-accent" },
          { label: "Categories", value: stats.categories, icon: Tag, color: "bg-blue-100 text-blue-600" },
        ].map((stat, i) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon size={22} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card padding="none">
            <div className="p-4 border-b border-border">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex-1 w-full sm:max-w-md">
                  <SearchInput value={search} onChange={setSearch} placeholder="Search expenses..." />
                </div>
                <div className="flex gap-2">
                  <select
                    value={categoryFilter}
                    onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                    className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <Button
                    variant={showFilters ? "primary" : "outline"}
                    size="md"
                    icon={Filter}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    Date Filter {(dateFrom || dateTo) && (
                      <span className="ml-1 w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center">
                        {[dateFrom, dateTo].filter(Boolean).length}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">From Date</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">To Date</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-gray-50/80">
                    {["Date", "Category", "Description", "Amount", "Payment Method", "Recorded By", "Receipt", "Actions"].map((h) => (
                      <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider ${h === "Actions" ? "text-right" : ""}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <Receipt size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">No expenses found</h3>
                        <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((exp, idx) => {
                      const Icon = CATEGORY_ICONS[exp.category] || MoreHorizontal;
                      return (
                        <motion.tr
                          key={exp.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">{formatDate(exp.date)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${CATEGORY_COLORS[exp.category]}15` }}
                              >
                                <Icon size={14} style={{ color: CATEGORY_COLORS[exp.category] }} />
                              </div>
                              <span className="text-sm text-text-primary">{exp.category}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-text-primary max-w-[200px] truncate">{exp.description}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-primary whitespace-nowrap">{formatCurrency(exp.amount)}</td>
                          <td className="px-4 py-3">
                            <Badge variant="default">{exp.paymentMethod}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-text-secondary">{exp.recordedBy}</td>
                          <td className="px-4 py-3">
                            {exp.hasReceipt ? (
                              <button className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors cursor-pointer" title="Download receipt">
                                <Download size={15} />
                              </button>
                            ) : (
                              <span className="text-xs text-text-secondary/60">None</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link to={`/expenses/${exp.id}`}>
                                <button className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer" title="View">
                                  <Eye size={16} />
                                </button>
                              </Link>
                              <Link to={`/expenses/${exp.id}/edit`}>
                                <button className="p-2 rounded-lg text-gray-400 hover:text-secondary hover:bg-secondary/10 transition-colors cursor-pointer" title="Edit">
                                  <Pencil size={16} />
                                </button>
                              </Link>
                              <button
                                onClick={(e) => { e.stopPropagation(); setDeleteModal(exp); }}
                                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {filtered.length > 0 && (
              <div className="px-4 py-3 border-t border-border flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span>
                    Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Prev
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                          currentPage === page ? "bg-primary text-white" : "text-text-secondary hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Category Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PIE_CHART_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {PIE_CHART_DATA.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "13px" }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4 pt-4 border-t border-border">
              {PIE_CHART_DATA.sort((a, b) => b.value - a.value).map((item) => {
                const total = PIE_CHART_DATA.reduce((s, d) => s + d.value, 0);
                const pct = ((item.value / total) * 100).toFixed(1);
                return (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.name] }} />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-xs">{pct}%</span>
                      <span className="font-medium text-gray-900">{formatCurrency(item.value)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>

      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Expense"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        {deleteModal && (
          <p className="text-sm text-gray-600">
            Are you sure you want to delete expense <strong>{deleteModal.id}</strong> - {deleteModal.description}?
            This action cannot be undone.
          </p>
        )}
      </Modal>
    </motion.div>
  );
}
