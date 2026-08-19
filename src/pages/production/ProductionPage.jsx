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
import { productionSeed } from "../../firebase/seedData";

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

const processingStages = [
  { value: "all", label: "All Stages" },
  { value: "Received", label: "Received" },
  { value: "Washing", label: "Washing" },
  { value: "Sorting", label: "Sorting" },
  { value: "Drying", label: "Drying" },
  { value: "Milling", label: "Milling" },
  { value: "Packaging", label: "Packaging" },
  { value: "Completed", label: "Completed" },
];

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

const stageBadgeVariant = {
  Received: "default",
  Washing: "info",
  Sorting: "warning",
  Drying: "warning",
  Milling: "info",
  Packaging: "primary",
  Completed: "success",
};

function ProductionPage() {
  const navigate = useNavigate();
  const { success } = useToast();
  const { data: dataList, deleteItem } = useRealtimeCollection("production", productionSeed);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [deleteModal, setDeleteModal] = useState(null);

  const stats = useMemo(() => {
    const totalBatches = dataList.length;
    const completedBatches = dataList.filter((b) => b.status === "Completed").length;
    const totalRaw = dataList.reduce((sum, b) => sum + (Number(b.cherryInput || b.rawMaterial) || 0), 0);
    const totalFinished = dataList.reduce((sum, b) => sum + (Number(b.parchmentWeight || b.finishedProduct) || 0), 0);
    const avgYield = totalRaw > 0 ? ((totalFinished / totalRaw) * 100).toFixed(1) : 0;

    return [
      {
        label: "Total Batches",
        value: totalBatches.toString(),
        change: "+12%",
        up: true,
        icon: Factory,
        color: "primary",
        bg: "bg-primary/10",
        borderColor: "border-primary/20",
      },
      {
        label: "Completed Batches",
        value: completedBatches.toString(),
        change: "+8%",
        up: true,
        icon: Package,
        color: "success",
        bg: "bg-success/10",
        borderColor: "border-success/20",
      },
      {
        label: "Total Raw Input",
        value: `${totalRaw.toLocaleString()} kg`,
        change: "+15%",
        up: true,
        icon: TrendingUp,
        color: "info",
        bg: "bg-info/10",
        borderColor: "border-info/20",
      },
      {
        label: "Average Yield",
        value: `${avgYield}%`,
        change: "+2.4%",
        up: true,
        icon: BarChart3,
        color: "accent",
        bg: "bg-accent/10",
        borderColor: "border-accent/20",
      },
    ];
  }, [dataList]);

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

  const statusBadge = (status) => {
    const map = {
      Completed: "success",
      "In Progress": "warning",
      "Quality Check": "info",
    };
    return <Badge variant={map[status]} dot>{status}</Badge>;
  };

  const columns = [
    {
      header: "Batch #",
      accessor: "batchNumber",
      render: (row) => (
        <span className="font-semibold text-primary">{row.batchNumber}</span>
      ),
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
      render: (row) => statusBadge(row.status),
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
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Production Management</h1>
          <p className="text-sm text-text-secondary mt-1">
            Track and manage coffee production batches
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => navigate("/production/new")}
        >
          New Production
        </Button>
      </motion.div>

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

      <motion.div variants={itemVariants}>
        <Card padding="none">
          <div className="p-4 border-b border-border">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search batches or supervisors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={Filter}
                />
              </div>
              <div className="w-full md:w-44">
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  icon={Calendar}
                />
              </div>
              <div className="w-full md:w-40">
                <Select
                  options={coffeeGrades}
                  value={gradeFilter}
                  onChange={setGradeFilter}
                  placeholder="Coffee Grade"
                />
              </div>
              <div className="w-full md:w-40">
                <Select
                  options={statusOptions}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  placeholder="Status"
                />
              </div>
              <div className="w-full md:w-40">
                <Select
                  options={processingStages}
                  value={stageFilter}
                  onChange={setStageFilter}
                  placeholder="Processing Stage"
                />
              </div>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredData}
            searchable={false}
            pagination
            pageSize={10}
            onRowClick={(row) => navigate(`/production/${row.id}`)}
            actions={(row) => (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/production/${row.id}`);
                  }}
                  className="p-1.5 rounded-lg text-text-secondary hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                  title="View"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/production/${row.id}/edit`);
                  }}
                  className="p-1.5 rounded-lg text-text-secondary hover:bg-info/10 hover:text-info transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteModal(row);
                  }}
                  className="p-1.5 rounded-lg text-text-secondary hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          />
        </Card>
      </motion.div>

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
