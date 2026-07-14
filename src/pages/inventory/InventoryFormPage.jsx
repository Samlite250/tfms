import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Package } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { useToast } from "../../components/ui/Toast";

const CATEGORY_OPTIONS = [
  { value: "Tea Stock", label: "Tea Stock" },
  { value: "Raw Materials", label: "Raw Materials" },
  { value: "Packaging", label: "Packaging Materials" },
  { value: "Chemicals", label: "Chemicals" },
  { value: "Fuel", label: "Fuel" },
  { value: "Other", label: "Other" },
];

const UNIT_OPTIONS = [
  { value: "kg", label: "Kilograms (kg)" },
  { value: "liters", label: "Liters (L)" },
  { value: "pieces", label: "Pieces (pcs)" },
  { value: "bags", label: "Bags" },
  { value: "boxes", label: "Boxes" },
];

const MOCK_ITEMS = {
  1: { name: "Green Tea Leaves (Premium)", category: "Tea Stock", description: "Premium grade green tea leaves from highland farms", quantity: 2450, unit: "kg", minStock: 500, costPerUnit: 12.5, supplier: "Highland Tea Estates", location: "Warehouse A", reorderPoint: 600 },
  2: { name: "Black Tea Leaves (Standard)", category: "Tea Stock", description: "Standard grade black tea leaves", quantity: 1800, unit: "kg", minStock: 400, costPerUnit: 8.75, supplier: "Valley Plantations", location: "Warehouse A", reorderPoint: 500 },
  3: { name: "Oolong Tea Leaves", category: "Tea Stock", description: "Premium oolong tea leaves", quantity: 320, unit: "kg", minStock: 200, costPerUnit: 15.0, supplier: "Mountain View Estate", location: "Warehouse A", reorderPoint: 250 },
  4: { name: "White Tea Buds", category: "Tea Stock", description: "Delicate white tea buds", quantity: 85, unit: "kg", minStock: 100, costPerUnit: 22.0, supplier: "Silver Tip Farms", location: "Warehouse A", reorderPoint: 120 },
  5: { name: "Matcha Powder", category: "Tea Stock", description: "Ceremonial grade matcha powder", quantity: 45, unit: "kg", minStock: 50, costPerUnit: 35.0, supplier: "ShadeGrown Co.", location: "Warehouse B", reorderPoint: 60 },
};

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

function InventoryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const isEditing = Boolean(id);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      category: null,
      description: "",
      quantity: "",
      unit: null,
      minStock: "",
      costPerUnit: "",
      supplier: "",
      location: "",
      reorderPoint: "",
    },
  });

  const selectedCategory = watch("category");
  const selectedUnit = watch("unit");

  useEffect(() => {
    if (isEditing && MOCK_ITEMS[id]) {
      const item = MOCK_ITEMS[id];
      reset({
        name: item.name,
        category: item.category,
        description: item.description,
        quantity: String(item.quantity),
        unit: item.unit,
        minStock: String(item.minStock),
        costPerUnit: String(item.costPerUnit),
        supplier: item.supplier,
        location: item.location,
        reorderPoint: String(item.reorderPoint),
      });
    }
  }, [id, isEditing, reset]);

  function onSubmit(data) {
    const parsed = {
      ...data,
      quantity: Number(data.quantity),
      minStock: Number(data.minStock),
      costPerUnit: Number(data.costPerUnit),
      reorderPoint: Number(data.reorderPoint),
    };
    console.log("Saved:", parsed);
    toast.success(isEditing ? "Item updated successfully!" : "Item created successfully!");
    navigate("/inventory");
  }

  return (
    <div className="min-h-screen bg-bg p-4 md:p-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="max-w-3xl mx-auto space-y-6"
      >
        <motion.div variants={fadeIn}>
          <button
            onClick={() => navigate("/inventory")}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm font-medium mb-4 cursor-pointer"
          >
            <ArrowLeft size={18} />
            Back to Inventory
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {isEditing ? "Edit Inventory Item" : "Add New Item"}
              </h1>
              <p className="text-text-secondary text-sm">
                {isEditing ? "Update item details below" : "Fill in the details to add a new inventory item"}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card padding="lg" shadow="md">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Item Name"
                    placeholder="e.g. Green Tea Leaves (Premium)"
                    error={errors.name?.message}
                    {...register("name", { required: "Item name is required" })}
                  />
                </div>

                <Select
                  label="Category"
                  options={CATEGORY_OPTIONS}
                  placeholder="Select category"
                  value={selectedCategory}
                  onChange={(val) => setValue("category", val, { shouldValidate: true })}
                  error={errors.category?.message}
                />

                <Select
                  label="Unit of Measure"
                  options={UNIT_OPTIONS}
                  placeholder="Select unit"
                  value={selectedUnit}
                  onChange={(val) => setValue("unit", val, { shouldValidate: true })}
                  error={errors.unit?.message}
                />

                <div className="md:col-span-2">
                  <Input
                    label="Description"
                    placeholder="Brief description of the item"
                    {...register("description")}
                  />
                </div>

                <Input
                  label="Current Quantity"
                  type="number"
                  placeholder="0"
                  error={errors.quantity?.message}
                  {...register("quantity", {
                    required: "Quantity is required",
                    min: { value: 0, message: "Must be 0 or greater" },
                  })}
                />

                <Input
                  label="Cost per Unit ($)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  error={errors.costPerUnit?.message}
                  {...register("costPerUnit", {
                    required: "Cost is required",
                    min: { value: 0, message: "Must be 0 or greater" },
                  })}
                />

                <Input
                  label="Minimum Stock Level"
                  type="number"
                  placeholder="0"
                  error={errors.minStock?.message}
                  {...register("minStock", {
                    required: "Minimum stock level is required",
                    min: { value: 0, message: "Must be 0 or greater" },
                  })}
                />

                <Input
                  label="Reorder Point"
                  type="number"
                  placeholder="0"
                  error={errors.reorderPoint?.message}
                  {...register("reorderPoint", {
                    required: "Reorder point is required",
                    min: { value: 0, message: "Must be 0 or greater" },
                  })}
                />

                <Input
                  label="Supplier"
                  placeholder="Supplier name"
                  {...register("supplier")}
                />

                <Input
                  label="Storage Location"
                  placeholder="e.g. Warehouse A"
                  {...register("location")}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button variant="ghost" onClick={() => navigate("/inventory")}>
                  Cancel
                </Button>
                <Button type="submit" icon={Save} loading={isSubmitting}>
                  {isEditing ? "Update Item" : "Create Item"}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default InventoryFormPage;
