import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Save,
  Hash,
  Calendar,
  Weight,
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

const qualityGradeOptions = [
  { value: "A", label: "Grade A - Excellent" },
  { value: "B", label: "Grade B - Standard" },
  { value: "C", label: "Grade C - Low" },
];

const mockEditData = {
  recordId: "REC-2026-025",
  productionDate: "2026-07-10",
  coffeeGrade: "AA",
  weight: 450,
  qualityGrade: "A",
  notes: "Good quality record.",
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
        recordId: `REC-2026-${String(Math.floor(Math.random() * 900) + 100).padStart(3, "0")}`,
        productionDate: new Date().toISOString().split("T")[0],
        coffeeGrade: "AA",
        weight: "",
        qualityGrade: "A",
        notes: "",
      },
  });

  useEffect(() => {
    if (isEdit) {
      Object.entries(mockEditData).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [isEdit, setValue]);

  const onSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
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
            ? `Editing ${mockEditData.recordId}`
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
              icon={Hash}
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
            <div className="sm:col-span-2">
              <Select
                label="Quality Grade"
                options={qualityGradeOptions}
                placeholder="Select quality grade"
                value={watch("qualityGrade")}
                onChange={(val) => setValue("qualityGrade", val)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-text-primary block mb-1">
              Notes (Optional)
            </label>
            <textarea
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary min-h-[60px]"
              placeholder="Add optional notes..."
              {...register("notes")}
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
