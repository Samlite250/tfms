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

const teaGradeOptions = [
  { value: "OP1", label: "OP1 - Orange Pekoe 1" },
  { value: "OPA", label: "OPA - Orange Pekoe A" },
  { value: "OPB", label: "OPB - Orange Pekoe B" },
  { value: "OPC", label: "OPC - Orange Pekoe C" },
  { value: "BOP1", label: "BOP1 - Broken Orange Pekoe 1" },
  { value: "BOPA", label: "BOPA - Broken Orange Pekoe A" },
  { value: "BOPB", label: "BOPB - Broken Orange Pekoe B" },
  { value: "BOPC", label: "BOPC - Broken Orange Pekoe C" },
  { value: "CTC", label: "CTC - Crush, Tear, Curl" },
  { value: "DUST1", label: "DUST1 - Dust 1" },
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
  { value: "Orthodox", label: "Orthodox" },
  { value: "CTC", label: "CTC (Crush, Tear, Curl)" },
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
  teaGrade: "BOP1",
  supervisor: "R. Perera",
  greenLeafInput: 450,
  otherMaterials: "12 kg stems, 5 kg dust",
  processingMethod: "Orthodox",
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
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
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
          otherMaterials: "",
          processingMethod: "",
          fermentationTime: "",
          dryingTime: "",
          firingTemperature: "",
          finishedProductWeight: "",
          wasteWeight: "",
          qualityGrade: "",
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

  const validateStep = useCallback(
    async (step) => {
      const fieldsMap = {
        1: ["productionDate", "teaGrade", "supervisor"],
        2: ["greenLeafInput"],
        3: ["processingMethod"],
        4: ["finishedProductWeight"],
      };
      const fields = fieldsMap[step];
      if (!fields) return true;
      const result = await trigger(fields);
      return result;
    },
    [trigger]
  );

  const goNext = async () => {
    const valid = await validateStep(currentStep);
    if (valid && currentStep < 4) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSubmitting(false);
    navigate("/production");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                label="Tea Grade"
                options={teaGradeOptions}
                placeholder="Select tea grade"
                value={watch("teaGrade")}
                onChange={(val) => setValue("teaGrade", val)}
                error={errors.teaGrade?.message}
              />
              <Select
                label="Supervisor"
                options={supervisorOptions}
                placeholder="Select supervisor"
                value={watch("supervisor")}
                onChange={(val) => setValue("supervisor", val)}
                error={errors.supervisor?.message}
                searchable
              />
            </div>
            {errors.teaGrade && (
              <p className="text-xs text-danger flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.teaGrade.message}
              </p>
            )}
            {errors.supervisor && (
              <p className="text-xs text-danger flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.supervisor.message}
              </p>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Green Leaf Input (kg)"
                type="number"
                icon={Weight}
                placeholder="Enter weight in kg"
                error={errors.greenLeafInput?.message}
                {...register("greenLeafInput", {
                  required: "Green leaf input is required",
                  min: { value: 1, message: "Must be at least 1 kg" },
                  valueAsNumber: true,
                })}
              />
              <Input
                label="Other Materials"
                placeholder="e.g. 12 kg stems, 5 kg dust"
                icon={FileText}
                {...register("otherMaterials")}
              />
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <p className="text-sm text-text-secondary">
                <span className="font-semibold text-primary">Tip:</span> Include all raw
                materials added during this batch for accurate yield calculations.
              </p>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Select
                label="Processing Method"
                options={methodOptions}
                placeholder="Select method"
                value={watch("processingMethod")}
                onChange={(val) => setValue("processingMethod", val)}
                error={errors.processingMethod?.message}
              />
              <Input
                label="Fermentation Time (minutes)"
                type="number"
                icon={Clock}
                placeholder="e.g. 90"
                {...register("fermentationTime", {
                  min: { value: 0, message: "Cannot be negative" },
                  valueAsNumber: true,
                })}
              />
              <Input
                label="Drying Time (minutes)"
                type="number"
                icon={Clock}
                placeholder="e.g. 25"
                {...register("dryingTime", {
                  min: { value: 0, message: "Cannot be negative" },
                  valueAsNumber: true,
                })}
              />
              <Input
                label="Firing Temperature (°C)"
                type="number"
                icon={Thermometer}
                placeholder="e.g. 85"
                {...register("firingTemperature", {
                  min: { value: 0, message: "Cannot be negative" },
                  valueAsNumber: true,
                })}
              />
            </div>
            {errors.processingMethod && (
              <p className="text-xs text-danger flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.processingMethod.message}
              </p>
            )}
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Finished Product Weight (kg)"
                type="number"
                icon={Weight}
                placeholder="Enter weight in kg"
                error={errors.finishedProductWeight?.message}
                {...register("finishedProductWeight", {
                  required: "Finished product weight is required",
                  min: { value: 0, message: "Cannot be negative" },
                  valueAsNumber: true,
                })}
              />
              <Input
                label="Waste / By-product (kg)"
                type="number"
                icon={Weight}
                placeholder="Enter waste weight"
                {...register("wasteWeight", {
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
                  Notes
                </label>
                <textarea
                  className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary min-h-[80px] resize-y"
                  placeholder="Add any additional notes about this batch..."
                  {...register("notes")}
                />
              </div>
            </div>

            <div className="bg-accent/10 border border-accent/30 rounded-xl p-5">
              <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-primary" />
                Batch Summary
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-text-secondary">Raw Material</p>
                  <p className="font-bold text-lg text-text-primary">
                    {greenLeafInput ? `${greenLeafInput} kg` : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary">Finished Product</p>
                  <p className="font-bold text-lg text-text-primary">
                    {finishedProductWeight ? `${finishedProductWeight} kg` : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary">Yield</p>
                  <p
                    className={`font-bold text-lg ${
                      parseFloat(yieldPercentage) >= 85
                        ? "text-success"
                        : parseFloat(yieldPercentage) >= 75
                        ? "text-warning"
                        : "text-danger"
                    }`}
                  >
                    {yieldPercentage}%
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary">Quality</p>
                  <p className="font-bold text-lg text-text-primary">
                    {watch("qualityGrade") ? `Grade ${watch("qualityGrade")}` : "-"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-4xl mx-auto"
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
            : "Fill in the details to create a new production batch"}
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card padding="none">
          <div className="flex overflow-x-auto border-b border-border">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => {
                  if (step.id < currentStep) {
                    setDirection(-1);
                    setCurrentStep(step.id);
                  }
                }}
                className={`
                  flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap
                  transition-all duration-200 cursor-pointer border-b-2
                  ${
                    currentStep === step.id
                      ? "border-primary text-primary bg-primary/5"
                      : currentStep > step.id
                      ? "border-success text-success hover:bg-success/5"
                      : "border-transparent text-text-secondary hover:bg-gray-50"
                  }
                `}
              >
                <div
                  className={`
                    w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                    ${
                      currentStep === step.id
                        ? "bg-primary text-white"
                        : currentStep > step.id
                        ? "bg-success text-white"
                        : "bg-gray-200 text-text-secondary"
                    }
                  `}
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    step.id
                  )}
                </div>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="min-h-[280px]">
              <AnimatePresence mode="wait" custom={direction}>
                {renderStepContent()}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between mt-8 pt-5 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={goPrev}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/production")}
                >
                  Cancel
                </Button>

                {currentStep < 4 ? (
                  <Button type="button" variant="primary" onClick={goNext}>
                    Next Step
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    icon={Save}
                    loading={isSubmitting}
                  >
                    {isEdit ? "Update Batch" : "Create Batch"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default ProductionFormPage;
