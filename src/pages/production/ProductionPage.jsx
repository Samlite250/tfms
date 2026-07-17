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

const coffeeGrades = [
  { value: "all", label: "All Grades" },
  { value: "AA", label: "AA" },
  { value: "AB", label: "AB" },
  { value: "PB", label: "PB" },
  { value: "C", label: "C" },
  { value: "TT", label: "TT" },
  { value: "T", label: "T" },
  { value: "E", label: "E" },
  { value: "MH", label: "MH" },
  { value: "SM", label: "SM" },
  { value: "P", label: "P" },
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

const supervisors = [
  "R. Perera",
  "K. Fernando",
  "M. de Silva",
  "A. Bandara",
  "S. Jayawardena",
  "N. Wijesinghe",
  "D. Rajapaksa",
  "T. Gunasekara",
];

const coffeeGradesList = ["AA", "AB", "PB", "C", "TT", "T", "E", "MH", "SM", "P"];

const stageBadgeVariant = {
  Received: "default",
  Washing: "info",
  Sorting: "warning",
  Drying: "accent",
  Milling: "primary",
  Packaging: "secondary",
  Completed: "success",
};

function generateMockData() {
  const records = [];
  const stages = ["Received", "Washing", "Sorting", "Drying", "Milling", "Packaging", "Completed"];
  for (let i = 1; i <= 24; i++) {
    const rawMaterial = Math.floor(Math.random() * 200) + 200;
    const yieldPct = 70 + Math.random() * 20;
    const finishedProduct = Math.round(rawMaterial * yieldPct) / 100;
    const statuses = ["Completed", "In Progress", "Quality Check"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
    const month = String(Math.floor(Math.random() * 2) + 6).padStart(2, "0");
    const processingStage = status === "Completed" ? "Completed" : stages[Math.floor(Math.random() * stages.length)];

    records.push({
      id: i,
      batchNumber: `BATCH-2026-${String(i).padStart(3, "0")}`,
      date: `2026-${month}-${day}`,
      teaGrade: coffeeGradesList[Math.floor(Math.random() * coffeeGradesList.length)],
      rawMaterial,
      finishedProduct: Math.round(finishedProduct * 10) / 10,
      yieldPercent: Math.round(yieldPct * 10) / 10,
      status,
      processingStage,
      supervisor: supervisors[Math.floor(Math.random() * supervisors.length)],
    });
  }
  return records;
}

const mockData = generateMockData();

const stats = [
  {
    label: "Today's Production",
    value: "320 kg",
    icon: Factory,
    color: "text-primary",
    bg: "bg-primary/10",
    change: "+12%",
    up: true,
    borderColor: "#2E7D32",
  },
  {
    label: "This Month",
    value: "12,500 kg",
    icon: TrendingUp,
    color: "text-secondary",
    bg: "bg-secondary/10",
    change: "+8%",
    up: true,
    borderColor: "#1B5E20",
  },
  {
    label: "Batches This Month",
    value: "48",
    icon: Package,
    color: "text-accent",
    bg: "bg-accent/10",
    change: "+5",
    up: true,
    borderColor: "#F9A825",
  },
  {
    label: "Average Batch Size",
    value: "260 kg",
    icon: BarChart3,
    color: "text-info",
    bg: "bg-info/10",
    change: "+3%",
    up: true,
    borderColor: "#0288D1",
  },
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

function ProductionPage() {
  const navigate = useNavigate();
  const { success } = useToast();
  const [dataList, setDataList] = useState(mockData);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [deleteModal, setDeleteModal] = useState(null);

  const filteredData = useMemo(() => {
    return dataList.filter((row) => {
      const matchesSearch =
        !searchTerm ||
        row.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.supervisor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = !dateFilter || row.date === dateFilter;
      const matchesGrade = gradeFilter === "all" || row.teaGrade === gradeFilter;
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      const matchesStage = stageFilter === "all" || row.processingStage === stageFilter;
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
    },
    {
      header: "Coffee Grade",
      accessor: "teaGrade",
      render: (row) => (
        <Badge variant="info">{row.teaGrade}</Badge>
      ),
    },
    {
      header: "Raw Material (kg)",
      accessor: "rawMaterial",
      render: (row) => <span className="font-medium">{row.rawMaterial}</span>,
    },
    {
      header: "Finished (kg)",
      accessor: "finishedProduct",
      render: (row) => <span className="font-medium">{row.finishedProduct}</span>,
    },
    {
      header: "Yield %",
      accessor: "yieldPercent",
      render: (row) => (
        <span
          className={
            row.yieldPercent >= 85
              ? "text-success font-semibold"
              : row.yieldPercent >= 75
              ? "text-warning font-semibold"
              : "text-danger font-semibold"
          }
        >
          {row.yieldPercent}%
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => statusBadge(row.status),
    },
    {
      header: "Processing Stage",
      accessor: "processingStage",
      render: (row) => (
        <Badge variant={stageBadgeVariant[row.processingStage] || "default"} dot>{row.processingStage}</Badge>
      ),
    },
    {
      header: "Supervisor",
      accessor: "supervisor",
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
            <Button variant="danger" onClick={() => {
              setDataList((prev) => prev.filter((d) => d.id !== deleteModal.id));
              success(`Batch ${deleteModal.batchNumber} has been deleted.`);
              setDeleteModal(null);
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
