import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Save,
  X,
  Receipt,
  Tag,
  FileText,
  DollarSign,
  Calendar,
  CreditCard,
  Store,
  Hash,
  StickyNote,
  Upload,
  File,
  ImageIcon,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { useToast } from "../../components/ui/Toast";

const CATEGORY_OPTIONS = [
  { value: "Electricity", label: "Electricity" },
  { value: "Fuel", label: "Fuel" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Transport", label: "Transport" },
  { value: "Water", label: "Water" },
  { value: "Salaries", label: "Salaries" },
  { value: "Other", label: "Other" },
];

const PAYMENT_OPTIONS = [
  { value: "Cash", label: "Cash" },
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "Check", label: "Check" },
  { value: "Mobile Money", label: "Mobile Money" },
];

const VENDOR_OPTIONS = [
  { value: "Ceylon Electricity Board", label: "Ceylon Electricity Board" },
  { value: "Lanka Petroleum Corp", label: "Lanka Petroleum Corp" },
  { value: "ABC Engineering", label: "ABC Engineering" },
  { value: "QuickFix Maintenance", label: "QuickFix Maintenance" },
  { value: "GreenTrans Logistics", label: "GreenTrans Logistics" },
  { value: "National Water Board", label: "National Water Board" },
  { value: "People's Bank", label: "People's Bank" },
  { value: "Dialog Mobile", label: "Dialog Mobile" },
  { value: "Hayleys Energy", label: "Hayleys Energy" },
  { value: "Sri Lanka Insurance", label: "Sri Lanka Insurance" },
  { value: "Other", label: "Other" },
];

const mockEditData = {
  category: "Electricity",
  description: "Monthly power bill - Factory",
  amount: "4250.00",
  date: "2026-07-10",
  paymentMethod: "Bank Transfer",
  vendor: "Ceylon Electricity Board",
  receiptNumber: "RCT-202607-0015",
  notes: "Approved by factory manager. Includes night shift surcharge.",
};

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon size={16} className="text-primary" />
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
    </div>
  );
}

export default function ExpenseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success } = useToast();
  const isEdit = Boolean(id);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm({
    defaultValues: isEdit
      ? mockEditData
      : {
          category: "",
          description: "",
          amount: "",
          date: new Date().toISOString().split("T")[0],
          paymentMethod: "",
          vendor: "",
          receiptNumber: "",
          notes: "",
        },
  });

  const categoryValue = watch("category");
  const paymentValue = watch("paymentMethod");
  const vendorValue = watch("vendor");

  function onSubmit() {
    success(isEdit ? "Expense updated successfully" : "Expense recorded successfully");
    navigate("/expenses");
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          to="/expenses"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-4 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to Expenses
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? "Edit Expense" : "Record New Expense"}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEdit ? "Update expense details below" : "Fill in the details to record a new expense"}
        </p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <SectionHeader icon={Tag} title="Expense Details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Category"
                placeholder="Select category"
                options={CATEGORY_OPTIONS}
                value={categoryValue}
                onChange={(val) => setValue("category", val)}
                error={errors.category?.message}
              />
              <Input
                label="Amount ($)"
                placeholder="0.00"
                type="number"
                step="0.01"
                icon={DollarSign}
                error={errors.amount?.message}
                {...register("amount", {
                  required: "Amount is required",
                  min: { value: 0.01, message: "Amount must be greater than 0" },
                })}
              />
              <Input
                label="Description"
                placeholder="Brief description of the expense"
                icon={FileText}
                error={errors.description?.message}
                {...register("description", { required: "Description is required" })}
                className="sm:col-span-2"
              />
              <Input
                label="Date"
                type="date"
                icon={Calendar}
                error={errors.date?.message}
                {...register("date", { required: "Date is required" })}
              />
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <SectionHeader icon={CreditCard} title="Payment Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Payment Method"
                placeholder="Select payment method"
                options={PAYMENT_OPTIONS}
                value={paymentValue}
                onChange={(val) => setValue("paymentMethod", val)}
                error={errors.paymentMethod?.message}
              />
              <Select
                label="Vendor / Supplier"
                placeholder="Select vendor"
                options={VENDOR_OPTIONS}
                value={vendorValue}
                onChange={(val) => setValue("vendor", val)}
                error={errors.vendor?.message}
                searchable
              />
              <Input
                label="Receipt Number (Optional)"
                placeholder="e.g. RCT-202607-0001"
                icon={Hash}
                {...register("receiptNumber")}
              />
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <SectionHeader icon={StickyNote} title="Additional Notes" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Notes (Optional)</label>
              <textarea
                placeholder="Any additional notes or comments..."
                rows={3}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                {...register("notes")}
              />
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <SectionHeader icon={Upload} title="Attach Receipt" />
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <ImageIcon size={24} className="text-primary" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PDF, JPG, PNG up to 10MB
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <File size={14} className="text-gray-400" />
                <span className="text-xs text-gray-400">No file selected</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-end gap-3 pb-6"
        >
          <Link to="/expenses">
            <Button variant="ghost" icon={X}>Cancel</Button>
          </Link>
          <Button type="submit" icon={Save} loading={isSubmitting}>
            {isEdit ? "Update Expense" : "Record Expense"}
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
