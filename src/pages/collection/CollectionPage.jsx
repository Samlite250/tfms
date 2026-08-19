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
import { useToast } from "../../components/ui/Toast";
import StatCard from "../../components/ui/StatCard";
import { useRealtimeCollection } from "../../hooks/useRealtimeCollection";
import { collectionsSeed } from "../../firebase/seedData";

const COFFEE_GRADES = ["AA", "AB", "PB", "C", "TT"];

const gradeBadgeVariant = {
  AA: "success",
  AB: "info",
  PB: "warning",
  C: "default",
  TT: "danger",
};

const GRADE_PRICES = { AA: 1200, AB: 1000, PB: 1100, C: 800, TT: 700 };

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
  const { success } = useToast();
  const { data: collectionsList, deleteItem } = useRealtimeCollection("coffeeCollections", collectionsSeed);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [farmerFilter, setFarmerFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  const filteredCollections = useMemo(() => {
    return collectionsList.filter((c) => {
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
  }, [collectionsList, search, gradeFilter, farmerFilter, dateFrom, dateTo]);

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
            <h1 className="text-2xl font-bold text-gray-900">Coffee Collection</h1>
            <p className="text-sm text-gray-500">Manage and track all coffee collection records</p>
          </div>
        </div>
        <Link to="/collections/new">
          <Button icon={Plus} size="md">
            Record Collection
          </Button>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsConfig.map((stat, i) => (
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
            delay={i * 0.06}
          />
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
              <Link to={`/collections/${row.id}`}>
                <button className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer" title="View">
                  <Eye size={16} />
                </button>
              </Link>
              <Link to={`/collections/${row.id}/edit`}>
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
            <Button variant="danger" onClick={async () => {
              if (deleteModal) {
                await deleteItem(deleteModal.id);
                success(`Collection record ${deleteModal.receiptNumber} has been deleted.`);
                setDeleteModal(null);
              }
            }}>Delete</Button>
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
