import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Package,
  Leaf,
  Cog,
  PackageCheck,
  Hash,
  Calendar,
  Weight,
  Clock,
  Thermometer,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";

const coffeeGradeOptions = [
  { value: "AA", label: "AA - AA Grade" },
  { value: "AB", label: "AB - AB Grade" },
  { value: "PB", label: "PB - Peaberry" },
  { value: "C", label: "C - C Grade" },
  { value: "TT", label: "TT - T Grade Light" },
  { value: "T", label: "T - T Grade" },
  { value: "E", label: "E - Elephant" },
  { value: "MH", label: "MH - Mbuni Heavy" },
  { value: "SM", label: "SM - Soft Module" },
  { value: "P", label: "P - Parchment" },
];

const supervisorOptions = [
  { value: "R. Perera", label: "R. Perera" },
  { value: "K. Fernando", label: "K. Fernando" },
  { value: "M. de Silva", label: "M. de Silva" },
  { value: "A. Bandara", label: "A. Bandara" },
  { value: "S. Jayawardena", label: "S. Jayawardena" },
  { value: "N. Wijesinghe", label: "N. Wijesinghe" },
  { value: "D. Rajapaksa", label: "D. Rajapaksa" },
  { value: "T. Gunasekara", label: "T. Gunasekara" },
];

const methodOptions = [
  { value: "Washed", label: "Washed Process" },
  { value: "Natural", label: "Natural Process" },
];

const qualityGradeOptions = [
  { value: "A", label: "Grade A - Premium" },
  { value: "B", label: "Grade B - Standard" },
  { value: "C", label: "Grade C - Economy" },
];

const steps = [
  { id: 1, label: "Batch Info", icon: Package },
  { id: 2, label: "Raw Materials", icon: Leaf },
  { id: 3, label: "Processing", icon: Cog },
  { id: 4, label: "Output", icon: PackageCheck },
];

const mockEditData = {
  batchNumber: "BATCH-2026-025",
  productionDate: "2026-07-10",
  teaGrade: "TT",
  supervisor: "R. Perera",
  greenLeafInput: 450,
  otherMaterials: "12 kg husks, 5 kg parchment",
  processingMethod: "Washed",
  fermentationTime: 90,
  dryingTime: 25,
  firingTemperature: 85,
  finishedProductWeight: 365,
  wasteWeight: 42,
  qualityGrade: "A",
  notes: "Premium batch with excellent aroma profile.",
};

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", damping: 25, stiffness: 200 },
  },
  exit: (direction) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
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

function ProductionFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: isEdit
      ? mockEditData
      : {
        batchNumber: `BATCH-2026-${String(Math.floor(Math.random() * 900) + 100).padStart(3, "0")}`,
        productionDate: new Date().toISOString().split("T")[0],
        teaGrade: "",
        supervisor: "",
        greenLeafInput: "",
        processingMethod: "Washed",
        finishedProductWeight: "",
        qualityGrade: "A",
        notes: "",
      },
  });

  const greenLeafInput = watch("greenLeafInput");
  const finishedProductWeight = watch("finishedProductWeight");

  const yieldPercentage =
    greenLeafInput && finishedProductWeight
      ? ((parseFloat(finishedProductWeight) / parseFloat(greenLeafInput)) * 100).toFixed(1)
      : "0.0";

  useEffect(() => {
    if (isEdit) {
      Object.entries(mockEditData).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [isEdit, setValue]);

  const onSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    navigate("/production");
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-3xl mx-auto"
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
        <h1 className="text-2xl font-bold text-text-primary">
          {isEdit ? "Edit Production Batch" : "New Production Batch"}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {isEdit
            ? `Editing ${mockEditData.batchNumber}`
            : "Enter batch details below to create a new production batch"}
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card padding="lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Section 1: Batch Info & Input */}
            <div>
              <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2 border-b border-border pb-2">
                <Package size={18} className="text-primary" />
                1. Batch Information & Raw Material
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Batch Number"
                  value={watch("batchNumber")}
                  disabled
                  icon={Hash}
                  helperText="Auto-generated"
                />
                <Input
                  label="Production Date"
                  type="date"
                  icon={Calendar}
                  error={errors.productionDate?.message}
                  {...register("productionDate", {
                    required: "Production date is required",
                  })}
                />
                <Select
                  label="Coffee Grade *"
                  options={coffeeGradeOptions}
                  placeholder="Select grade"
                  value={watch("teaGrade")}
                  onChange={(val) => setValue("teaGrade", val)}
                  error={errors.teaGrade?.message}
                />
                <Select
                  label="Supervisor *"
                  options={supervisorOptions}
                  placeholder="Select supervisor"
                  value={watch("supervisor")}
                  onChange={(val) => setValue("supervisor", val)}
                  error={errors.supervisor?.message}
                  searchable
                />
                <Input
                  label="Cherry Input (kg) *"
                  type="number"
                  icon={Weight}
                  placeholder="e.g. 500"
                  error={errors.greenLeafInput?.message}
                  {...register("greenLeafInput", {
                    required: "Cherry input is required",
                    min: { value: 1, message: "Must be at least 1 kg" },
                    valueAsNumber: true,
                  })}
                />
                <Select
                  label="Processing Method"
                  options={methodOptions}
                  placeholder="Select method"
                  value={watch("processingMethod")}
                  onChange={(val) => setValue("processingMethod", val)}
                />
              </div>
            </div>

            {/* Section 2: Output & Quality */}
            <div>
              <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2 border-b border-border pb-2">
                <PackageCheck size={18} className="text-primary" />
                2. Output & Quality Grade
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Parchment Output (kg)"
                  type="number"
                  icon={Weight}
                  placeholder="e.g. 410"
                  {...register("finishedProductWeight", {
                    min: { value: 0, message: "Cannot be negative" },
                    valueAsNumber: true,
                  })}
                />
                <Select
                  label="Quality Grade"
                  options={qualityGradeOptions}
                  placeholder="Select quality grade"
                  value={watch("qualityGrade")}
                  onChange={(val) => setValue("qualityGrade", val)}
                />
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-text-primary block mb-1.5">
                    Notes / Remarks
                  </label>
                  <textarea
                    className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary min-h-[70px]"
                    placeholder="Optional batch notes..."
                    {...register("notes")}
                  />
                </div>
              </div>
            </div>

            {/* Yield Summary Card */}
            {(greenLeafInput || finishedProductWeight) && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <CheckCircle2 size={18} className="text-primary" />
                  <span>Calculated Batch Yield:</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-primary">{yieldPercentage}%</span>
                  <span className="text-xs text-text-secondary block">
                    ({finishedProductWeight || 0} kg output / {greenLeafInput || 0} kg input)
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/production")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={Save}
                loading={isSubmitting}
              >
                {isEdit ? "Update Batch" : "Create Production Batch"}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default ProductionFormPage;
