import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  Filter,
  Calendar,
  Package,
  User,
  FileText,
  X,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import SearchInput from "../../components/ui/SearchInput";
import DataTable from "../../components/ui/DataTable";
import { useToast } from "../../components/ui/Toast";

const ITEM_OPTIONS = [
  { value: "green-coffee", label: "Green Coffee Beans (Premium)" },
  { value: "standard-coffee", label: "Green Coffee Beans (Standard)" },
  { value: "arabica-coffee", label: "Arabica Coffee Beans" },
  { value: "sugar", label: "Sugar (Granulated)" },
  { value: "cinnamon", label: "Cinnamon (Ceylon)" },
  { value: "cardamom", label: "Cardamom Pods" },
  { value: "filter-bags", label: "Sample Bags" },
  { value: "cardboard-boxes", label: "Packaging Boxes (Medium)" },
  { value: "detergent", label: "Food-Grade Detergent" },
  { value: "diesel", label: "Diesel Fuel" },
  { value: "propane", label: "Propane Gas" },
  { value: "honey", label: "Honey (Natural)" },
  { value: "milk-powder", label: "Milk Powder" },
  { value: "labels", label: "Sticker Labels" },
];

const MOVEMENT_TYPES = [
  { value: "all", label: "All Types" },
  { value: "in", label: "Stock In" },
  { value: "out", label: "Stock Out" },
];

const MOCK_MOVEMENTS = [
  { id: 1, date: "2026-07-13", item: "Green Coffee Beans (Premium)", type: "in", quantity: 500, unit: "kg", reference: "PO-2026-0412", reason: "Supplier delivery from Highland Coffee Estates", handledBy: "James Mwangi" },
  { id: 2, date: "2026-07-13", item: "Sugar (Granulated)", type: "in", quantity: 300, unit: "kg", reference: "PO-2026-0413", reason: "Monthly restock order", handledBy: "James Mwangi" },
  { id: 3, date: "2026-07-13", item: "Sample Bags", type: "out", quantity: 2000, unit: "pieces", reference: "PROD-2026-0891", reason: "Production run #891 - Green Coffee Blend", handledBy: "Sarah Odhiambo" },
  { id: 4, date: "2026-07-13", item: "Packaging Boxes (Medium)", type: "out", quantity: 150, unit: "pieces", reference: "PROD-2026-0891", reason: "Packaging for Green Coffee Blend batch", handledBy: "Sarah Odhiambo" },
  { id: 5, date: "2026-07-12", item: "Green Coffee Beans (Standard)", type: "out", quantity: 250, unit: "kg", reference: "PROD-2026-0890", reason: "Production run #890 - Classic Green Coffee", handledBy: "Peter Kamau" },
  { id: 6, date: "2026-07-12", item: "Diesel Fuel", type: "in", quantity: 200, unit: "liters", reference: "FUEL-2026-0089", reason: "Monthly fuel delivery", handledBy: "John Kiprop" },
  { id: 7, date: "2026-07-12", item: "Diesel Fuel", type: "out", quantity: 75, unit: "liters", reference: "FUEL-2026-0090", reason: "Generator operations - Week 28", handledBy: "John Kiprop" },
  { id: 8, date: "2026-07-12", item: "Cinnamon (Ceylon)", type: "out", quantity: 25, unit: "kg", reference: "PROD-2026-0889", reason: "Spiced Coffee blend production", handledBy: "Peter Kamau" },
  { id: 9, date: "2026-07-11", item: "Arabica Coffee Beans", type: "in", quantity: 100, unit: "kg", reference: "PO-2026-0410", reason: "Specialty order from Mountain View Estate", handledBy: "James Mwangi" },
  { id: 10, date: "2026-07-11", item: "Honey (Natural)", type: "in", quantity: 50, unit: "liters", reference: "PO-2026-0411", reason: "Restocking natural honey supply", handledBy: "James Mwangi" },
  { id: 11, date: "2026-07-11", item: "Sticker Labels", type: "out", quantity: 800, unit: "pieces", reference: "PROD-2026-0888", reason: "Product labeling - Premium line", handledBy: "Sarah Odhiambo" },
  { id: 12, date: "2026-07-11", item: "Food-Grade Detergent", type: "out", quantity: 5, unit: "liters", reference: "MAINT-2026-0234", reason: "Equipment cleaning - Processing line B", handledBy: "John Kiprop" },
  { id: 13, date: "2026-07-10", item: "Propane Gas", type: "in", quantity: 80, unit: "liters", reference: "FUEL-2026-0088", reason: "Gas cylinder refill", handledBy: "John Kiprop" },
  { id: 14, date: "2026-07-10", item: "Cardamom Pods", type: "in", quantity: 30, unit: "kg", reference: "PO-2026-0408", reason: "Spice order from Spice Islands", handledBy: "James Mwangi" },
  { id: 15, date: "2026-07-10", item: "Milk Powder", type: "out", quantity: 40, unit: "kg", reference: "PROD-2026-0887", reason: "Coffee with milk production run", handledBy: "Peter Kamau" },
  { id: 16, date: "2026-07-09", item: "Green Coffee Beans (Premium)", type: "out", quantity: 350, unit: "kg", reference: "PROD-2026-0886", reason: "Premium Green Coffee production batch", handledBy: "Sarah Odhiambo" },
  { id: 17, date: "2026-07-09", item: "pH Testing Strips", type: "in", quantity: 100, unit: "pieces", reference: "LAB-2026-0045", reason: "Lab supplies restocking", handledBy: "James Mwangi" },
];

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const staggerContainer = { visible: { transition: { staggerChildren: 0.05 } } };

function StockMovementPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [inModalOpen, setInModalOpen] = useState(false);
  const [outModalOpen, setOutModalOpen] = useState(false);

  const filteredMovements = useMemo(() => {
    let items = MOCK_MOVEMENTS;
    if (activeTab !== "all") {
      items = items.filter((m) => m.type === activeTab);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (m) =>
          m.item.toLowerCase().includes(q) ||
          m.reference.toLowerCase().includes(q) ||
          m.handledBy.toLowerCase().includes(q)
      );
    }
    if (dateFilter) {
      items = items.filter((m) => m.date === dateFilter);
    }
    return items;
  }, [activeTab, search, dateFilter]);

  const stats = useMemo(() => {
    const totalIn = MOCK_MOVEMENTS.filter((m) => m.type === "in").length;
    const totalOut = MOCK_MOVEMENTS.filter((m) => m.type === "out").length;
    return { totalIn, totalOut, total: MOCK_MOVEMENTS.length };
  }, []);

  function handleRecordIn(data) {
    console.log("Stock In:", data);
    toast.success("Stock in recorded successfully!");
    setInModalOpen(false);
  }

  function handleRecordOut(data) {
    console.log("Stock Out:", data);
    toast.success("Stock out recorded successfully!");
    setOutModalOpen(false);
  }

  const columns = [
    {
      header: "Date",
      accessor: "date",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-text-secondary" />
          <span>{row.date}</span>
        </div>
      ),
    },
    {
      header: "Item",
      accessor: "item",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Package size={14} className="text-text-secondary" />
          <span className="font-medium">{row.item}</span>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: "type",
      render: (row) => (
        <Badge variant={row.type === "in" ? "success" : "danger"} dot>
          {row.type === "in" ? "Stock In" : "Stock Out"}
        </Badge>
      ),
    },
    {
      header: "Quantity",
      accessor: "quantity",
      render: (row) => (
        <span className="font-medium">
          {row.type === "in" ? "+" : "-"}{row.quantity.toLocaleString()} {row.unit}
        </span>
      ),
    },
    {
      header: "Reference",
      accessor: "reference",
      render: (row) => (
        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{row.reference}</span>
      ),
    },
    {
      header: "Reason",
      accessor: "reason",
      render: (row) => (
        <p className="text-sm text-text-secondary max-w-[200px] truncate">{row.reason}</p>
      ),
    },
    {
      header: "Handled By",
      accessor: "handledBy",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <User size={14} className="text-text-secondary" />
          <span>{row.handledBy}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-bg p-4 md:p-8">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Stock Movements</h1>
            <p className="text-text-secondary mt-1">Track all stock in and stock out operations</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" icon={ArrowDownCircle} onClick={() => setInModalOpen(true)}>
              Record Stock In
            </Button>
            <Button variant="danger" icon={ArrowUpCircle} onClick={() => setOutModalOpen(true)}>
              Record Stock Out
            </Button>
          </div>
        </motion.div>

        <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card hover shadow="sm" padding="md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ArrowLeftRight size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Total Movements</p>
                <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
              </div>
            </div>
          </Card>
          <Card hover shadow="sm" padding="md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <ArrowDownCircle size={24} className="text-success" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Stock In</p>
                <p className="text-2xl font-bold text-success">{stats.totalIn}</p>
              </div>
            </div>
          </Card>
          <Card hover shadow="sm" padding="md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-danger/10 flex items-center justify-center">
                <ArrowUpCircle size={24} className="text-danger" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Stock Out</p>
                <p className="text-2xl font-bold text-danger">{stats.totalOut}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card padding="none" shadow="md">
            <div className="px-6 py-4 border-b border-border">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search items, references..."
                  className="flex-1 md:max-w-sm"
                />
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    {[
                      { key: "all", label: "All" },
                      { key: "in", label: "Stock In" },
                      { key: "out", label: "Stock Out" },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                          activeTab === tab.key
                            ? "bg-white shadow-sm text-primary"
                            : "text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-auto"
                  />
                  {dateFilter && (
                    <button
                      onClick={() => setDateFilter("")}
                      className="p-1.5 rounded-lg text-text-secondary hover:bg-gray-100 hover:text-text-primary transition-colors cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <DataTable columns={columns} data={filteredMovements} pageSize={10} />
          </Card>
        </motion.div>
      </motion.div>

      <StockInModal isOpen={inModalOpen} onClose={() => setInModalOpen(false)} onSubmit={handleRecordIn} />
      <StockOutModal isOpen={outModalOpen} onClose={() => setOutModalOpen(false)} onSubmit={handleRecordOut} />
    </div>
  );
}

function StockInModal({ isOpen, onClose, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: { item: null, quantity: "", reference: "", reason: "", date: new Date().toISOString().split("T")[0] },
  });

  const selectedItem = watch("item");

  function handleClose() {
    reset();
    onClose();
  }

  function handleFormSubmit(data) {
    onSubmit(data);
    reset();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Record Stock In"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button variant="secondary" icon={ArrowDownCircle} onClick={handleSubmit(handleFormSubmit)}>Record Stock In</Button>
        </>
      }
    >
      <form className="space-y-4">
        <Select
          label="Select Item"
          options={ITEM_OPTIONS}
          placeholder="Choose an item"
          value={selectedItem}
          onChange={(val) => setValue("item", val, { shouldValidate: true })}
          searchable
          error={errors.item?.message}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Quantity"
            type="number"
            placeholder="0"
            error={errors.quantity?.message}
            {...register("quantity", { required: "Quantity is required", min: { value: 1, message: "Must be at least 1" } })}
          />
          <Input
            label="Date"
            type="date"
            error={errors.date?.message}
            {...register("date", { required: "Date is required" })}
          />
        </div>
        <Input
          label="Reference Number"
          placeholder="e.g. PO-2026-0414"
          error={errors.reference?.message}
          {...register("reference", { required: "Reference number is required" })}
        />
        <div>
          <label className="text-sm font-medium text-text-primary mb-1.5 block">Reason / Notes</label>
          <textarea
            rows={3}
            placeholder="Reason for stock in..."
            className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none ${
              errors.reason ? "border-danger focus:ring-danger/30" : "border-border"
            }`}
            {...register("reason", { required: "Reason is required" })}
          />
          {errors.reason && <p className="text-xs text-danger mt-1">{errors.reason.message}</p>}
        </div>
      </form>
    </Modal>
  );
}

function StockOutModal({ isOpen, onClose, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: { item: null, quantity: "", reference: "", reason: "", date: new Date().toISOString().split("T")[0] },
  });

  const selectedItem = watch("item");

  function handleClose() {
    reset();
    onClose();
  }

  function handleFormSubmit(data) {
    onSubmit(data);
    reset();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Record Stock Out"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button variant="danger" icon={ArrowUpCircle} onClick={handleSubmit(handleFormSubmit)}>Record Stock Out</Button>
        </>
      }
    >
      <form className="space-y-4">
        <Select
          label="Select Item"
          options={ITEM_OPTIONS}
          placeholder="Choose an item"
          value={selectedItem}
          onChange={(val) => setValue("item", val, { shouldValidate: true })}
          searchable
          error={errors.item?.message}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Quantity"
            type="number"
            placeholder="0"
            error={errors.quantity?.message}
            {...register("quantity", { required: "Quantity is required", min: { value: 1, message: "Must be at least 1" } })}
          />
          <Input
            label="Date"
            type="date"
            error={errors.date?.message}
            {...register("date", { required: "Date is required" })}
          />
        </div>
        <Input
          label="Reference Number"
          placeholder="e.g. PROD-2026-0892"
          error={errors.reference?.message}
          {...register("reference", { required: "Reference number is required" })}
        />
        <div>
          <label className="text-sm font-medium text-text-primary mb-1.5 block">Reason / Notes</label>
          <textarea
            rows={3}
            placeholder="Reason for stock out..."
            className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none ${
              errors.reason ? "border-danger focus:ring-danger/30" : "border-border"
            }`}
            {...register("reason", { required: "Reason is required" })}
          />
          {errors.reason && <p className="text-xs text-danger mt-1">{errors.reason.message}</p>}
        </div>
      </form>
    </Modal>
  );
}

export default StockMovementPage;
