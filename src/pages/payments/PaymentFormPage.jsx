import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Banknote,
  CheckCircle,
  Calculator,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { useToast } from "../../components/ui/Toast";
import { COFFEE_GRADES, COFFEE_PRICE_PER_KG, PAYMENT_METHODS } from "../../utils/constants";
import { formatCurrency } from "../../utils/helpers";

const FARMER_OPTIONS = [
  { value: "Jean-Paul Habimana", label: "Jean-Paul Habimana" },
  { value: "Marie Claire Uwimana", label: "Marie Claire Uwimana" },
  { value: "Emmanuel Ndayisaba", label: "Emmanuel Ndayisaba" },
  { value: "Claudine Mukamana", label: "Claudine Mukamana" },
  { value: "Jean Mugabo", label: "Jean Mugabo" },
  { value: "Arsene Nshimiyimana", label: "Arsene Nshimiyimana" },
  { value: "Dative Uwera", label: "Dative Uwera" },
  { value: "Patrick Sindzi", label: "Patrick Sindzi" },
  { value: "Theogene Bigirimana", label: "Theogene Bigirimana" },
  { value: "Espérance Nyirarukundo", label: "Espérance Nyirarukundo" },
  { value: "Celestin Niyonzima", label: "Celestin Niyonzima" },
  { value: "Jacques Kwizera", label: "Jacques Kwizera" },
];

const GRADE_OPTIONS = COFFEE_GRADES.map((g) => ({
  value: g,
  label: `${g} - RWF ${COFFEE_PRICE_PER_KG[g] || 0}/kg`,
}));

const PAYMENT_METHOD_OPTIONS = PAYMENT_METHODS.map((m) => ({
  value: m,
  label: m,
}));

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function PaymentFormPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [successModal, setSuccessModal] = useState({ open: false, payment: null });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      farmer: null,
      grade: null,
      weight: "",
      paymentMethod: null,
      collectionRef: "",
      notes: "",
    },
  });

  const watchedFarmer = watch("farmer");
  const watchedGrade = watch("grade");
  const watchedWeight = watch("weight");

  const calculatedAmount = (Number(watchedWeight) || 0) * (COFFEE_PRICE_PER_KG[watchedGrade] || 0);

  function onSubmit(data) {
    const payment = {
      paymentNumber: `PAY-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      farmer: data.farmer,
      grade: data.grade,
      weight: Number(data.weight),
      pricePerKg: COFFEE_PRICE_PER_KG[data.grade] || 0,
      totalAmount: calculatedAmount,
      paymentMethod: data.paymentMethod,
      collectionRef: data.collectionRef,
      notes: data.notes,
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
    };
    console.log("Payment created:", payment);
    setSuccessModal({ open: true, payment });
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
            onClick={() => navigate("/payments")}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm font-medium mb-4 cursor-pointer"
          >
            <ArrowLeft size={18} />
            Back to Payments
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Banknote size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Farmer Payment</h1>
              <p className="text-gray-500 text-sm">Calculate and process farmer payments for coffee deliveries</p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <motion.div variants={fadeIn}>
            <Card padding="lg" shadow="md">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Farmer & Delivery Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Select Farmer"
                    options={FARMER_OPTIONS}
                    placeholder="Choose a farmer"
                    value={watch("farmer")}
                    onChange={(val) => setValue("farmer", val, { shouldValidate: true })}
                    searchable
                    error={errors.farmer?.message}
                  />
                  <Select
                    label="Coffee Grade"
                    options={GRADE_OPTIONS}
                    placeholder="Select grade"
                    value={watch("grade")}
                    onChange={(val) => setValue("grade", val, { shouldValidate: true })}
                    searchable
                    error={errors.grade?.message}
                  />
                  <Input
                    label="Weight (kg)"
                    type="number"
                    step="0.1"
                    placeholder="Enter weight in kg"
                    error={errors.weight?.message}
                    {...register("weight", {
                      required: "Weight is required",
                      min: { value: 0.1, message: "Weight must be greater than 0" },
                    })}
                  />
                  <Input
                    label="Collection Reference (Optional)"
                    placeholder="e.g., COL-2026-001"
                    {...register("collectionRef")}
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card padding="lg" shadow="md">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calculator size={18} className="text-primary" />
                  <h2 className="text-lg font-semibold text-gray-900">Payment Calculation</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Coffee Grade</span>
                    <span className="text-sm font-medium text-gray-900">{watchedGrade || "Not selected"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Price per kg</span>
                    <span className="text-sm font-medium text-gray-900">
                      {watchedGrade ? formatCurrency(COFFEE_PRICE_PER_KG[watchedGrade] || 0) : "RWF 0"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Weight</span>
                    <span className="text-sm font-medium text-gray-900">{watchedWeight || 0} kg</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-base font-bold text-gray-900">Total Amount</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(calculatedAmount)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card padding="lg" shadow="md">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Payment Method"
                    options={PAYMENT_METHOD_OPTIONS}
                    placeholder="Select method"
                    value={watch("paymentMethod")}
                    onChange={(val) => setValue("paymentMethod", val, { shouldValidate: true })}
                    error={errors.paymentMethod?.message}
                  />
                  <Input
                    label="Notes (Optional)"
                    placeholder="Additional notes for this payment"
                    {...register("notes")}
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={() => navigate("/payments")}>
                Cancel
              </Button>
              <Button type="submit" icon={Save} loading={isSubmitting}>
                Create Payment
              </Button>
            </div>
          </motion.div>
        </form>
      </motion.div>

      {successModal.open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => { setSuccessModal({ open: false, payment: null }); navigate("/payments"); }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-success" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Created!</h3>
              <p className="text-sm text-gray-500">Payment has been created and is pending approval.</p>
            </div>
            {successModal.payment && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment #</span>
                  <span className="font-semibold text-primary">{successModal.payment.paymentNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Farmer</span>
                  <span className="font-medium text-gray-900">{successModal.payment.farmer}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold text-primary">{formatCurrency(successModal.payment.totalAmount)}</span>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => { setSuccessModal({ open: false, payment: null }); navigate("/payments"); }}>
                Back to Payments
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
