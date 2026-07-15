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

const teaGrades = [
  { value: "all", label: "All Grades" },
  { value: "OP1", label: "OP1" },
  { value: "OPA", label: "OPA" },
  { value: "OPB", label: "OPB" },
  { value: "OPC", label: "OPC" },
  { value: "BOP1", label: "BOP1" },
  { value: "BOPA", label: "BOPA" },
  { value: "BOPB", label: "BOPB" },
  { value: "BOPC", label: "BOPC" },
  { value: "CTC", label: "CTC" },
  { value: "DUST1", label: "DUST1" },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
  { value: "Quality Check", label: "Quality Check" },
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

const teaGradesList = ["OP1", "OPA", "OPB", "OPC", "BOP1", "BOPA", "BOPB", "BOPC", "CTC", "DUST1"];

function generateMockData() {
  const records = [];
  for (let i = 1; i <= 24; i++) {
    const rawMaterial = Math.floor(Math.random() * 200) + 200;
    const yieldPct = 70 + Math.random() * 20;
    const finishedProduct = Math.round(rawMaterial * yieldPct) / 100;
    const statuses = ["Completed", "In Progress", "Quality Check"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
    const month = String(Math.floor(Math.random() * 2) + 6).padStart(2, "0");

    records.push({
      id: i,
      batchNumber: `BATCH-2026-${String(i).padStart(3, "0")}`,
      date: `2026-${month}-${day}`,
      teaGrade: teaGradesList[Math.floor(Math.random() * teaGradesList.length)],
      rawMaterial,
      finishedProduct: Math.round(finishedProduct * 10) / 10,
      yieldPercent: Math.round(yieldPct * 10) / 10,
      status,
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
    bgColor: "bg-primary/10",
    change: "+12%",
    changeColor: "text-success",
    borderColor: "#2E7D32",
  },
  {
    label: "This Month",
    value: "12,500 kg",
    icon: TrendingUp,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    change: "+8%",
    changeColor: "text-success",
    borderColor: "#1B5E20",
  },
  {
    label: "Batches This Month",
    value: "48",
    icon: Package,
    color: "text-accent",
    bgColor: "bg-accent/10",
    change: "+5",
    changeColor: "text-success",
    borderColor: "#F9A825",
  },
  {
    label: "Average Batch Size",
    value: "260 kg",
    icon: BarChart3,
    color: "text-info",
    bgColor: "bg-info/10",
    change: "+3%",
    changeColor: "text-success",
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
      return matchesSearch && matchesDate && matchesGrade && matchesStatus;
    });
  }, [dataList, searchTerm, dateFilter, gradeFilter, statusFilter]);

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
      header: "Tea Grade",
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
            Track and manage tea production batches
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
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card padding="md" shadow="md" hover className="border-l-4" style={{ borderLeftColor: stat.borderColor }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-text-secondary">{stat.label}</p>
                  <p className="text-2xl font-bold text-text-primary mt-1">
                    {stat.value}
                  </p>
                  <p className={`text-xs mt-1 font-medium ${stat.changeColor}`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <stat.icon size={22} className={stat.color} />
                </div>
              </div>
            </Card>
          </motion.div>
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
                  options={teaGrades}
                  value={gradeFilter}
                  onChange={setGradeFilter}
                  placeholder="Tea Grade"
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
