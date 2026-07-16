import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  Leaf,
  Calendar,
  Package,
  Weight,
  TrendingUp,
  Receipt,
  Building2,
  BadgeCheck,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import DataTable from "../../components/ui/DataTable";
import { useToast } from "../../components/ui/Toast";

const farmers = [
  { id: "FRM-001", name: "Mugisha Patrick", phone: "+256 772 123456", email: "mugisha.p@gmail.com", village: "Kyanja", district: "Kampala", province: "Central", country: "Uganda", farmSize: 2.5, coffeeVariety: "Red Bourbon", collectionCenter: "Kyanja CC", totalDeliveries: 48, totalWeight: 1240, status: "Active", joinedDate: "2024-03-15", gender: "Male", dateOfBirth: "1985-06-15" },
  { id: "FRM-002", name: "Nambogo Sarah", phone: "+256 783 234567", email: "nambogo.s@yahoo.com", village: "Mushubi", district: "Wakiso", province: "Central", country: "Uganda", farmSize: 1.8, coffeeVariety: "Red Bourbon", collectionCenter: "Mushubi CC", totalDeliveries: 36, totalWeight: 890, status: "Active", joinedDate: "2024-01-20", gender: "Female", dateOfBirth: "1990-03-22" },
  { id: "FRM-003", name: "Kizza Moses", phone: "+256 701 345678", email: "kizza.m@gmail.com", village: "Rulangala", district: "Wakiso", province: "Central", country: "Uganda", farmSize: 3.2, coffeeVariety: "Jackson", collectionCenter: "Rulangala CC", totalDeliveries: 62, totalWeight: 1780, status: "Active", joinedDate: "2023-11-08", gender: "Male", dateOfBirth: "1978-11-05" },
  { id: "FRM-004", name: "Namukasa Grace", phone: "+256 775 456789", email: "namukasa.g@outlook.com", village: "Ntinda", district: "Kampala", province: "Central", country: "Uganda", farmSize: 1.2, coffeeVariety: "Red Bourbon", collectionCenter: "Ntinda CC", totalDeliveries: 22, totalWeight: 520, status: "Active", joinedDate: "2024-06-10", gender: "Female", dateOfBirth: "1992-08-18" },
  { id: "FRM-005", name: "Ssempala John", phone: "+256 786 567890", email: "ssempala.j@gmail.com", village: "Kisementi", district: "Kampala", province: "Central", country: "Uganda", farmSize: 4.0, coffeeVariety: "BM 139", collectionCenter: "Kisementi CC", totalDeliveries: 71, totalWeight: 2100, status: "Active", joinedDate: "2023-08-22", gender: "Male", dateOfBirth: "1982-04-12" },
];

const deliveryHistory = [
  { id: "DLV-1048", date: "2025-07-10", weight: 28.5, grade: "OP1", receiptNo: "RCP-4048", amount: 85500 },
  { id: "DLV-1035", date: "2025-07-03", weight: 24.0, grade: "BOP1", receiptNo: "RCP-4035", amount: 76800 },
  { id: "DLV-1021", date: "2025-06-26", weight: 31.2, grade: "OP1", receiptNo: "RCP-4021", amount: 93600 },
  { id: "DLV-1008", date: "2025-06-19", weight: 22.8, grade: "PF1", receiptNo: "RCP-4008", amount: 63840 },
  { id: "DLV-0995", date: "2025-06-12", weight: 26.5, grade: "OP1", receiptNo: "RCP-3995", amount: 79500 },
  { id: "DLV-0982", date: "2025-06-05", weight: 20.0, grade: "BOP1", receiptNo: "RCP-3982", amount: 64000 },
  { id: "DLV-0969", date: "2025-05-29", weight: 29.8, grade: "OP1", receiptNo: "RCP-3969", amount: 89400 },
  { id: "DLV-0956", date: "2025-05-22", weight: 25.3, grade: "PF1", receiptNo: "RCP-3956", amount: 70840 },
  { id: "DLV-0943", date: "2025-05-15", weight: 27.6, grade: "OP1", receiptNo: "RCP-3943", amount: 82800 },
  { id: "DLV-0930", date: "2025-05-08", weight: 23.1, grade: "BOP1", receiptNo: "RCP-3930", amount: 73920 },
];

const gradeColorMap = {
  OP1: "success",
  BOP1: "info",
  PF1: "warning",
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

function FarmerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success } = useToast();
  const [deleteModal, setDeleteModal] = useState(false);

  const farmer = useMemo(() => {
    return farmers.find((f) => f.id === id) || farmers[0];
  }, [id]);

  const stats = useMemo(() => ({
    totalDeliveries: farmer.totalDeliveries,
    totalWeight: farmer.totalWeight,
    avgWeight: farmer.totalDeliveries > 0 ? (farmer.totalWeight / farmer.totalDeliveries).toFixed(1) : 0,
  }), [farmer]);

  const initials = farmer.name.split(" ").map((n) => n[0]).join("");

  function handleDelete() {
    success(`Farmer ${farmer.name} has been removed.`);
    setDeleteModal(false);
    navigate("/farmers");
  }

  const deliveryColumns = [
    { header: "Delivery ID", accessor: "id", render: (row) => <span className="font-mono text-xs text-text-secondary">{row.id}</span> },
    { header: "Date", accessor: "date", render: (row) => new Date(row.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) },
    { header: "Weight (kg)", accessor: "weight", render: (row) => <span className="font-semibold">{row.weight}</span> },
    { header: "Grade", accessor: "grade", render: (row) => <Badge variant={gradeColorMap[row.grade] || "default"}>{row.grade}</Badge> },
    { header: "Receipt #", accessor: "receiptNo", render: (row) => <span className="font-mono text-xs">{row.receiptNo}</span> },
    { header: "Amount (UGX)", accessor: "amount", render: (row) => <span className="font-semibold">{row.amount.toLocaleString()}</span> },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <motion.div variants={staggerItem} className="mb-6">
          <button
            onClick={() => navigate("/farmers")}
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors cursor-pointer mb-4"
          >
            <ArrowLeft size={16} />
            Back to Farmers
          </button>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card padding="lg" className="mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1">
                  <h1 className="text-2xl font-bold text-text-primary truncate">{farmer.name}</h1>
                  <Badge variant={farmer.status === "Active" ? "success" : "danger"} dot>
                    {farmer.status}
                  </Badge>
                </div>
                <p className="text-sm text-text-secondary font-mono">{farmer.id}</p>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-text-secondary">
                  <span className="inline-flex items-center gap-1.5">
                    <Phone size={14} />
                    {farmer.phone}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} />
                    {farmer.village}, {farmer.district}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 size={14} />
                    {farmer.collectionCenter}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" icon={Pencil} onClick={() => navigate(`/farmers/${farmer.id}/edit`)}>
                  Edit
                </Button>
                <Button variant="danger" size="sm" icon={Trash2} onClick={() => setDeleteModal(true)}>
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card padding="md" hover>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package size={22} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.totalDeliveries}</p>
                <p className="text-sm text-text-secondary">Total Deliveries</p>
              </div>
            </div>
          </Card>
          <Card padding="md" hover>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <Weight size={22} className="text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.totalWeight.toLocaleString()} kg</p>
                <p className="text-sm text-text-secondary">Total Weight</p>
              </div>
            </div>
          </Card>
          <Card padding="md" hover>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp size={22} className="text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.avgWeight} kg</p>
                <p className="text-sm text-text-secondary">Avg. per Delivery</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <motion.div variants={staggerItem}>
            <Card
              header={
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User size={16} className="text-primary" />
                  </div>
                  <h2 className="text-base font-semibold text-text-primary">Personal Info</h2>
                </div>
              }
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User size={16} className="text-text-secondary shrink-0" />
                  <div>
                    <p className="text-xs text-text-secondary">Full Name</p>
                    <p className="text-sm font-medium text-text-primary">{farmer.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BadgeCheck size={16} className="text-text-secondary shrink-0" />
                  <div>
                    <p className="text-xs text-text-secondary">Gender</p>
                    <p className="text-sm font-medium text-text-primary">{farmer.gender}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-text-secondary shrink-0" />
                  <div>
                    <p className="text-xs text-text-secondary">Date of Birth</p>
                    <p className="text-sm font-medium text-text-primary">
                      {new Date(farmer.dateOfBirth).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-text-secondary shrink-0" />
                  <div>
                    <p className="text-xs text-text-secondary">Joined</p>
                    <p className="text-sm font-medium text-text-primary">
                      {new Date(farmer.joinedDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card
              header={
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Leaf size={16} className="text-primary" />
                  </div>
                  <h2 className="text-base font-semibold text-text-primary">Farm Info</h2>
                </div>
              }
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Leaf size={16} className="text-text-secondary shrink-0" />
                  <div>
                    <p className="text-xs text-text-secondary">Farm Size</p>
                    <p className="text-sm font-medium text-text-primary">{farmer.farmSize} acres</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Leaf size={16} className="text-text-secondary shrink-0" />
                  <div>
                    <p className="text-xs text-text-secondary">Coffee Variety</p>
                    <p className="text-sm font-medium text-text-primary">{farmer.coffeeVariety}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 size={16} className="text-text-secondary shrink-0" />
                  <div>
                    <p className="text-xs text-text-secondary">Collection Center</p>
                    <p className="text-sm font-medium text-text-primary">{farmer.collectionCenter}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp size={16} className="text-text-secondary shrink-0" />
                  <div>
                    <p className="text-xs text-text-secondary">Total Weight Delivered</p>
                    <p className="text-sm font-medium text-text-primary">{farmer.totalWeight.toLocaleString()} kg</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card
              header={
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Phone size={16} className="text-primary" />
                  </div>
                  <h2 className="text-base font-semibold text-text-primary">Contact Info</h2>
                </div>
              }
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-text-secondary shrink-0" />
                  <div>
                    <p className="text-xs text-text-secondary">Phone</p>
                    <p className="text-sm font-medium text-text-primary">{farmer.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-text-secondary shrink-0" />
                  <div>
                    <p className="text-xs text-text-secondary">Email</p>
                    <p className="text-sm font-medium text-text-primary">{farmer.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-text-secondary shrink-0" />
                  <div>
                    <p className="text-xs text-text-secondary">Address</p>
                    <p className="text-sm font-medium text-text-primary">
                      {farmer.village}, {farmer.district}
                    </p>
                    <p className="text-xs text-text-secondary">{farmer.province}, {farmer.country}</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div variants={staggerItem}>
          <Card padding="none">
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Receipt size={16} className="text-primary" />
                </div>
                <h2 className="text-base font-semibold text-text-primary">Delivery History</h2>
              </div>
            </div>
            <DataTable
              columns={deliveryColumns}
              data={deliveryHistory}
              pagination
              pageSize={5}
            />
          </Card>
        </motion.div>
      </motion.div>

      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Farmer"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(false)}>
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
            {farmer.name} ({farmer.id}) will be permanently removed. This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default FarmerProfilePage;
