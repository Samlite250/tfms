import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Save,
  Hash,
  Calendar,
  Weight,
  CheckCircle2,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";

const coffeeGradeOptions = [
  { value: "AA", label: "Grade AA (Premium)" },
  { value: "AB", label: "Grade AB (Standard)" },
  { value: "PB", label: "Grade PB (Peaberry)" },
  { value: "C", label: "Grade C (Low Grade)" },
];

const supervisorOptions = [
  { value: "R. Perera", label: "R. Perera" },
  { value: "K. Fernando", label: "K. Fernando" },
  { value: "M. de Silva", label: "M. de Silva" },
  { value: "A. Bandara", label: "A. Bandara" },
];

const methodOptions = [
  { value: "Washed", label: "Washed Process" },
  { value: "Natural", label: "Natural Process" },
];

const qualityGradeOptions = [
  { value: "A", label: "Grade A - Excellent" },
  { value: "B", label: "Grade B - Standard" },
  { value: "C", label: "Grade C - Low" },
];

const mockEditData = {
  batchNumber: "BATCH-2026-025",
  productionDate: "2026-07-10",
  teaGrade: "AA",
  supervisor: "R. Perera",
  greenLeafInput: 450,
  processingMethod: "Washed",
  finishedProductWeight: 365,
  qualityGrade: "A",
  notes: "Good quality batch.",
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
        teaGrade: "AA",
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
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmitting(false);
    navigate("/production");
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div>
        <Button
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => navigate("/production")}
          className="mb-2"
        >
          Back to Batches
        </Button>
        <h1 className="text-xl font-bold text-text-primary">
          {isEdit ? "Edit Coffee Batch" : "New Coffee Batch"}
        </h1>
        <p className="text-sm text-text-secondary mt-0.5">
          {isEdit
            ? `Editing ${mockEditData.batchNumber}`
            : "Fill in this simple form to record a new coffee batch."}
        </p>
      </div>

      <Card padding="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Simple Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Batch ID"
              value={watch("batchNumber")}
              disabled
              icon={Hash}
              helperText="Auto-created"
            />
            <Input
              label="Date"
              type="date"
              icon={Calendar}
              error={errors.productionDate?.message}
              {...register("productionDate", {
                required: "Please pick a date",
              })}
            />
            <Select
              label="Coffee Grade *"
              options={coffeeGradeOptions}
              placeholder="Select coffee grade"
              value={watch("teaGrade")}
              onChange={(val) => setValue("teaGrade", val)}
              error={errors.teaGrade?.message}
            />
            <Select
              label="Supervisor Name *"
              options={supervisorOptions}
              placeholder="Select supervisor"
              value={watch("supervisor")}
              onChange={(val) => setValue("supervisor", val)}
              error={errors.supervisor?.message}
            />
            <Input
              label="Fresh Cherry Received (kg) *"
              type="number"
              icon={Weight}
              placeholder="e.g. 500"
              error={errors.greenLeafInput?.message}
              {...register("greenLeafInput", {
                required: "Please enter cherry weight",
                min: { value: 1, message: "Must be at least 1 kg" },
                valueAsNumber: true,
              })}
            />
            <Select
              label="Process Type"
              options={methodOptions}
              placeholder="Select process"
              value={watch("processingMethod")}
              onChange={(val) => setValue("processingMethod", val)}
            />
            <Input
              label="Processed Parchment (kg)"
              type="number"
              icon={Weight}
              placeholder="e.g. 400"
              {...register("finishedProductWeight", {
                min: { value: 0, message: "Cannot be negative" },
                valueAsNumber: true,
              })}
            />
            <Select
              label="Quality Grade"
              options={qualityGradeOptions}
              placeholder="Select quality"
              value={watch("qualityGrade")}
              onChange={(val) => setValue("qualityGrade", val)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-text-primary block mb-1">
              Notes (Optional)
            </label>
            <textarea
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary min-h-[60px]"
              placeholder="Any extra details about this batch..."
              {...register("notes")}
            />
          </div>

          {/* Automatic Yield Summary */}
          {(greenLeafInput || finishedProductWeight) && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <CheckCircle2 size={16} className="text-primary" />
                <span>Calculated Yield:</span>
              </div>
              <span className="text-lg font-bold text-primary">{yieldPercentage}%</span>
            </div>
          )}

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
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
              {isEdit ? "Save Changes" : "Save Coffee Batch"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default ProductionFormPage;
