import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  Plus,
  AlertTriangle,
  DollarSign,
  Layers,
  Pencil,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import DataTable from "../../components/ui/DataTable";
import SearchInput from "../../components/ui/SearchInput";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import StatCard from "../../components/ui/StatCard";

import { useRealtimeCollection } from "../../hooks/useRealtimeCollection";
import { inventorySeed } from "../../firebase/seedData";

const CATEGORIES = ["All", "Coffee Stock", "Raw Materials", "Packaging", "Chemicals", "Fuel"];

const UNITS = { kg: "kg", liters: "L", pieces: "pcs", bags: "bags", boxes: "boxes" };

function getStatus(item) {
  if (item.quantity <= 0) return "Out of Stock";
  if (item.quantity <= item.minStock) return "Low Stock";
  return "In Stock";
}

function getStatusVariant(status) {
  if (status === "Out of Stock") return "danger";
  if (status === "Low Stock") return "warning";
  return "success";
}

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const staggerContainer = { visible: { transition: { staggerChildren: 0.05 } } };

function InventoryPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [itemsList, setItemsList] = useState(MOCK_ITEMS);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  const filteredItems = useMemo(() => {
    let items = itemsList;
    if (activeCategory !== "All") {
      items = items.filter((i) => i.category === activeCategory);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.supplier.toLowerCase().includes(q)
      );
    }
    return items;
  }, [itemsList, search, activeCategory]);

  const stats = useMemo(() => {
    const total = itemsList.length;
    const lowStock = itemsList.filter((i) => i.quantity <= i.minStock && i.quantity > 0).length;
    const totalValue = itemsList.reduce((sum, i) => sum + i.quantity * i.costPerUnit, 0);
    const cats = new Set(itemsList.map((i) => i.category)).size;
    return { total, lowStock, totalValue, cats };
  }, [itemsList]);

  function handleDelete(item) {
    setDeleteModal({ open: true, item });
  }

  function confirmDelete() {
    setItemsList((prev) => prev.filter((i) => i.id !== deleteModal.item.id));
    toast.success(`"${deleteModal.item.name}" has been deleted.`);
    setDeleteModal({ open: false, item: null });
  }

  const columns = [
    {
      header: "Item Name",
      accessor: "name",
      render: (row) => (
        <div>
          <p className="font-medium text-text-primary">{row.name}</p>
          <p className="text-xs text-text-secondary mt-0.5 truncate max-w-[200px]">{row.description}</p>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: "category",
      render: (row) => <Badge variant="info">{row.category}</Badge>,
    },
    {
      header: "Quantity",
      accessor: "quantity",
      render: (row) => (
        <span className={`font-medium ${row.quantity <= row.minStock ? (row.quantity <= row.minStock * 0.5 ? "text-danger" : "text-warning") : "text-success"}`}>
          {row.quantity.toLocaleString()} {UNITS[row.unit]}
        </span>
      ),
    },
    {
      header: "Min Stock",
      accessor: "minStock",
      render: (row) => <span className="text-text-secondary">{row.minStock.toLocaleString()} {UNITS[row.unit]}</span>,
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => {
        const status = getStatus(row);
        return <Badge variant={getStatusVariant(status)} dot>{status}</Badge>;
      },
    },
    {
      header: "Value",
      accessor: "value",
      render: (row) => (
        <span className="font-medium text-text-primary">
          ${(row.quantity * row.costPerUnit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "Last Updated",
      accessor: "lastUpdated",
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
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Inventory Management</h1>
            <p className="text-text-secondary mt-1">Track and manage all factory inventory items</p>
          </div>
          <Button icon={Plus} onClick={() => navigate("/inventory/new")}>
            Add Item
          </Button>
        </motion.div>

        <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Items", value: stats.total, icon: Package, color: "text-primary", bg: "bg-primary/10", borderColor: "#2E7D32", change: "+12%", up: true },
            { label: "Low Stock Alerts", value: stats.lowStock, icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", borderColor: "#F57C00", change: "+3%", up: false },
            { label: "Total Value", value: `RWF ${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: DollarSign, color: "text-success", bg: "bg-success/10", borderColor: "#43A047", change: "+8%", up: true },
            { label: "Categories", value: stats.cats, icon: Layers, color: "text-info", bg: "bg-info/10", borderColor: "#0288D1", change: "0%", up: true },
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
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card padding="none" shadow="md">
            <div className="px-6 py-4 border-b border-border">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search items, suppliers..."
                  className="flex-1 md:max-w-sm"
                />
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <Filter size={16} className="text-text-secondary shrink-0" />
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${activeCategory === cat
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={filteredItems}
              searchable={false}
              pageSize={10}
              actions={(row) => (
                <>
                  <button
                    onClick={() => navigate(`/inventory/${row.id}/edit`)}
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
        onClose={() => setDeleteModal({ open: false, item: null })}
        title="Delete Item"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal({ open: false, item: null })}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-text-secondary">
          Are you sure you want to delete <strong className="text-text-primary">{deleteModal.item?.name}</strong>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

export default InventoryPage;
