import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  DollarSign,
  Clock,
  FileText,
  TrendingUp,
  Pencil,
  Trash2,
  Eye,
  Filter,
  Calendar,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import DataTable from "../../components/ui/DataTable";
import SearchInput from "../../components/ui/SearchInput";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";

const STATUS_OPTIONS = [
  { value: "Paid", label: "Paid" },
  { value: "Pending", label: "Pending" },
  { value: "Overdue", label: "Overdue" },
];

const CUSTOMERS = [
  "Emerald Tea Traders",
  "Green Valley Imports",
  "Pacific Rim Beverages",
  "Highland Exports Ltd.",
  "Oriental Tea House",
  "Zenith Beverages Co.",
  "Sunrise Trading",
  "Mountain Dew Distributors",
  "Royal Tea Merchants",
  "Global Leaf Co.",
  "Aroma Tea International",
  "Herbal Harmony Ltd.",
  "Leaf & Cup Co.",
  "Misty Morning Imports",
  "Silk Road Tea Co.",
];

const TEA_GRADES = [
  "OP1", "OPA", "OPB", "OPC", "OPD", "BOP1", "BOP", "BOPF",
  "BPS1", "BPS", "PF1", "PD1", "D1", "D2", "Dust1", "Dust2",
  "Green Tea Premium", "Green Tea Standard", "Oolong", "White Tea",
];

function generateInvoiceNo(idx) {
  const num = String(idx).padStart(4, "0");
  return `INV-2026-${num}`;
}

function randomItems() {
  const count = Math.floor(Math.random() * 3) + 1;
  const items = [];
  const used = new Set();
  for (let i = 0; i < count; i++) {
    let grade;
    do {
      grade = TEA_GRADES[Math.floor(Math.random() * TEA_GRADES.length)];
    } while (used.has(grade));
    used.add(grade);
    const qty = Math.floor(Math.random() * 200) + 10;
    const price = +(Math.random() * 30 + 5).toFixed(2);
    items.push({ grade, quantity: qty, unitPrice: price, total: +(qty * price).toFixed(2) });
  }
  return items;
}

const MOCK_SALES = Array.from({ length: 24 }, (_, i) => {
  const items = randomItems();
  const subtotal = items.reduce((s, it) => s + it.total, 0);
  const tax = +(subtotal * 0.16).toFixed(2);
  const discount = i % 5 === 0 ? +(subtotal * 0.05).toFixed(2) : 0;
  const total = +(subtotal + tax - discount).toFixed(2);
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
  const month = String(Math.floor(Math.random() * 7) + 1).padStart(2, "0");
  const statuses = ["Paid", "Paid", "Paid", "Pending", "Pending", "Overdue"];
  return {
    id: i + 1,
    invoiceNo: generateInvoiceNo(i + 1),
    date: `2026-${month}-${day}`,
    customer: CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)],
    items,
    subtotal,
    tax,
    discount,
    total,
    paymentMethod: ["Cash", "Bank Transfer", "Mobile Money"][Math.floor(Math.random() * 3)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    dueDate: `2026-${month}-${String(Math.min(28, Number(day) + 30)).padStart(2, "0")}`,
    notes: i % 3 === 0 ? "Bulk order - expedited shipping" : "",
  };
});

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const staggerContainer = { visible: { transition: { staggerChildren: 0.05 } } };

function SalesPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [salesList, setSalesList] = useState(MOCK_SALES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [dateFilter, setDateFilter] = useState("");
  const [deleteModal, setDeleteModal] = useState({ open: false, sale: null });

  const filteredSales = useMemo(() => {
    let sales = salesList;
    if (statusFilter) {
      sales = sales.filter((s) => s.status === statusFilter);
    }
    if (dateFilter) {
      sales = sales.filter((s) => s.date.startsWith(dateFilter));
    }
    if (search) {
      const q = search.toLowerCase();
      sales = sales.filter(
        (s) =>
          s.invoiceNo.toLowerCase().includes(q) ||
          s.customer.toLowerCase().includes(q)
      );
    }
    return sales;
  }, [salesList, search, statusFilter, dateFilter]);

  const stats = useMemo(() => {
    const totalSales = salesList.reduce((s, sale) => s + sale.total, 0);
    const pending = salesList
      .filter((s) => s.status === "Pending" || s.status === "Overdue")
      .reduce((s, sale) => s + sale.total, 0);
    const thisMonth = salesList
      .filter((s) => s.date.startsWith("2026-07"))
      .reduce((s, sale) => s + sale.total, 0);
    return {
      total: totalSales,
      pending,
      invoices: salesList.length,
      thisMonth,
    };
  }, [salesList]);

  function handleDelete(sale) {
    setDeleteModal({ open: true, sale });
  }

  function confirmDelete() {
    setSalesList((prev) => prev.filter((s) => s.id !== deleteModal.sale.id));
    toast.success(`Invoice ${deleteModal.sale.invoiceNo} has been deleted.`);
    setDeleteModal({ open: false, sale: null });
  }

  const statusVariant = (status) => {
    if (status === "Paid") return "success";
    if (status === "Pending") return "warning";
    return "danger";
  };

  const columns = [
    {
      header: "Invoice #",
      accessor: "invoiceNo",
      render: (row) => (
        <span className="font-semibold text-primary">{row.invoiceNo}</span>
      ),
    },
    {
      header: "Date",
      accessor: "date",
    },
    {
      header: "Customer",
      accessor: "customer",
      render: (row) => (
        <span className="font-medium text-text-primary">{row.customer}</span>
      ),
    },
    {
      header: "Items",
      accessor: "itemsCount",
      sortable: false,
      render: (row) => (
        <span className="text-text-secondary">{row.items.length} item{row.items.length > 1 ? "s" : ""}</span>
      ),
    },
    {
      header: "Total Amount",
      accessor: "total",
      render: (row) => (
        <span className="font-semibold text-text-primary">
          ${row.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <Badge variant={statusVariant(row.status)} dot>{row.status}</Badge>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-bg p-4 md:p-8">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Sales Management</h1>
            <p className="text-text-secondary mt-1">Track invoices, payments, and customer orders</p>
          </div>
          <Button icon={Plus} onClick={() => navigate("/sales/new")}>
            New Sale
          </Button>
        </motion.div>

        <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Sales", value: `$${stats.total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10", borderColor: "#2E7D32" },
            { label: "Pending Payments", value: `$${stats.pending.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: Clock, color: "text-warning", bg: "bg-warning/10", borderColor: "#F57C00" },
            { label: "Invoices", value: stats.invoices, icon: FileText, color: "text-info", bg: "bg-info/10", borderColor: "#0288D1" },
            { label: "This Month", value: `$${stats.thisMonth.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: TrendingUp, color: "text-success", bg: "bg-success/10", borderColor: "#43A047" },
          ].map((stat, idx) => (
            <Card key={idx} hover shadow="sm" padding="md" className="border-l-4" style={{ borderLeftColor: stat.borderColor }}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon size={24} className={stat.color} />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">{stat.label}</p>
                  <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card padding="none" shadow="md">
            <div className="px-6 py-4 border-b border-border">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search invoices, customers..."
                  className="flex-1 md:max-w-sm"
                />
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-text-secondary" />
                    <input
                      type="month"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <Filter size={16} className="text-text-secondary shrink-0" />
                    {["All", "Paid", "Pending", "Overdue"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status === "All" ? null : status)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                          (status === "All" && !statusFilter) || statusFilter === status
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={filteredSales}
              searchable={false}
              pageSize={10}
              onRowClick={(row) => navigate(`/sales/${row.id}`)}
              actions={(row) => (
                <>
                  <button
                    onClick={() => navigate(`/sales/${row.id}`)}
                    className="p-2 rounded-lg text-text-secondary hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                    title="View"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => navigate(`/sales/${row.id}/edit`)}
                    className="p-2 rounded-lg text-text-secondary hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(row)}
                    className="p-2 rounded-lg text-text-secondary hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            />
          </Card>
        </motion.div>
      </motion.div>

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, sale: null })}
        title="Delete Invoice"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal({ open: false, sale: null })}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-text-secondary">
          Are you sure you want to delete invoice <strong className="text-text-primary">{deleteModal.sale?.invoiceNo}</strong>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

export default SalesPage;
