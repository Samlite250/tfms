import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Clock,
  Loader2,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import SearchInput from "../../components/ui/SearchInput";
import EmptyState from "../../components/ui/EmptyState";
import StatCard from "../../components/ui/StatCard";
import DataTable from "../../components/ui/DataTable";
import Select from "../../components/ui/Select";
import { useToast } from "../../components/ui/Toast";
import useRealtimeCollection from "../../hooks/useRealtimeCollection";
import { farmersSeed } from "../../firebase/seedData";

const collectionCenterOptions = [
  { value: null, label: "All Centers" },
  { value: "Mahembe CC", label: "Mahembe CC" },
  { value: "Muhanga CC", label: "Muhanga CC" },
  { value: "Ruyanza CC", label: "Ruyanza CC" },
  { value: "Kabuga CC", label: "Kabuga CC" },
  { value: "Nyamagana CC", label: "Nyamagana CC" },
];

const statusFilterOptions = [
  { value: null, label: "All Statuses" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Pending", label: "Pending" },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

function statusBadge(status) {
  switch (status) {
    case "Active": return <Badge variant="success" dot>{status}</Badge>;
    case "Inactive": return <Badge variant="danger" dot>{status}</Badge>;
    case "Pending": return <Badge variant="warning" dot>{status}</Badge>;
    default: return <Badge variant="default" dot>{status}</Badge>;
  }
}

function FarmersPage() {
  const navigate = useNavigate();
  const { success } = useToast();
  const { data: farmersList, loading, error, remove } = useRealtimeCollection("farmers", {
    orderByField: "joinedDate",
    orderDirection: "desc",
    seedData: farmersSeed,
  });
  const [pendingFarmersList, setPendingFarmersList] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [centerFilter, setCenterFilter] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, farmer: null });

  // Load pending (registered but not yet approved) farmers
  useEffect(() => {
    async function loadPendingFarmers() {
      try {
        const { collection: col, getDocs: gd } = await import("firebase/firestore");
        const { db } = await import("../../firebase/config");
        const snapshot = await gd(col(db, "pending_farmers"));
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data(), status: "Pending" }));
        setPendingFarmersList(list);
      } catch {
        // Offline fallback
        try {
          const stored = JSON.parse(localStorage.getItem("coms_pending_farmers") || "[]");
          setPendingFarmersList(stored.map((f) => ({ ...f, status: "Pending" })));
        } catch {
          setPendingFarmersList([]);
        }
      }
    }
    loadPendingFarmers();
  }, []);

  // Merge: pending farmers at top, deduplicated with active list
  const allFarmersList = useMemo(() => {
    const activeIds = new Set(farmersList.map((f) => f.id));
    const pendingOnly = pendingFarmersList.filter((f) => !activeIds.has(f.id));
    return [...pendingOnly, ...farmersList];
  }, [farmersList, pendingFarmersList]);

  const filteredFarmers = useMemo(() => {
    return allFarmersList.filter((f) => {
      const matchesSearch =
        !search ||
        (f.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (f.id || "").toLowerCase().includes(search.toLowerCase()) ||
        (f.phone || "").includes(search) ||
        (f.village || "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || f.status === statusFilter;
      const matchesCenter = !centerFilter || f.collectionCenter === centerFilter;
      return matchesSearch && matchesStatus && matchesCenter;
    });
  }, [allFarmersList, search, statusFilter, centerFilter]);

  const stats = useMemo(() => {
    const total = allFarmersList.length;
    const active = allFarmersList.filter((f) => f.status === "Active").length;
    const inactive = allFarmersList.filter((f) => f.status === "Inactive").length;
    const pending = pendingFarmersList.length;
    return { total, active, inactive, pending };
  }, [allFarmersList, pendingFarmersList]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-danger text-sm">Failed to load farmers: {error}</p>
      </div>
    );
  }

  const statCards = [
    { label: "Total Farmers", value: stats.total, icon: Users, color: "text-primary", bg: "bg-primary/10", borderColor: "#2E7D32" },
    { label: "Active", value: stats.active, icon: UserCheck, color: "text-success", bg: "bg-success/10", borderColor: "#43A047" },
    { label: "Inactive", value: stats.inactive, icon: UserX, color: "text-danger", bg: "bg-danger/10", borderColor: "#D32F2F" },
    { label: "Pending Approval", value: stats.pending, icon: Clock, color: "text-warning", bg: "bg-warning/10", borderColor: "#F59E0B" },
  ];

  async function handleDelete() {
    try {
      await remove(deleteModal.farmer.id);
      success(`Farmer ${deleteModal.farmer.name} has been removed.`);
    } catch (err) {
      console.error("Delete failed:", err);
    }
    setDeleteModal({ open: false, farmer: null });
  }

  const columns = [
    {
      header: "ID",
      accessor: "id",
      render: (row) => <span className="font-mono text-xs text-text-secondary">{row.id}</span>,
    },
    {
      header: "Name",
      accessor: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${row.status === "Pending" ? "bg-warning/15 text-warning" : "bg-primary/10 text-primary"}`}>
            {(row.name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="font-medium text-text-primary">{row.name}</p>
            <p className="text-xs text-text-secondary">{row.village || row.district || "—"}</p>
          </div>
        </div>
      ),
    },
    { header: "Phone", accessor: "phone" },
    { header: "Location", accessor: "district" },
    { header: "Center", accessor: "collectionCenter" },
    {
      header: "Deliveries",
      accessor: "totalDeliveries",
      render: (row) => <span className="font-semibold">{row.totalDeliveries ?? "—"}</span>,
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => statusBadge(row.status),
    },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Farmer Management</h1>
            <p className="text-sm text-text-secondary mt-1">Manage coffee farmers and their collection details</p>
          </div>
          <Button icon={Plus} onClick={() => navigate("/farmers/new")}>
            Add Farmer
          </Button>
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, idx) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              color={stat.color}
              bg={stat.bg}
              borderColor={stat.borderColor}
              delay={idx * 0.06}
            />
          ))}
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card padding="none">
            <div className="p-4 border-b border-border">
              <div className="flex flex-col sm:flex-row gap-3">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search farmers by name, ID, phone..."
                  className="flex-1"
                />
                <div className="flex gap-3">
                  <Select
                    options={statusFilterOptions}
                    value={statusFilter}
                    onChange={setStatusFilter}
                    placeholder="Status"
                    className="w-40"
                  />
                  <Select
                    options={collectionCenterOptions}
                    value={centerFilter}
                    onChange={setCenterFilter}
                    placeholder="Collection Center"
                    className="w-44"
                  />
                </div>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={filteredFarmers}
              searchable={false}
              pagination
              pageSize={10}
              actions={(row) => (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/farmers/${row.id}`); }}
                    className="p-2 rounded-lg text-text-secondary hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                    title="View"
                  >
                    <Eye size={16} />
                  </button>
                  {row.status !== "Pending" && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/farmers/${row.id}/edit`); }}
                        className="p-2 rounded-lg text-text-secondary hover:bg-info/10 hover:text-info transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, farmer: row }); }}
                        className="p-2 rounded-lg text-text-secondary hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </>
              )}
              emptyState={
                <EmptyState
                  icon={Users}
                  title="No farmers found"
                  description="Try adjusting your search or filter criteria."
                />
              }
            />
          </Card>
        </motion.div>
      </motion.div>

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, farmer: null })}
        title="Delete Farmer"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal({ open: false, farmer: null })}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center py-2">
          <div className="w-14 h-14 rounded-full bg-danger/10 flex items-center justify-center mb-4">
            <Trash2 size={24} className="text-danger" />
          </div>
          <p className="text-text-primary font-medium mb-1">
            Are you sure you want to delete this farmer?
          </p>
          <p className="text-sm text-text-secondary">
            {deleteModal.farmer?.name} ({deleteModal.farmer?.id}) will be permanently removed. This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default FarmersPage;
