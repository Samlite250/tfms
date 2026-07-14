import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Save,
  ShoppingCart,
  Plus,
  Trash2,
  CheckCircle,
  FileText,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";

const CUSTOMER_OPTIONS = [
  { value: "Emerald Tea Traders", label: "Emerald Tea Traders" },
  { value: "Green Valley Imports", label: "Green Valley Imports" },
  { value: "Pacific Rim Beverages", label: "Pacific Rim Beverages" },
  { value: "Highland Exports Ltd.", label: "Highland Exports Ltd." },
  { value: "Oriental Tea House", label: "Oriental Tea House" },
  { value: "Zenith Beverages Co.", label: "Zenith Beverages Co." },
  { value: "Sunrise Trading", label: "Sunrise Trading" },
  { value: "Mountain Dew Distributors", label: "Mountain Dew Distributors" },
  { value: "Royal Tea Merchants", label: "Royal Tea Merchants" },
  { value: "Global Leaf Co.", label: "Global Leaf Co." },
  { value: "Aroma Tea International", label: "Aroma Tea International" },
  { value: "Herbal Harmony Ltd.", label: "Herbal Harmony Ltd." },
  { value: "Leaf & Cup Co.", label: "Leaf & Cup Co." },
  { value: "Misty Morning Imports", label: "Misty Morning Imports" },
  { value: "Silk Road Tea Co.", label: "Silk Road Tea Co." },
];

const TEA_GRADE_OPTIONS = [
  { value: "OP1", label: "OP1 - Orange Pekoe 1" },
  { value: "OPA", label: "OPA - Orange Pekoe A" },
  { value: "OPB", label: "OPB - Orange Pekoe B" },
  { value: "OPC", label: "OPC - Orange Pekoe C" },
  { value: "BOP1", label: "BOP1 - Broken Orange Pekoe 1" },
  { value: "BOP", label: "BOP - Broken Orange Pekoe" },
  { value: "BOPF", label: "BOPF - Broken Orange Pekoe Fannings" },
  { value: "BPS1", label: "BPS1 - Broken Pekoe Souchong 1" },
  { value: "PF1", label: "PF1 - Pekoe Fannings 1" },
  { value: "PD1", label: "PD1 - Pekoe Dust 1" },
  { value: "D1", label: "D1 - Dust 1" },
  { value: "D2", label: "D2 - Dust 2" },
  { value: "Green Tea Premium", label: "Green Tea Premium" },
  { value: "Green Tea Standard", label: "Green Tea Standard" },
  { value: "Oolong", label: "Oolong" },
  { value: "White Tea", label: "White Tea" },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: "Cash", label: "Cash" },
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "Mobile Money", label: "Mobile Money" },
];

function generateInvoiceNumber() {
  const num = String(Math.floor(Math.random() * 9000) + 1000);
  return `INV-2026-${num}`;
}

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

function SalesFormPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [successModal, setSuccessModal] = useState({ open: false, invoice: null });
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [customers, setCustomers] = useState(CUSTOMER_OPTIONS);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      customer: null,
      items: [{ grade: null, quantity: "", unitPrice: "" }],
      paymentMethod: null,
      dueDate: "",
      notes: "",
      discount: "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items");
  const watchedDiscount = watch("discount");

  function addCustomer() {
    if (newCustomerName.trim()) {
      const opt = { value: newCustomerName.trim(), label: newCustomerName.trim() };
      setCustomers((prev) => [...prev, opt]);
      setValue("customer", opt.value, { shouldValidate: true });
      setNewCustomerName("");
      setShowNewCustomer(false);
    }
  }

  const subtotal = (watchedItems || []).reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const tax = subtotal * 0.16;
  const discount = Number(watchedDiscount) || 0;
  const grandTotal = subtotal + tax - discount;

  function onSubmit(data) {
    const invoiceNo = generateInvoiceNumber();
    const invoice = {
      invoiceNo,
      customer: data.customer,
      items: data.items.map((item) => ({
        ...item,
        total: Number(item.quantity) * Number(item.unitPrice),
      })),
      subtotal,
      tax,
      discount,
      grandTotal,
      paymentMethod: data.paymentMethod,
      dueDate: data.dueDate,
      notes: data.notes,
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
    };
    console.log("Sale saved:", invoice);
    setSuccessModal({ open: true, invoice });
  }

  return (
    <div className="min-h-screen bg-bg p-4 md:p-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <motion.div variants={fadeIn}>
          <button
            onClick={() => navigate("/sales")}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm font-medium mb-4 cursor-pointer"
          >
            <ArrowLeft size={18} />
            Back to Sales
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShoppingCart size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Create New Sale</h1>
              <p className="text-text-secondary text-sm">Fill in the details to create a new sales invoice</p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <motion.div variants={fadeIn}>
            <Card padding="lg" shadow="md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-text-primary">Customer Information</h2>
                  <button
                    type="button"
                    onClick={() => setShowNewCustomer(!showNewCustomer)}
                    className="text-sm text-primary hover:text-primary-dark font-medium transition-colors cursor-pointer"
                  >
                    {showNewCustomer ? "Select Existing" : "+ Add New Customer"}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {showNewCustomer ? (
                    <motion.div
                      key="new-customer"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex gap-3">
                        <Input
                          label="Customer Name"
                          placeholder="Enter new customer name"
                          value={newCustomerName}
                          onChange={(e) => setNewCustomerName(e.target.value)}
                          className="flex-1"
                        />
                        <div className="flex items-end">
                          <Button type="button" onClick={addCustomer} size="md">
                            Add
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="existing-customer"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <Select
                        label="Select Customer"
                        options={customers}
                        placeholder="Choose a customer"
                        value={watch("customer")}
                        onChange={(val) => setValue("customer", val, { shouldValidate: true })}
                        searchable
                        error={errors.customer?.message}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card padding="lg" shadow="md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-text-primary">Sale Items</h2>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={Plus}
                    onClick={() => append({ grade: null, quantity: "", unitPrice: "" })}
                  >
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="hidden md:grid md:grid-cols-12 gap-3 px-1">
                    <div className="col-span-4">
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Tea Grade</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Quantity (kg)</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Unit Price ($)</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Line Total</span>
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Action</span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {fields.map((field, index) => {
                      const qty = Number(watchedItems?.[index]?.quantity) || 0;
                      const price = Number(watchedItems?.[index]?.unitPrice) || 0;
                      const lineTotal = qty * price;

                      return (
                        <motion.div
                          key={field.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20, height: 0 }}
                          className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start p-3 bg-gray-50 rounded-xl"
                        >
                          <div className="md:col-span-4">
                            <Select
                              options={TEA_GRADE_OPTIONS}
                              placeholder="Select grade"
                              value={watch(`items.${index}.grade`)}
                              onChange={(val) => setValue(`items.${index}.grade`, val)}
                              searchable
                              error={errors.items?.[index]?.grade?.message}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Input
                              type="number"
                              placeholder="0"
                              error={errors.items?.[index]?.quantity?.message}
                              {...register(`items.${index}.quantity`, {
                                required: "Required",
                                min: { value: 1, message: "Min 1" },
                              })}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              error={errors.items?.[index]?.unitPrice?.message}
                              {...register(`items.${index}.unitPrice`, {
                                required: "Required",
                                min: { value: 0.01, message: "Min 0.01" },
                              })}
                            />
                          </div>
                          <div className="md:col-span-2 flex items-center h-[42px]">
                            <span className="text-sm font-semibold text-text-primary">
                              ${lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="md:col-span-2 flex justify-end">
                            {fields.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="p-2 rounded-lg text-text-secondary hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {errors.items && (
                  <p className="text-xs text-danger">At least one item is required</p>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card padding="lg" shadow="md">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-text-primary">Payment Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Payment Method"
                    options={PAYMENT_METHOD_OPTIONS}
                    placeholder="Select method"
                    value={watch("paymentMethod")}
                    onChange={(val) => setValue("paymentMethod", val, { shouldValidate: true })}
                    error={errors.paymentMethod?.message}
                  />
                  <Input
                    label="Due Date"
                    type="date"
                    error={errors.dueDate?.message}
                    {...register("dueDate", { required: "Due date is required" })}
                  />
                  <Input
                    label="Discount ($)"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("discount", { min: { value: 0, message: "Must be 0 or greater" } })}
                  />
                </div>
                <div>
                  <Input
                    label="Notes"
                    placeholder="Optional notes for this sale..."
                    {...register("notes")}
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card padding="lg" shadow="md">
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-text-primary">Order Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-border/60">
                    <span className="text-sm text-text-secondary">Subtotal</span>
                    <span className="text-sm font-semibold text-text-primary">
                      ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/60">
                    <span className="text-sm text-text-secondary">Tax (16%)</span>
                    <span className="text-sm font-semibold text-text-primary">
                      ${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between py-2 border-b border-border/60">
                      <span className="text-sm text-text-secondary">Discount</span>
                      <span className="text-sm font-semibold text-danger">
                        -${discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-3">
                    <span className="text-base font-bold text-text-primary">Grand Total</span>
                    <span className="text-xl font-bold text-primary">
                      ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={() => navigate("/sales")}>
                Cancel
              </Button>
              <Button type="submit" icon={Save} loading={isSubmitting}>
                Save & Generate Invoice
              </Button>
            </div>
          </motion.div>
        </form>
      </motion.div>

      <Modal
        isOpen={successModal.open}
        onClose={() => {
          setSuccessModal({ open: false, invoice: null });
          navigate("/sales");
        }}
        title="Invoice Created"
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setSuccessModal({ open: false, invoice: null });
                navigate("/sales");
              }}
            >
              Back to Sales
            </Button>
            <Button
              icon={Eye}
              onClick={() => {
                setSuccessModal({ open: false, invoice: null });
                navigate("/sales/1");
              }}
            >
              View Invoice
            </Button>
          </>
        }
      >
        {successModal.invoice && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-success" />
              </div>
              <p className="text-text-primary font-medium">
                Invoice has been successfully created!
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={18} className="text-primary" />
                <h3 className="font-semibold text-text-primary">Invoice Preview</h3>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Invoice Number</span>
                <span className="font-semibold text-primary">{successModal.invoice.invoiceNo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Customer</span>
                <span className="font-medium text-text-primary">{successModal.invoice.customer}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Date</span>
                <span className="text-text-primary">{successModal.invoice.date}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Items</span>
                <span className="text-text-primary">{successModal.invoice.items.length} item{successModal.invoice.items.length > 1 ? "s" : ""}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="text-sm font-bold text-text-primary">Grand Total</span>
                <span className="text-lg font-bold text-primary">
                  ${successModal.invoice.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default SalesFormPage;
