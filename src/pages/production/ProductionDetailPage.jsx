import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Leaf,
  Cog,
  PackageCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Weight,
  Thermometer,
  FileText,
  TrendingUp,
  BarChart3,
  Timer,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";

const mockBatch = {
  id: 25,
  batchNumber: "BATCH-2026-025",
  date: "2026-07-10",
  teaGrade: "BOP1",
  supervisor: "R. Perera",
  status: "Completed",
  greenLeafInput: 450,
  otherMaterials: "12 kg stems, 5 kg dust",
  processingMethod: "Orthodox",
  fermentationTime: 90,
  dryingTime: 25,
  firingTemperature: 85,
  finishedProductWeight: 365,
  wasteWeight: 42,
  qualityGrade: "A",
  notes: "Premium batch with excellent aroma profile. Strong demand from export markets.",
  yieldPercent: 81.1,
  timeline: [
    {
      step: "Leaf Collection",
      time: "06:00 AM",
      date: "2026-07-10",
      status: "completed",
      details: "450 kg green leaf collected from fields A3, B1",
    },
    {
      step: "Withering",
      time: "07:30 AM",
      date: "2026-07-10",
      status: "completed",
      details: "14 hours indoor withering, humidity 68%",
    },
    {
      step: "Rolling",
      time: "09:30 AM",
      date: "2026-07-10",
      status: "completed",
      details: "Orthodox rolling for 45 minutes",
    },
    {
      step: "Fermentation",
      time: "10:15 AM",
      date: "2026-07-10",
      status: "completed",
      details: "90 minutes fermentation at 28°C",
    },
    {
      step: "Drying",
      time: "11:45 AM",
      date: "2026-07-10",
      status: "completed",
      details: "25 minutes at 85°C, moisture reduced to 3%",
    },
    {
      step: "Sorting & Grading",
      time: "01:00 PM",
      date: "2026-07-10",
      status: "completed",
      details: "Sorted to BOP1 grade, 365 kg finished product",
    },
    {
      step: "Quality Check",
      time: "02:30 PM",
      date: "2026-07-10",
      status: "completed",
      details: "Grade A assessment, aroma: excellent, color: bright copper",
    },
    {
      step: "Packaging",
      time: "03:30 PM",
      date: "2026-07-10",
      status: "completed",
      details: "Packed in 25 kg foil-lined bags, 15 bags total",
    },
  ],
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 20, stiffness: 200 },
  },
};

const tabContent = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 200 },
  },
};

function ProductionDetailPage() {
  const navigate = useNavigate();
  useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const batch = mockBatch;

  const statusBadge = (status) => {
    const map = {
      Completed: "success",
      "In Progress": "warning",
      "Quality Check": "info",
    };
    return <Badge variant={map[status] || "default"} dot>{status}</Badge>;
  };

  const qualityGradeBadge = (grade) => {
    const map = { A: "success", B: "warning", C: "danger" };
    return (
      <Badge variant={map[grade] || "default"}>
        Grade {grade}
      </Badge>
    );
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Package },
    { id: "quality", label: "Quality", icon: CheckCircle2 },
    { id: "timeline", label: "Timeline", icon: Clock },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <Button
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => navigate("/production")}
          className="mb-2"
        >
          Back to Production
        </Button>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-start justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-text-primary">
              {batch.batchNumber}
            </h1>
            {statusBadge(batch.status)}
            {qualityGradeBadge(batch.qualityGrade)}
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Production batch created on {batch.date}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Edit}
            onClick={() => navigate(`/production/${batch.id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Raw Material",
            value: `${batch.greenLeafInput} kg`,
            icon: Leaf,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "Finished Product",
            value: `${batch.finishedProductWeight} kg`,
            icon: PackageCheck,
            color: "text-secondary",
            bg: "bg-secondary/10",
          },
          {
            label: "Yield",
            value: `${batch.yieldPercent}%`,
            icon: TrendingUp,
            color: batch.yieldPercent >= 85 ? "text-success" : batch.yieldPercent >= 75 ? "text-warning" : "text-danger",
            bg: batch.yieldPercent >= 85 ? "bg-success/10" : batch.yieldPercent >= 75 ? "bg-warning/10" : "bg-danger/10",
          },
          {
            label: "Waste",
            value: `${batch.wasteWeight} kg`,
            icon: BarChart3,
            color: "text-text-secondary",
            bg: "bg-gray-100",
          },
        ].map((stat) => (
          <Card key={stat.label} padding="md" hover>
            <div className="flex items-center gap-3">
              <div className={`${stat.bg} p-2.5 rounded-xl`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <div>
                <p className="text-xs text-text-secondary">{stat.label}</p>
                <p className="text-lg font-bold text-text-primary">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card padding="none">
          <div className="flex border-b border-border overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap
                  transition-all duration-200 cursor-pointer border-b-2
                  ${
                    activeTab === tab.id
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-text-secondary hover:bg-gray-50"
                  }
                `}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                variants={tabContent}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                      Raw Materials
                    </h3>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between py-2 border-b border-border/60">
                        <span className="text-sm text-text-secondary flex items-center gap-2">
                          <Leaf size={14} className="text-primary" />
                          Green Leaf Input
                        </span>
                        <span className="text-sm font-semibold text-text-primary">
                          {batch.greenLeafInput} kg
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-border/60">
                        <span className="text-sm text-text-secondary flex items-center gap-2">
                          <Package size={14} className="text-primary" />
                          Other Materials
                        </span>
                        <span className="text-sm font-medium text-text-primary">
                          {batch.otherMaterials || "None"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-text-secondary flex items-center gap-2">
                          <User size={14} className="text-primary" />
                          Supervisor
                        </span>
                        <span className="text-sm font-medium text-text-primary">
                          {batch.supervisor}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                      Process Information
                    </h3>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between py-2 border-b border-border/60">
                        <span className="text-sm text-text-secondary flex items-center gap-2">
                          <Cog size={14} className="text-primary" />
                          Processing Method
                        </span>
                        <Badge variant="info">{batch.processingMethod}</Badge>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-border/60">
                        <span className="text-sm text-text-secondary flex items-center gap-2">
                          <Timer size={14} className="text-primary" />
                          Fermentation Time
                        </span>
                        <span className="text-sm font-medium text-text-primary">
                          {batch.fermentationTime} min
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-border/60">
                        <span className="text-sm text-text-secondary flex items-center gap-2">
                          <Clock size={14} className="text-primary" />
                          Drying Time
                        </span>
                        <span className="text-sm font-medium text-text-primary">
                          {batch.dryingTime} min
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-text-secondary flex items-center gap-2">
                          <Thermometer size={14} className="text-primary" />
                          Firing Temperature
                        </span>
                        <span className="text-sm font-medium text-text-primary">
                          {batch.firingTemperature}°C
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                    Output Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-primary/5 rounded-xl p-4 text-center">
                      <Weight size={20} className="text-primary mx-auto mb-2" />
                      <p className="text-xs text-text-secondary">Finished Product</p>
                      <p className="text-xl font-bold text-text-primary">
                        {batch.finishedProductWeight} kg
                      </p>
                    </div>
                    <div className="bg-warning/5 rounded-xl p-4 text-center">
                      <BarChart3 size={20} className="text-warning mx-auto mb-2" />
                      <p className="text-xs text-text-secondary">Waste / By-product</p>
                      <p className="text-xl font-bold text-text-primary">
                        {batch.wasteWeight} kg
                      </p>
                    </div>
                    <div className="bg-success/5 rounded-xl p-4 text-center">
                      <TrendingUp size={20} className="text-success mx-auto mb-2" />
                      <p className="text-xs text-text-secondary">Yield Percentage</p>
                      <p className="text-xl font-bold text-success">
                        {batch.yieldPercent}%
                      </p>
                    </div>
                  </div>
                </div>

                {batch.notes && (
                  <div>
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                      Notes
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-text-primary flex items-start gap-2">
                        <FileText size={14} className="text-text-secondary mt-0.5 shrink-0" />
                        {batch.notes}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "quality" && (
              <motion.div
                key="quality"
                variants={tabContent}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card padding="md" bordered>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 size={28} className="text-success" />
                      </div>
                      <p className="text-sm text-text-secondary">Quality Grade</p>
                      <p className="text-3xl font-bold text-text-primary mt-1">
                        {batch.qualityGrade}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {batch.qualityGrade === "A"
                          ? "Premium Quality"
                          : batch.qualityGrade === "B"
                          ? "Standard Quality"
                          : "Economy Quality"}
                      </p>
                    </div>
                  </Card>
                  <Card padding="md" bordered>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <TrendingUp size={28} className="text-primary" />
                      </div>
                      <p className="text-sm text-text-secondary">Yield Efficiency</p>
                      <p className={`text-3xl font-bold mt-1 ${
                        batch.yieldPercent >= 85
                          ? "text-success"
                          : batch.yieldPercent >= 75
                          ? "text-warning"
                          : "text-danger"
                      }`}>
                        {batch.yieldPercent}%
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {batch.yieldPercent >= 85
                          ? "Above target"
                          : batch.yieldPercent >= 75
                          ? "Within target"
                          : "Below target"}
                      </p>
                    </div>
                  </Card>
                  <Card padding="md" bordered>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                        <Cog size={28} className="text-accent" />
                      </div>
                      <p className="text-sm text-text-secondary">Processing</p>
                      <p className="text-xl font-bold text-text-primary mt-1">
                        {batch.processingMethod}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {batch.fermentationTime}min fermentation
                      </p>
                    </div>
                  </Card>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                    Quality Metrics
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Leaf Appearance", value: "Uniform, well-curled", score: "92/100" },
                      { label: "Aroma Profile", value: "Excellent, floral notes", score: "95/100" },
                      { label: "Liquor Color", value: "Bright copper", score: "90/100" },
                      { label: "Cup Taste", value: "Rich, full-bodied", score: "88/100" },
                      { label: "Infusion", value: "Bright, uniform", score: "91/100" },
                      { label: "Moisture Content", value: "3.0% (target: <4%)", score: "96/100" },
                    ].map((metric) => (
                      <div
                        key={metric.label}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                      >
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {metric.label}
                          </p>
                          <p className="text-xs text-text-secondary">{metric.value}</p>
                        </div>
                        <span className="text-sm font-bold text-primary">
                          {metric.score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "timeline" && (
              <motion.div
                key="timeline"
                variants={tabContent}
                initial="hidden"
                animate="visible"
                className="space-y-1"
              >
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                  Processing Timeline
                </h3>
                <div className="relative">
                  <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-primary/20" />
                  {batch.timeline.map((event, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className="relative flex gap-4 pb-6 last:pb-0"
                    >
                      <div
                        className={`
                          relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0
                          ${
                            event.status === "completed"
                              ? "bg-primary text-white"
                              : event.status === "active"
                              ? "bg-accent text-white"
                              : "bg-gray-200 text-text-secondary"
                          }
                        `}
                      >
                        {event.status === "completed" ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          <span className="text-xs font-bold">{idx + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-text-primary">
                              {event.step}
                            </p>
                            <p className="text-xs text-text-secondary mt-0.5">
                              {event.details}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-medium text-text-primary">
                              {event.time}
                            </p>
                            <p className="text-xs text-text-secondary">{event.date}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Production Batch"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={Trash2}
              onClick={() => {
                setShowDeleteModal(false);
                navigate("/production");
              }}
            >
              Delete Batch
            </Button>
          </>
        }
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-danger" />
          </div>
          <p className="text-text-primary font-medium">
            Are you sure you want to delete this production batch?
          </p>
          <p className="text-sm text-text-secondary mt-2">
            This will permanently remove <strong>{batch.batchNumber}</strong> and all
            associated data. This action cannot be undone.
          </p>
        </div>
      </Modal>
    </motion.div>
  );
}

export default ProductionDetailPage;
