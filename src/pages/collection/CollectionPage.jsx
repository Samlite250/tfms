import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Weight,
  Calendar,
  Users,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Leaf,
  Filter,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import SearchInput from "../../components/ui/SearchInput";
import DataTable from "../../components/ui/DataTable";
import Modal from "../../components/ui/Modal";

const TEA_GRADES = ["PF1", "PF2", "PF3", "PD", "Dust", "Fannings"];

const gradeBadgeVariant = {
  PF1: "success",
  PF2: "info",
  PF3: "warning",
  PD: "default",
  Dust: "danger",
  Fannings: "info",
};

const farmers = [
  "James Kamau", "Grace Wanjiku", "Peter Mwangi", "Mary Njeri",
  "John Ochieng", "Sarah Akinyi", "David Kipchoge", "Faith Jepkorir",
  "Robert Simiyu", "Anne Chebet", "Samuel Mutua", "Lucy Wairimu",
];

const centers = [
  "Kericho Central", "Nandi Hills", "Kisii Highlands",
  "Nyeri Mount Kenya", "Murang'a Valley", "Kiambu Ridge",
];

const collectors = [
  "Michael Otieno", "Patricia Wambui", "Daniel Kiptoo", "Rose Adhiambo",
];

const GRADE_PRICES = { PF1: 850, PF2: 750, PF3: 650, PD: 550, Dust: 480, Fannings: 520 };

function generateCollections() {
  const records = [];
  const now = new Date();
  for (let i = 1; i <= 24; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    const grade = TEA_GRADES[Math.floor(Math.random() * TEA_GRADES.length)];
    const weight = Math.round((20 + Math.random() * 80) * 10) / 10;
    records.push({
      id: `COL-${String(i).padStart(4, "0")}`,
      receiptNumber: `REC-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}-${String(i).padStart(4, "0")}`,
      date: date.toISOString().split("T")[0],
      farmer: farmers[Math.floor(Math.random() * farmers.length)],
      farmerPhone: `07${Math.floor(10000000 + Math.random() * 90000000)}`,
      center: centers[Math.floor(Math.random() * centers.length)],
      weight,
      grade,
      pricePerKg: GRADE_PRICES[grade],
      amount: Math.round(weight * GRADE_PRICES[grade] * 100) / 100,
      collectedBy: collectors[Math.floor(Math.random() * collectors.length)],
      qualityNotes: ["Excellent leaf quality", "Good moisture content", "Standard grade", "Premium flush", "Well processed"][Math.floor(Math.random() * 5)],
    });
  }
  return records.sort((a, b) => new Date(b.date) - new Date(a.date));
}

const COLLECTIONS = generateCollections();

const statsConfig = [
  {
    label: "Today's Collection",
    value: "1,250 kg",
    icon: Weight,
    color: "bg-primary/10 text-primary",
    change: "+12% from yesterday",
    changeColor: "text-secondary",
  },
  {
    label: "This Week",
    value: "8,400 kg",
    icon: Calendar,
    color: "bg-secondary/10 text-secondary",
    change: "+8% from last week",
    changeColor: "text-secondary",
  },
  {
    label: "This Month",
    value: "32,000 kg",
    icon: TrendingUp,
    color: "bg-accent/10 text-accent",
    change: "+15% from last month",
    changeColor: "text-secondary",
  },
  {
    label: "Avg per Delivery",
    value: "45 kg",
    icon: Users,
    color: "bg-primary/10 text-primary",
    change: "Stable",
    changeColor: "text-text-secondary",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 20, stiffness: 200 } },
};

function CollectionPage() {
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [farmerFilter, setFarmerFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  const filteredCollections = useMemo(() => {
    return COLLECTIONS.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !c.receiptNumber.toLowerCase().includes(q) &&
          !c.farmer.toLowerCase().includes(q) &&
          !c.center.toLowerCase().includes(q) &&
          !c.id.toLowerCase().includes(q)
        ) return false;
      }
      if (gradeFilter && c.grade !== gradeFilter) return false;
      if (farmerFilter && c.farmer !== farmerFilter) return false;
      if (dateFrom && c.date < dateFrom) return false;
      if (dateTo && c.date > dateTo) return false;
      return true;
    });
  }, [search, gradeFilter, farmerFilter, dateFrom, dateTo]);

  const columns = [
    {
      header: "Receipt #",
      accessor: "receiptNumber",
      render: (row) => (
        <span className="font-mono text-sm font-medium text-primary">{row.receiptNumber}</span>
      ),
    },
    {
      header: "Date",
      accessor: "date",
      render: (row) => new Date(row.date).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" }),
    },
    { header: "Farmer", accessor: "farmer" },
    { header: "Collection Center", accessor: "center" },
    {
      header: "Weight (kg)",
      accessor: "weight",
      render: (row) => <span className="font-medium">{row.weight.toFixed(1)}</span>,
    },
    {
      header: "Grade",
      accessor: "grade",
      render: (row) => (
        <Badge variant={gradeBadgeVariant[row.grade]} dot>{row.grade}</Badge>
      ),
    },
    {
      header: "Amount",
      accessor: "amount",
      render: (row) => (
        <span className="font-semibold text-primary">KES {row.amount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
      ),
    },
    { header: "Collected By", accessor: "collectedBy" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen p-4 md:p-8 bg-bg"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Leaf size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tea Collection</h1>
            <p className="text-sm text-gray-500">Manage and track all tea collection records</p>
          </div>
        </div>
        <Link to="/collection/new">
          <Button icon={Plus} size="md">
            Record Collection
          </Button>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsConfig.map((stat, i) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card hover shadow="md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-xs mt-1 ${stat.changeColor}`}>{stat.change}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon size={22} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants} className="mb-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex-1 w-full sm:max-w-md">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search receipts, farmers, centers..."
            />
          </div>
          <Button
            variant={showFilters ? "primary" : "outline"}
            size="md"
            icon={Filter}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters {(gradeFilter || farmerFilter || dateFrom || dateTo) && (
              <span className="ml-1 w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center">
                {[gradeFilter, farmerFilter, dateFrom, dateTo].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>
      </motion.div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4"
        >
          <Card padding="md">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Grade</label>
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
                >
                  <option value="">All Grades</option>
                  {TEA_GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Farmer</label>
                <select
                  value={farmerFilter}
                  onChange={(e) => setFarmerFilter(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
                >
                  <option value="">All Farmers</option>
                  {[...new Set(COLLECTIONS.map((c) => c.farmer))].sort().map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setGradeFilter("");
                  setFarmerFilter("");
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <DataTable
          columns={columns}
          data={filteredCollections}
          searchable={false}
          pagination
          pageSize={10}
          actions={(row) => (
            <>
              <Link to={`/collection/${row.id}`}>
                <button className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer" title="View">
                  <Eye size={16} />
                </button>
              </Link>
              <Link to={`/collection/${row.id}/edit`}>
                <button className="p-2 rounded-lg text-gray-400 hover:text-secondary hover:bg-secondary/10 transition-colors cursor-pointer" title="Edit">
                  <Edit size={16} />
                </button>
              </Link>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteModal(row);
                }}
                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
          emptyState={
            <div className="py-16 text-center">
              <Leaf size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">No collections found</h3>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or record a new collection.</p>
            </div>
          }
        />
      </motion.div>

      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Collection Record"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => setDeleteModal(null)}>Delete</Button>
          </>
        }
      >
        {deleteModal && (
          <p className="text-sm text-gray-600">
            Are you sure you want to delete collection record <strong>{deleteModal.receiptNumber}</strong>?
            This action cannot be undone.
          </p>
        )}
      </Modal>
    </motion.div>
  );
}

export default CollectionPage;
