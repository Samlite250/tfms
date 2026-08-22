import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Factory,
  TrendingUp,
  Package,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Filter,
  CheckCircle2,
  BellRing,
  Coffee,
  User,
  ArrowRight,
  Send,
  Layers,
  SlidersHorizontal
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import DataTable from "../../components/ui/DataTable";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import StatCard from "../../components/ui/StatCard";
import { useRealtimeCollection } from "../../hooks/useRealtimeCollection";
import { productionSeed, collectionsSeed } from "../../firebase/seedData";
import { sendCoffeeReceivedSMS } from "../../services/smsService";
import { formatCurrency } from "../../utils/helpers";

const coffeeGrades = [
  { value: "all", label: "All Grades" },
  { value: "AA", label: "AA" },
  { value: "AB", label: "AB" },
  { value: "PB", label: "PB" },
  { value: "C", label: "C" },
  { value: "TT", label: "TT" },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
  { value: "Quality Check", label: "Quality Check" },
];

const STAGES = ["Received", "Washing", "Sorting", "Drying", "Milling", "Completed"];

const stageBadgeVariant = {
  Received: "default",
  Washing: "info",
  Sorting: "warning",
  Drying: "warning",
  Milling: "info",
  Packaging: "primary",
  Completed: "success",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 20, stiffness: 200 },
  },
};

function ProductionPage() {
  const navigate = useNavigate();
  const { success, info } = useToast();

  const { data: dataList, deleteItem } = useRealtimeCollection("production", productionSeed);
  const { data: farmerDeliveries, updateItem: updateCollection } = useRealtimeCollection("coffeeCollections", collectionsSeed);

  const [activeTab, setActiveTab] = useState("farmer-deliveries"); // 'farmer-deliveries' | 'factory-batches'
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [deleteModal, setDeleteModal] = useState(null);

  // Control Modal for updating a farmer submission stage
  const [controlModalItem, setControlModalItem] = useState(null);
  const [selectedStage, setSelectedStage] = useState("Received");
  const [updatingStage, setUpdatingStage] = useState(false);

  const allDeliveries = farmerDeliveries || [];

  // Filtered Farmer Deliveries
  const filteredFarmerDeliveries = useMemo(() => {
    return allDeliveries.filter((c) => {
      const name = c.farmer || c.farmerName || "";
      const receipt = c.receiptNumber || c.id || "";
      const matchesSearch = !searchTerm || name.toLowerCase().includes(searchTerm.toLowerCase()) || receipt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGrade = gradeFilter === "all" || c.grade === gradeFilter;
      const matchesStage = stageFilter === "all" || (c.processingStage || c.status || "Received") === stageFilter;
      return matchesSearch && matchesGrade && matchesStage;
    });
  }, [allDeliveries, searchTerm, gradeFilter, stageFilter]);

  const stats = useMemo(() => {
    const totalBatches = dataList.length;
    const completedBatches = dataList.filter((b) => b.status === "Completed").length;
    const totalRaw = dataList.reduce((sum, b) => sum + (Number(b.cherryInput || b.rawMaterial) || 0), 0);
    const totalFinished = dataList.reduce((sum, b) => sum + (Number(b.parchmentWeight || b.finishedProduct) || 0), 0);
    const avgYield = totalRaw > 0 ? ((totalFinished / totalRaw) * 100).toFixed(1) : 0;

    return [
      {
        label: "Farmer Deliveries",
        value: allDeliveries.length.toString(),
        change: "Active Submissions",
        up: true,
        icon: Coffee,
        color: "primary",
        bg: "bg-primary/10",
        borderColor: "border-primary/20",
      },
      {
        label: "Completed Processing",
        value: completedBatches.toString(),
        change: "+8%",
        up: true,
        icon: Package,
        color: "success",
        bg: "bg-success/10",
        borderColor: "border-success/20",
      },
      {
        label: "Total Cherry Input",
        value: `${totalRaw.toLocaleString()} kg`,
        change: "+15%",
        up: true,
        icon: TrendingUp,
        color: "info",
        bg: "bg-info/10",
        borderColor: "border-info/20",
      },
      {
        label: "Average Factory Yield",
        value: `${avgYield}%`,
        change: "+2.4%",
        up: true,
        icon: BarChart3,
        color: "accent",
        bg: "bg-accent/10",
        borderColor: "border-accent/20",
      },
    ];
  }, [dataList, allDeliveries]);

  const filteredData = useMemo(() => {
    return (dataList || []).filter((row) => {
      const batchMatch = (row.batchNumber || "").toLowerCase().includes(searchTerm.toLowerCase());
      const supervisorMatch = (row.operator || row.supervisor || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = !searchTerm || batchMatch || supervisorMatch;
      const matchesDate = !dateFilter || row.date === dateFilter;
      const rowGrade = row.grade || row.teaGrade || "";
      const matchesGrade = gradeFilter === "all" || rowGrade === gradeFilter;
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      const rowStage = row.processingStage || row.status || "";
      const matchesStage = stageFilter === "all" || rowStage === stageFilter;
      return matchesSearch && matchesDate && matchesGrade && matchesStatus && matchesStage;
    });
  }, [dataList, searchTerm, dateFilter, gradeFilter, statusFilter, stageFilter]);

  async function handleUpdateStage() {
    if (!controlModalItem) return;
    setUpdatingStage(true);

    const updatedStage = selectedStage;
    const isCompleted = updatedStage === "Completed";

    await updateCollection(controlModalItem.id, {
      processingStage: updatedStage,
      status: updatedStage,
      paid: isCompleted ? true : controlModalItem.paid,
      lastUpdated: new Date().toISOString(),
    });

    // Send instant SMS alert to farmer's phone
    const farmerPhone = controlModalItem.farmerPhone || "+250 788 123 456";
    const receipt = controlModalItem.receiptNumber || controlModalItem.id;
    const weight = controlModalItem.weight || controlModalItem.quantity || 0;
    const grade = controlModalItem.grade || "AA";
    const farmerName = controlModalItem.farmer || controlModalItem.farmerName || "Farmer";

    try {
      if (farmerPhone) {
        const smsMessage = `Mahembe Factory Notice: Coffee delivery ${receipt} (${weight}kg, Grade ${grade}) advanced to stage: ${updatedStage.toUpperCase()}. Thank you!`;
        await sendCoffeeReceivedSMS(farmerPhone, {
          farmerName,
          receiptNumber: receipt,
          weight,
          grade,
          totalPrice: controlModalItem.totalAmount || controlModalItem.amount || 0,
        });
      }
    } catch (e) {
      console.warn("SMS dispatch error:", e);
    }

    success(`Stage updated to "${updatedStage}" for ${receipt}. SMS alert sent to ${farmerName}.`);
    setUpdatingStage(false);
    setControlModalItem(null);
  }

  const columns = [
    {
      header: "Batch #",
      accessor: "batchNumber",
      render: (row) => <span className="font-semibold text-primary">{row.batchNumber}</span>,
    },
    {
      header: "Date",
      accessor: "date",
      render: (row) => row.date || "—",
    },
    {
      header: "Coffee Grade",
      accessor: "grade",
      render: (row) => {
        const grade = row.grade || row.teaGrade || "—";
        return <Badge variant="info">{grade}</Badge>;
      },
    },
    {
      header: "Raw Input (kg)",
      accessor: "cherryInput",
      render: (row) => <span className="font-medium">{row.cherryInput ?? row.rawMaterial ?? "—"}</span>,
    },
    {
      header: "Parchment (kg)",
      accessor: "parchmentWeight",
      render: (row) => <span className="font-medium">{row.parchmentWeight ?? row.finishedProduct ?? "—"}</span>,
    },
    {
      header: "Yield %",
      accessor: "yieldPercent",
      render: (row) => {
        const yp = row.yieldPercent ?? 0;
        return (
          <span
            className={
              yp >= 25
                ? "text-success font-semibold"
                : yp >= 20
                  ? "text-warning font-semibold"
                  : "text-danger font-semibold"
            }
          >
            {yp}%
          </span>
        );
      },
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <Badge variant={row.status === "Completed" ? "success" : "warning"} dot>{row.status}</Badge>,
    },
    {
      header: "Stage",
      accessor: "processingStage",
      render: (row) => {
        const stage = row.processingStage || row.status || "—";
        return <Badge variant={stageBadgeVariant[stage] || "default"} dot>{stage}</Badge>;
      },
    },
    {
      header: "Operator",
      accessor: "operator",
      render: (row) => row.operator || row.supervisor || "—",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Factory className="text-primary h-7 w-7" /> Production Management
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Control farmer deliveries, update processing stages, and manage factory batches.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate("/production/new")}
          >
            New Production Batch
          </Button>
        </div>
      </motion.div>

      {/* Top Stat Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
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
      </motion.div>

      {/* Single Clean View: Farmer Deliveries Control Panel */}
      <motion.div variants={itemVariants}>
        <Card padding="none">
          <div className="p-4 border-b border-border bg-gray-50/50">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex-1 w-full">
                <Input
                  placeholder="Search by farmer name, phone, or receipt #..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={Filter}
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Select
                  options={coffeeGrades}
                  value={gradeFilter}
                  onChange={setGradeFilter}
                  placeholder="Grade"
                  className="w-full md:w-36"
                />
                <Select
                  options={[
                    { value: "all", label: "All Stages" },
                    { value: "Received", label: "Received" },
                    { value: "Washing", label: "Washing" },
                    { value: "Sorting", label: "Sorting" },
                    { value: "Drying", label: "Drying" },
                    { value: "Milling", label: "Milling" },
                    { value: "Completed", label: "Completed" },
                  ]}
                  value={stageFilter}
                  onChange={setStageFilter}
                  placeholder="Stage"
                  className="w-full md:w-40"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50 text-text-secondary text-xs uppercase font-semibold">
                  <th className="px-4 py-3">Receipt #</th>
                  <th className="px-4 py-3">Farmer Submitter</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Weight (kg)</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Processing Stage</th>
                  <th className="px-4 py-3 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredFarmerDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-text-secondary">
                      No farmer deliveries found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredFarmerDeliveries.map((c) => {
                    const currentStage = c.processingStage || c.status || "Received";
                    const weightVal = parseFloat(c.weight || c.quantity) || 0;
                    const priceVal = parseFloat(c.pricePerKg || c.price) || 1200;
                    const totalVal = parseFloat(c.amount || c.totalAmount || c.total || (weightVal * priceVal));
                    return (
                      <tr key={c.id} className="hover:bg-primary/5 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-primary">
                          {c.receiptNumber || c.id}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-text-primary">{c.farmer || c.farmerName || "Farmer"}</div>
                          <div className="text-xs text-text-secondary">{c.farmerPhone || c.farmerEmail || "Registered"}</div>
                        </td>
                        <td className="px-4 py-3 text-text-secondary text-xs">{c.date}</td>
                        <td className="px-4 py-3 font-semibold text-text-primary">{weightVal} kg</td>
                        <td className="px-4 py-3">
                          <Badge variant="primary">{c.grade || "AA"}</Badge>
                        </td>
                        <td className="px-4 py-3 font-semibold text-primary">{formatCurrency(totalVal)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={stageBadgeVariant[currentStage] || "default"} dot>
                            {currentStage}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={SlidersHorizontal}
                            onClick={() => {
                              setControlModalItem(c);
                              setSelectedStage(currentStage);
                            }}
                          >
                            Control Stage
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Admin Stage Control Modal */}
      <Modal
        isOpen={!!controlModalItem}
        onClose={() => setControlModalItem(null)}
        title="Admin Production Control — Update Processing Stage"
        size="md"
        footer={
          <div className="flex gap-3 w-full justify-end">
            <Button variant="ghost" onClick={() => setControlModalItem(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={Send}
              loading={updatingStage}
              onClick={handleUpdateStage}
            >
              Update & Alert Farmer (SMS)
            </Button>
          </div>
        }
      >
        {controlModalItem && (
          <div className="space-y-4">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Receipt Number:</span>
                <span className="font-mono font-bold text-primary">{controlModalItem.receiptNumber || controlModalItem.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Farmer Submitter:</span>
                <span className="font-semibold text-gray-900">{controlModalItem.farmer || controlModalItem.farmerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Weight & Grade:</span>
                <span className="font-semibold text-gray-900">{controlModalItem.weight} kg — Grade {controlModalItem.grade || "AA"}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Select New Processing Stage
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STAGES.map((stg) => (
                  <button
                    key={stg}
                    type="button"
                    onClick={() => setSelectedStage(stg)}
                    className={`p-3 rounded-xl border text-left text-sm font-medium transition-all cursor-pointer ${selectedStage === stg
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                      : "border-border bg-card text-text-primary hover:border-primary/50"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{stg}</span>
                      {selectedStage === stg && <CheckCircle2 size={16} className="text-primary" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-info/10 border border-info/20 p-3 text-xs text-info flex items-center gap-2">
              <BellRing size={16} className="shrink-0" />
              <span>
                Advancing the processing stage will instantly send an SMS notification alert to <strong>{controlModalItem.farmerPhone || "the farmer"}</strong>.
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Batch Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Production Batch"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={async () => {
              if (deleteModal) {
                await deleteItem(deleteModal.id);
                success(`Batch ${deleteModal.batchNumber} has been deleted.`);
                setDeleteModal(null);
              }
            }}>Delete</Button>
          </>
        }
      >
        {deleteModal && (
          <p className="text-text-secondary">
            Are you sure you want to delete batch <strong className="text-text-primary">{deleteModal.batchNumber}</strong>?
            This action cannot be undone.
          </p>
        )}
      </Modal>
    </motion.div>
  );
}

export default ProductionPage;

