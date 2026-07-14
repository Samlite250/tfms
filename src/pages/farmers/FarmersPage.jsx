import { useState, useMemo } from "react";
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
  Filter,
  MoreVertical,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import SearchInput from "../../components/ui/SearchInput";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { useToast } from "../../components/ui/Toast";

const collectionCenterOptions = [
  { value: null, label: "All Centers" },
  { value: "Mushubi CC", label: "Mushubi CC" },
  { value: "Rulangala CC", label: "Rulangala CC" },
  { value: "Kyanja CC", label: "Kyanja CC" },
  { value: "Ntinda CC", label: "Ntinda CC" },
  { value: "Kisementi CC", label: "Kisementi CC" },
];

const statusFilterOptions = [
  { value: null, label: "All Statuses" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

const farmers = [
  { id: "FRM-001", name: "Mugisha Patrick", phone: "+256 772 123456", email: "mugisha.p@gmail.com", village: "Kyanja", district: "Kampala", province: "Central", country: "Uganda", farmSize: 2.5, teaVariety: "TRFK 306/1", collectionCenter: "Kyanja CC", totalDeliveries: 48, totalWeight: 1240, status: "Active", joinedDate: "2024-03-15", gender: "Male" },
  { id: "FRM-002", name: "Nambogo Sarah", phone: "+256 783 234567", email: "nambogo.s@yahoo.com", village: "Mushubi", district: "Wakiso", province: "Central", country: "Uganda", farmSize: 1.8, teaVariety: "TRFK 306/1", collectionCenter: "Mushubi CC", totalDeliveries: 36, totalWeight: 890, status: "Active", joinedDate: "2024-01-20", gender: "Female" },
  { id: "FRM-003", name: "Kizza Moses", phone: "+256 701 345678", email: "kizza.m@gmail.com", village: "Rulangala", district: "Wakiso", province: "Central", country: "Uganda", farmSize: 3.2, teaVariety: "RB 16/9", collectionCenter: "Rulangala CC", totalDeliveries: 62, totalWeight: 1780, status: "Active", joinedDate: "2023-11-08", gender: "Male" },
  { id: "FRM-004", name: "Namukasa Grace", phone: "+256 775 456789", email: "namukasa.g@outlook.com", village: "Ntinda", district: "Kampala", province: "Central", country: "Uganda", farmSize: 1.2, teaVariety: "TRFK 306/1", collectionCenter: "Ntinda CC", totalDeliveries: 22, totalWeight: 520, status: "Active", joinedDate: "2024-06-10", gender: "Female" },
  { id: "FRM-005", name: "Ssempala John", phone: "+256 786 567890", email: "ssempala.j@gmail.com", village: "Kisementi", district: "Kampala", province: "Central", country: "Uganda", farmSize: 4.0, teaVariety: "SFS 150/10", collectionCenter: "Kisementi CC", totalDeliveries: 71, totalWeight: 2100, status: "Active", joinedDate: "2023-08-22", gender: "Male" },
  { id: "FRM-006", name: "Auma Florence", phone: "+256 702 678901", email: "auma.f@gmail.com", village: "Kyanja", district: "Kampala", province: "Central", country: "Uganda", farmSize: 1.5, teaVariety: "TRFK 306/1", collectionCenter: "Kyanja CC", totalDeliveries: 18, totalWeight: 410, status: "Inactive", joinedDate: "2024-04-05", gender: "Female" },
  { id: "FRM-007", name: "Opio David", phone: "+256 773 789012", email: "opio.d@yahoo.com", village: "Mushubi", district: "Wakiso", province: "Central", country: "Uganda", farmSize: 2.8, teaVariety: "RB 16/9", collectionCenter: "Mushubi CC", totalDeliveries: 55, totalWeight: 1520, status: "Active", joinedDate: "2023-12-01", gender: "Male" },
  { id: "FRM-008", name: "Nansubuga Rose", phone: "+256 784 890123", email: "nansubuga.r@gmail.com", village: "Rulangala", district: "Wakiso", province: "Central", country: "Uganda", farmSize: 2.0, teaVariety: "TRFK 306/1", collectionCenter: "Rulangala CC", totalDeliveries: 40, totalWeight: 1050, status: "Active", joinedDate: "2024-02-14", gender: "Female" },
  { id: "FRM-009", name: "Tumwine Samuel", phone: "+256 705 901234", email: "tumwine.s@gmail.com", village: "Ntinda", district: "Kampala", province: "Central", country: "Uganda", farmSize: 3.5, teaVariety: "SFS 150/10", collectionCenter: "Ntinda CC", totalDeliveries: 58, totalWeight: 1680, status: "Active", joinedDate: "2023-10-18", gender: "Male" },
  { id: "FRM-010", name: "Atim Joyce", phone: "+256 776 012345", email: "atim.j@outlook.com", village: "Kisementi", district: "Kampala", province: "Central", country: "Uganda", farmSize: 1.0, teaVariety: "TRFK 306/1", collectionCenter: "Kisementi CC", totalDeliveries: 12, totalWeight: 280, status: "Inactive", joinedDate: "2024-07-25", gender: "Female" },
  { id: "FRM-011", name: "Wasswa Joseph", phone: "+256 781 123456", email: "wasswa.j@gmail.com", village: "Kyanja", district: "Kampala", province: "Central", country: "Uganda", farmSize: 2.2, teaVariety: "RB 16/9", collectionCenter: "Kyanja CC", totalDeliveries: 44, totalWeight: 1180, status: "Active", joinedDate: "2024-01-03", gender: "Male" },
  { id: "FRM-012", name: "Nalubwama Agnes", phone: "+256 703 234567", email: "nalubwama.a@yahoo.com", village: "Mushubi", district: "Wakiso", province: "Central", country: "Uganda", farmSize: 1.6, teaVariety: "TRFK 306/1", collectionCenter: "Mushubi CC", totalDeliveries: 30, totalWeight: 740, status: "Active", joinedDate: "2024-05-12", gender: "Female" },
  { id: "FRM-013", name: "Kiiza Robert", phone: "+256 777 345678", email: "kiiza.r@gmail.com", village: "Rulangala", district: "Wakiso", province: "Central", country: "Uganda", farmSize: 3.8, teaVariety: "SFS 150/10", collectionCenter: "Rulangala CC", totalDeliveries: 65, totalWeight: 1920, status: "Active", joinedDate: "2023-09-30", gender: "Male" },
  { id: "FRM-014", name: "Nakitto Betty", phone: "+256 782 456789", email: "nakitto.b@gmail.com", village: "Ntinda", district: "Kampala", province: "Central", country: "Uganda", farmSize: 0.8, teaVariety: "TRFK 306/1", collectionCenter: "Ntinda CC", totalDeliveries: 8, totalWeight: 180, status: "Inactive", joinedDate: "2024-08-19", gender: "Female" },
  { id: "FRM-015", name: "Byaruhanga Frank", phone: "+256 704 567890", email: "byaruhanga.f@outlook.com", village: "Kisementi", district: "Kampala", province: "Central", country: "Uganda", farmSize: 2.6, teaVariety: "RB 16/9", collectionCenter: "Kisementi CC", totalDeliveries: 50, totalWeight: 1380, status: "Active", joinedDate: "2023-12-15", gender: "Male" },
  { id: "FRM-016", name: "Namara Christine", phone: "+256 778 678901", email: "namara.c@gmail.com", village: "Kyanja", district: "Kampala", province: "Central", country: "Uganda", farmSize: 1.9, teaVariety: "TRFK 306/1", collectionCenter: "Kyanja CC", totalDeliveries: 38, totalWeight: 960, status: "Active", joinedDate: "2024-02-28", gender: "Female" },
  { id: "FRM-017", name: "Okello Peter", phone: "+256 785 789012", email: "okello.p@gmail.com", village: "Mushubi", district: "Wakiso", province: "Central", country: "Uganda", farmSize: 2.4, teaVariety: "SFS 150/10", collectionCenter: "Mushubi CC", totalDeliveries: 46, totalWeight: 1260, status: "Active", joinedDate: "2024-04-22", gender: "Male" },
  { id: "FRM-018", name: "Apio Hellen", phone: "+256 706 890123", email: "apio.h@yahoo.com", village: "Rulangala", district: "Wakiso", province: "Central", country: "Uganda", farmSize: 1.3, teaVariety: "TRFK 306/1", collectionCenter: "Rulangala CC", totalDeliveries: 25, totalWeight: 620, status: "Active", joinedDate: "2024-06-30", gender: "Female" },
];

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

function FarmersPage() {
  const navigate = useNavigate();
  const { success } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [centerFilter, setCenterFilter] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, farmer: null });

  const filteredFarmers = useMemo(() => {
    return farmers.filter((f) => {
      const matchesSearch =
        !search ||
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.id.toLowerCase().includes(search.toLowerCase()) ||
        f.phone.includes(search) ||
        f.village.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || f.status === statusFilter;
      const matchesCenter = !centerFilter || f.collectionCenter === centerFilter;
      return matchesSearch && matchesStatus && matchesCenter;
    });
  }, [search, statusFilter, centerFilter]);

  const stats = useMemo(() => {
    const total = farmers.length;
    const active = farmers.filter((f) => f.status === "Active").length;
    const inactive = total - active;
    const now = new Date();
    const newThisMonth = farmers.filter((f) => {
      const d = new Date(f.joinedDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return { total, active, inactive, newThisMonth };
  }, []);

  const statCards = [
    { label: "Total Farmers", value: stats.total, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Active", value: stats.active, icon: UserCheck, color: "text-success", bg: "bg-success/10" },
    { label: "Inactive", value: stats.inactive, icon: UserX, color: "text-danger", bg: "bg-danger/10" },
    { label: "New This Month", value: stats.newThisMonth, icon: UserPlus, color: "text-info", bg: "bg-info/10" },
  ];

  function handleDelete() {
    success(`Farmer ${deleteModal.farmer.name} has been removed.`);
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
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
            {row.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <p className="font-medium text-text-primary">{row.name}</p>
            <p className="text-xs text-text-secondary">{row.village}</p>
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
      render: (row) => <span className="font-semibold">{row.totalDeliveries}</span>,
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <Badge variant={row.status === "Active" ? "success" : "danger"} dot>
          {row.status}
        </Badge>
      ),
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
            <p className="text-sm text-text-secondary mt-1">Manage tea farmers and their collection details</p>
          </div>
          <Button icon={Plus} onClick={() => navigate("/farmers/new")}>
            Add Farmer
          </Button>
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat) => (
            <Card key={stat.label} padding="md" hover>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon size={22} className={stat.color} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                  <p className="text-sm text-text-secondary">{stat.label}</p>
                </div>
              </div>
            </Card>
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
