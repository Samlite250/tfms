import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Save,
  Calendar,
  Weight,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";

import { useToast } from "../../components/ui/Toast";
import { useRealtimeCollection } from "../../hooks/useRealtimeCollection";
import { productionSeed } from "../../firebase/seedData";

const coffeeGradeOptions = [
  { value: "AA", label: "Grade AA (Premium)" },
  { value: "AB", label: "Grade AB (Standard)" },
  { value: "PB", label: "Grade PB (Peaberry)" },
  { value: "C", label: "Grade C (Low Grade)" },
  { value: "TT", label: "Grade TT (Triage)" },
];

function ProductionFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { success } = useToast();
  const { data: productionList, addItem, updateItem } = useRealtimeCollection("production", productionSeed);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingRecord = isEdit ? (productionList || []).find((r) => String(r.id) === String(id) || r.batchNumber === id) : null;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: existingRecord
      ? {
        recordId: existingRecord.batchNumber,
        productionDate: existingRecord.date,
        coffeeGrade: existingRecord.teaGrade || "AA",
        weight: existingRecord.rawMaterial || 0,
      }
      : {
        recordId: `BATCH-2026-${String(Math.floor(Math.random() * 900) + 100).padStart(3, "0")}`,
        productionDate: new Date().toISOString().split("T")[0],
        coffeeGrade: "AA",
        weight: "",
      },
  });

  useEffect(() => {
    if (existingRecord) {
      setValue("recordId", existingRecord.batchNumber);
      setValue("productionDate", existingRecord.date);
      setValue("coffeeGrade", existingRecord.teaGrade || "AA");
      setValue("weight", existingRecord.rawMaterial || 0);
    }
  }, [existingRecord, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const weightVal = parseFloat(data.weight) || 0;
    const yieldPct = 80;
    const finishedProduct = Math.round(weightVal * (yieldPct / 100) * 10) / 10;

    const payload = {
      batchNumber: data.recordId,
      date: data.productionDate,
      teaGrade: data.coffeeGrade,
      rawMaterial: weightVal,
      finishedProduct,
      yieldPercent: yieldPct,
      status: "In Progress",
      processingStage: "Washing",
      supervisor: "Factory Manager",
      qualityNotes: "",
    };

    if (isEdit && existingRecord) {
      await updateItem(existingRecord.id, payload);
      success(`Production batch ${data.recordId} updated.`);
    } else {
      await addItem({ id: `BATCH-${Date.now()}`, ...payload });
      success(`New production batch ${data.recordId} recorded.`);
    }
    setIsSubmitting(false);
    navigate("/production");
  };

  return (
    <div className="space-y-5 max-w-xl mx-auto">
      <div>
        <Button
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => navigate("/production")}
          className="mb-2"
        >
          Back to Production
        </Button>
        <h1 className="text-xl font-bold text-text-primary">
          {isEdit ? "Edit Production Record" : "New Production Record"}
        </h1>
        <p className="text-sm text-text-secondary mt-0.5">
          {isEdit
            ? `Editing ${existingRecord?.batchNumber || ""}`
            : "Fill in this simple form to add a production record."}
        </p>
      </div>

      <Card padding="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="ID"
              value={watch("recordId")}
              disabled
              helperText="Auto-created"
            />
            <Input
              label="Date"
              type="date"
              icon={Calendar}
              error={errors.productionDate?.message}
              {...register("productionDate", {
                required: "Please select a date",
              })}
            />
            <Select
              label="Coffee Grade *"
              options={coffeeGradeOptions}
              placeholder="Select grade"
              value={watch("coffeeGrade")}
              onChange={(val) => setValue("coffeeGrade", val)}
              error={errors.coffeeGrade?.message}
            />
            <Input
              label="Weight (kg) *"
              type="number"
              icon={Weight}
              placeholder="e.g. 500"
              error={errors.weight?.message}
              {...register("weight", {
                required: "Please enter weight in kg",
                min: { value: 1, message: "Must be at least 1 kg" },
                valueAsNumber: true,
              })}
            />
          </div>

          {/* Form Actions */}
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
              {isEdit ? "Save Changes" : "Save Record"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default ProductionFormPage;

