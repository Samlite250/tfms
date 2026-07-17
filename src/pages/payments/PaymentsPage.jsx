import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  DollarSign,
  Clock,
  CheckCircle,
  Users,
  TrendingUp,
  Eye,
  Pencil,
  Trash2,
  Filter,
  Calendar,
  Banknote,
  CreditCard,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import SearchInput from "../../components/ui/SearchInput";
import Modal from "../../components/ui/Modal";
import StatCard from "../../components/ui/StatCard";
import { useToast } from "../../components/ui/Toast";
import { formatCurrency } from "../../utils/helpers";

const STATUSES = ["All", "Pending", "Approved", "Paid", "Rejected"];
const STATUS_VARIANT = {
  Pending: "warning",
  Approved: "info",
  Paid: "success",
  Rejected: "danger",
};

const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Mobile Money", "Check"];

function generatePayments() {
  const payments = [];
  const farmers = [
    "Jean-Paul Habimana", "Marie Claire Uwimana", "Emmanuel Ndayisaba",
    "Claudine Mukamana", "Jean Mugabo", "Arsene Nshimiyimana",
    "Dative Uwera", "Patrick Sindzi", "Theogene Bigirimana",
    "Espérance Nyirarukundo", "Celestin Niyonzima", "Jacques Kwizera",
  ];
  const grades = ["AA", "AB", "PB", "C", "TT"];
  const GRADE_PRICES = { AA: 1200, AB: 1000, PB: 1100, C: 800, TT: 700 };
  const now = new Date();

  for (let i = 1; i <= 30; i++) {
    const daysAgo = Math.floor(Math.random() * 60);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    const farmer = farmers[Math.floor(Math.random() * farmers.length)];
    const grade = grades[Math.floor(Math.random() * grades.length)];
    const weight = Math.round((20 + Math.random() * 180) * 10) / 10;
    const pricePerKg = GRADE_PRICES[grade];
    const totalAmount = Math.round(weight * pricePerKg);
    const statuses = ["Pending", "Approved", "Paid", "Paid", "Paid"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    payments.push({
      id: `PAY-${String(i).padStart(4, "0")}`,
      paymentNumber: `PAY-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}-${String(i).padStart(4, "0")}`,
      date: date.toISOString().split("T")[0],
      farmer,
      collectionRef: `COL-${String(Math.floor(Math.random() * 24) + 1).padStart(4, "0")}`,
      grade,
      weight,
      pricePerKg,
      totalAmount,
      status,
      paymentMethod: PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)],
      approvedBy: status !== "Pending" ? "Admin User" : "",
      approvedDate: status !== "Pending" ? date.toISOString().split("T")[0] : "",
      notes: Math.random() > 0.5 ? "Regular payment for coffee delivery" : "",
    });
  }
  return payments.sort((a, b) => new Date(b.date) - new Date(a.date));
}

const MOCK_PAYMENTS = generatePayments();

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 20, stiffness: 200 } },
};

export default function PaymentsPage() {
  const { success } = useToast();
  const [paymentsList, setPaymentsList] = useState(MOCK_PAYMENTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const stats = useMemo(() => {
    const total = paymentsList.reduce((s, p) => s + p.totalAmount, 0);
    const paid = paymentsList.filter((p) => p.status === "Paid").reduce((s, p) => s + p.totalAmount, 0);
    const pending = paymentsList.filter((p) => p.status === "Pending").reduce((s, p) => s + p.totalAmount, 0);
    const farmers = new Set(paymentsList.map((p) => p.farmer)).size;
    return { total, paid, pending, farmers };
  }, [paymentsList]);

  const filtered = useMemo(() => {
    return paymentsList.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !p.paymentNumber.toLowerCase().includes(q) &&
          !p.farmer.toLowerCase().includes(q) &&
          !p.collectionRef.toLowerCase().includes(q)
        ) return false;
      }
      if (statusFilter !== "All" && p.status !== statusFilter) return false;
      if (dateFrom && p.date < dateFrom) return false;
      if (dateTo && p.date > dateTo) return false;
      return true;
    });
  }, [paymentsList, search, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function handleDelete() {
    setPaymentsList((prev) => prev.filter((p) => p.id !== deleteModal.id));
    success(`Payment ${deleteModal.paymentNumber} deleted successfully`);
    setDeleteModal(null);
  }

  function handleApprove(payment) {
    setPaymentsList((prev) =>
      prev.map((p) =>
        p.id === payment.id
          ? { ...p, status: "Approved", approvedBy: "Admin User", approvedDate: new Date().toISOString().split("T")[0] }
          : p
      )
    );
    success(`Payment ${payment.paymentNumber} approved`);
  }

  function handleMarkPaid(payment) {
    setPaymentsList((prev) =>
      prev.map((p) =>
        p.id === payment.id
          ? { ...p, status: "Paid", approvedDate: new Date().toISOString().split("T")[0] }
          : p
      )
    );
    success(`Payment ${payment.paymentNumber} marked as paid`);
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
            <Banknote size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
            <p className="text-sm text-gray-500">Manage farmer payments, approvals, and history</p>
          </div>
        </div>
        <Link to="/payments/new">
          <Button icon={Plus}>Create Payment</Button>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Payments", value: formatCurrency(stats.total), icon: DollarSign, color: "text-primary", bg: "bg-primary/10", borderColor: "#2E7D32", change: "+12.5%", up: true },
          { label: "Paid", value: formatCurrency(stats.paid), icon: CheckCircle, color: "text-success", bg: "bg-success/10", borderColor: "#43A047", change: "+8.3%", up: true },
          { label: "Pending", value: formatCurrency(stats.pending), icon: Clock, color: "text-warning", bg: "bg-warning/10", borderColor: "#F57C00", change: "-3", up: false },
          { label: "Farmers Paid", value: stats.farmers, icon: Users, color: "text-info", bg: "bg-info/10", borderColor: "#0288D1", change: "+5", up: true },
        ].map((stat, idx) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            up={stat.up}
            color={stat.color}
            bg={stat.bg}
            borderColor={stat.borderColor}
            delay={idx * 0.06}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card padding="none">
            <div className="p-4 border-b border-border">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex-1 w-full sm:max-w-md">
                  <SearchInput value={search} onChange={setSearch} placeholder="Search payments, farmers..." />
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                    <span className="text-gray-400 text-sm">to</span>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <Button
                    variant={showFilters ? "primary" : "outline"}
                    size="md"
                    icon={Filter}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    Status
                  </Button>
                </div>
              </div>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 flex flex-wrap gap-2"
                >
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        statusFilter === s
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-gray-50/80">
                    {["Payment #", "Date", "Farmer", "Grade", "Weight", "Amount", "Status", "Actions"].map((h) => (
                      <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${h === "Actions" ? "text-right" : ""}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <Banknote size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">No payments found</h3>
                        <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((payment, idx) => (
                      <motion.tr
                        key={payment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-primary">{payment.paymentNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(payment.date)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{payment.farmer}</td>
                        <td className="px-4 py-3">
                          <Badge variant="info" dot>{payment.grade}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{payment.weight} kg</td>
                        <td className="px-4 py-3 text-sm font-semibold text-primary">{formatCurrency(payment.totalAmount)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={STATUS_VARIANT[payment.status]} dot>{payment.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link to={`/payments/${payment.id}`}>
                              <button className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer" title="View">
                                <Eye size={16} />
                              </button>
                            </Link>
                            {payment.status === "Pending" && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleApprove(payment); }}
                                className="p-2 rounded-lg text-gray-400 hover:text-success hover:bg-success/10 transition-colors cursor-pointer"
                                title="Approve"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                            {payment.status === "Approved" && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleMarkPaid(payment); }}
                                className="p-2 rounded-lg text-gray-400 hover:text-success hover:bg-success/10 transition-colors cursor-pointer"
                                title="Mark Paid"
                              >
                                <CreditCard size={16} />
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteModal(payment); }}
                              className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filtered.length > 0 && (
              <div className="px-4 py-3 border-t border-border flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>
                    Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Prev
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) page = i + 1;
                    else if (currentPage <= 3) page = i + 1;
                    else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                    else page = currentPage - 2 + i;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                          currentPage === page ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
            <h3 className="text-base font-semibold text-gray-900 mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-success/5 border border-success/20">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-success" />
                  <span className="text-sm text-gray-600">Paid</span>
                </div>
                <span className="text-sm font-semibold text-success">{formatCurrency(stats.paid)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-warning/5 border border-warning/20">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-warning" />
                  <span className="text-sm text-gray-600">Pending</span>
                </div>
                <span className="text-sm font-semibold text-warning">{formatCurrency(stats.pending)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">Total</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{formatCurrency(stats.total)}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Payment"
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
            Are you sure you want to delete payment <strong>{deleteModal.paymentNumber}</strong>?
            This action cannot be undone.
          </p>
        )}
      </Modal>
    </motion.div>
  );
}
