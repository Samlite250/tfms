import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, AlertCircle, ShoppingCart, Package, ArrowLeftRight } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { useToast } from "../../components/ui/Toast";

import { useRealtimeCollection } from "../../hooks/useRealtimeCollection";
import { inventorySeed } from "../../firebase/seedData";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const staggerContainer = { visible: { transition: { staggerChildren: 0.06 } } };

function LowStockAlerts() {
  const toast = useToast();
  const [reorderModal, setReorderModal] = useState({ open: false, item: null });
  const [filterSeverity, setFilterSeverity] = useState("all");
  const { data: itemsList } = useRealtimeCollection("inventory", inventorySeed);

  const lowStockItems = useMemo(() => {
    return (itemsList || [])
      .filter((i) => i.quantity <= i.minStock)
      .map((i) => ({
        ...i,
        severity: i.quantity <= i.minStock / 2 || i.quantity <= 0 ? "critical" : "warning",
      }));
  }, [itemsList]);

  const alerts = useMemo(() => {
    if (filterSeverity === "all") return lowStockItems;
    return lowStockItems.filter((i) => i.severity === filterSeverity);
  }, [filterSeverity, lowStockItems]);

  const criticalCount = lowStockItems.filter((i) => i.severity === "critical").length;
  const warningCount = lowStockItems.filter((i) => i.severity === "warning").length;

  function handleReorder(item) {
    setReorderModal({ open: true, item });
  }

  function confirmReorder(data) {
    console.log("Reorder:", data);
    toast.success(`Reorder placed for ${reorderModal.item.name}`);
    setReorderModal({ open: false, item: null });
  }

  return (
    <div className="min-h-screen bg-bg p-4 md:p-8">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        <motion.div variants={fadeIn}>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Low Stock Alerts</h1>
            <p className="text-text-secondary mt-1">Items that need immediate attention for restocking</p>
          </div>
        </motion.div>

        <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card hover shadow="sm" padding="md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <AlertTriangle size={24} className="text-warning" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Total Alerts</p>
                <p className="text-2xl font-bold text-text-primary">{lowStockItems.length}</p>
              </div>
            </div>
          </Card>
          <Card hover shadow="sm" padding="md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-danger/10 flex items-center justify-center">
                <AlertCircle size={24} className="text-danger" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Critical</p>
                <p className="text-2xl font-bold text-danger">{criticalCount}</p>
              </div>
            </div>
          </Card>
          <Card hover shadow="sm" padding="md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <AlertTriangle size={24} className="text-warning" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Warning</p>
                <p className="text-2xl font-bold text-warning">{warningCount}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn} className="flex items-center gap-3">
          <span className="text-sm font-medium text-text-secondary">Filter:</span>
          {["all", "critical", "warning"].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors cursor-pointer ${filterSeverity === sev
                ? sev === "critical" ? "bg-danger text-white" : sev === "warning" ? "bg-warning text-white" : "bg-primary text-white"
                : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                }`}
            >
              {sev === "all" ? `All (${lowStockItems.length})` : `${sev} (${sev === "critical" ? criticalCount : warningCount})`}
            </button>
          ))}
        </motion.div>

        <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((item, idx) => {
            const deficit = item.minStock - item.quantity;
            const isCritical = item.severity === "critical";

            return (
              <motion.div
                key={item.id}
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  hover
                  shadow="sm"
                  padding="none"
                  className={`border-l-4 ${isCritical ? "border-l-danger" : "border-l-warning"}`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isCritical ? "bg-danger/10" : "bg-warning/10"
                          }`}>
                          {isCritical ? (
                            <AlertCircle size={20} className="text-danger" />
                          ) : (
                            <AlertTriangle size={20} className="text-warning" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-text-primary truncate">{item.name}</h3>
                            <Badge variant={isCritical ? "danger" : "warning"} dot className="shrink-0">
                              {isCritical ? "Critical" : "Warning"}
                            </Badge>
                          </div>
                          <p className="text-sm text-text-secondary mt-0.5">{item.category} &middot; {item.supplier}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-text-secondary">Current</p>
                        <p className={`text-lg font-bold ${isCritical ? "text-danger" : "text-warning"}`}>
                          {item.quantity.toLocaleString()}
                        </p>
                        <p className="text-xs text-text-secondary">{item.unit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">Minimum</p>
                        <p className="text-lg font-bold text-text-primary">
                          {item.minStock.toLocaleString()}
                        </p>
                        <p className="text-xs text-text-secondary">{item.unit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">Deficit</p>
                        <p className="text-lg font-bold text-danger">
                          -{deficit.toLocaleString()}
                        </p>
                        <p className="text-xs text-text-secondary">{item.unit}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                      <p className="text-xs text-text-secondary">
                        Est. cost: <span className="font-medium text-text-primary">${(deficit * item.costPerUnit).toFixed(2)}</span>
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={ShoppingCart}
                        onClick={() => handleReorder(item)}
                      >
                        Reorder
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {alerts.length === 0 && (
          <motion.div variants={fadeIn}>
            <Card padding="lg" shadow="sm">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mb-4">
                  <Package size={32} className="text-success" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary">All Clear!</h3>
                <p className="text-sm text-text-secondary mt-1">No low stock items match the current filter.</p>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>

      <ReorderModal
        isOpen={reorderModal.open}
        item={reorderModal.item}
        onClose={() => setReorderModal({ open: false, item: null })}
        onSubmit={confirmReorder}
      />
    </div>
  );
}

function ReorderModal({ isOpen, item, onClose, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: { quantity: "", priority: "normal", notes: "" },
  });

  function handleClose() {
    reset();
    onClose();
  }

  function handleFormSubmit(data) {
    onSubmit({ ...data, itemName: item?.name });
    reset();
  }

  if (!item) return null;

  const deficit = item.minStock - item.quantity;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Reorder: ${item.name}`}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" icon={ShoppingCart} onClick={handleSubmit(handleFormSubmit)}>Place Reorder</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-3 bg-warning/10 rounded-xl">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle size={16} className="text-warning" />
            <span className="font-medium text-text-primary">Suggested reorder: {deficit} {item.unit}</span>
          </div>
          <p className="text-xs text-text-secondary mt-1">Current: {item.quantity} | Minimum: {item.minStock}</p>
        </div>

        <Input
          label="Reorder Quantity"
          type="number"
          placeholder={String(deficit)}
          helperText={`Minimum ${deficit} ${item.unit} needed to restore stock level`}
          error={errors.quantity?.message}
          {...register("quantity", { required: "Quantity is required", min: { value: 1, message: "Must be at least 1" } })}
        />

        <Select
          label="Priority"
          options={[
            { value: "urgent", label: "Urgent - Need within 24 hours" },
            { value: "high", label: "High - Need within 3 days" },
            { value: "normal", label: "Normal - Within a week" },
          ]}
          value="normal"
          onChange={(val) => { }}
        />

        <div>
          <label className="text-sm font-medium text-text-primary mb-1.5 block">Additional Notes</label>
          <textarea
            rows={3}
            placeholder="Any special instructions for this order..."
            className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            {...register("notes")}
          />
        </div>

        <div className="text-sm text-text-secondary">
          Supplier: <span className="font-medium text-text-primary">{item.supplier}</span>
        </div>
      </div>
    </Modal>
  );
}

export default LowStockAlerts;
