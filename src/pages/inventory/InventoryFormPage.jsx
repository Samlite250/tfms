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

import { useRealtimeCollection } from "../../hooks/useRealtimeCollection";
import { inventorySeed } from "../../firebase/seedData";

const CATEGORY_OPTIONS = [
  { value: "Coffee Stock", label: "Coffee Stock" },
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

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

function InventoryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const isEditing = Boolean(id);
  const { data: inventoryList, addItem, updateItem } = useRealtimeCollection("inventory", inventorySeed);

  const existingItem = isEditing
    ? (inventoryList || []).find((i) => String(i.id) === String(id) || i.name === id)
    : null;

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
      category: "Coffee Stock",
      description: "",
      quantity: "",
      unit: "kg",
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
    if (existingItem) {
      reset({
        name: existingItem.name || "",
        category: existingItem.category || "Coffee Stock",
        description: existingItem.description || "",
        quantity: String(existingItem.quantity || 0),
        unit: existingItem.unit || "kg",
        minStock: String(existingItem.minStock || 0),
        costPerUnit: String(existingItem.costPerUnit || 0),
        supplier: existingItem.supplier || "",
        location: existingItem.location || "",
        reorderPoint: String(existingItem.reorderPoint || 0),
      });
    }
  }, [existingItem, reset]);

  async function onSubmit(data) {
    const payload = {
      name: data.name,
      category: data.category || "Coffee Stock",
      description: data.description || "",
      quantity: Number(data.quantity) || 0,
      unit: data.unit || "kg",
      minStock: Number(data.minStock) || 0,
      costPerUnit: Number(data.costPerUnit) || 0,
      supplier: data.supplier || "",
      location: data.location || "",
      reorderPoint: Number(data.reorderPoint) || 0,
      lastUpdated: new Date().toISOString().split("T")[0],
    };

    if (isEditing && existingItem) {
      await updateItem(existingItem.id, payload);
      toast.success("Item updated successfully!");
    } else {
      await addItem({ id: `ITEM-${Date.now()}`, ...payload });
      toast.success("Item created successfully!");
    }
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
                    placeholder="e.g. Green Coffee Beans (Premium)"
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
