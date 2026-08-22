import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Save,
  RotateCcw,
  CheckCircle,
  Leaf,
  FileText,
  User,
  Building2,
  Coffee,
  DollarSign,
  Mail,
  UserCheck,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import { useAuth } from "../../contexts/AuthContext";
import { ROLES } from "../../utils/constants";
import { notifyCoffeeReceived } from "../../services/notificationService";
import { useRealtimeCollection } from "../../hooks/useRealtimeCollection";
import { farmersSeed, collectionsSeed } from "../../firebase/seedData";

const COFFEE_GRADES = ["AA", "AB", "PB", "C", "TT"];

const GRADE_PRICES = {
  AA: 1200,
  AB: 1000,
  PB: 1100,
  C: 800,
  TT: 700,
};

const collectionCenters = [
  { value: "mahembe-cc", label: "Mahembe Central Collection Center" },
  { value: "muhanga-cc", label: "Muhanga Collection Center" },
  { value: "ruyanza-cc", label: "Ruyanza Collection Center" },
  { value: "kabuga-cc", label: "Kabuga Collection Center" },
  { value: "nyamagana-cc", label: "Nyamagana Collection Center" },
];

function generateReceiptNumber() {
  const now = new Date();
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `REC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${seq}`;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, type: "spring", damping: 20, stiffness: 200 },
  }),
};

function CollectionFormPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const isFarmer = userProfile?.role === ROLES.FARMER;

  const [receiptNumber] = useState(generateReceiptNumber);
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedRecord, setSavedRecord] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  const { data: farmers } = useRealtimeCollection("farmers", farmersSeed);
  const { addItem: addCollection } = useRealtimeCollection("coffeeCollections", collectionsSeed);

  const farmerOptions = useMemo(() => {
    return (farmers || []).map((f) => ({
      value: f.id,
      label: `${f.name} — ${f.phone || f.id}`,
    }));
  }, [farmers]);

  const gradeOptions = useMemo(() => {
    return COFFEE_GRADES.map((g) => ({
      value: g,
      label: `${g} — RWF ${(GRADE_PRICES[g] || 0).toLocaleString()}/kg`,
    }));
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      farmerId: isFarmer ? (userProfile?.uid || userProfile?.id || userProfile?.email || "FRM-LOGGED-IN") : "",
      center: "mahembe-cc",
      weight: "",
      grade: "AA",
      qualityNotes: "",
      pricePerKg: 1200,
    },
  });

  useEffect(() => {
    if (isFarmer) {
      setValue("farmerId", userProfile?.uid || userProfile?.id || userProfile?.email || "FRM-LOGGED-IN");
    }
  }, [isFarmer, userProfile, setValue]);

  const selectedGrade = watch("grade") || "AA";
  const weight = watch("weight");
  const pricePerKg = watch("pricePerKg") || 1200;

  const autoPrice = selectedGrade ? (GRADE_PRICES[selectedGrade] || 1200) : 1200;

  const totalAmount = useMemo(() => {
    const w = parseFloat(weight) || 0;
    const p = parseFloat(pricePerKg) || autoPrice;
    return Math.round(w * p * 100) / 100;
  }, [weight, pricePerKg, autoPrice]);

  const selectedFarmer = isFarmer
    ? {
      name: userProfile?.displayName || userProfile?.email?.split("@")[0] || "Farmer Submitter",
      phone: userProfile?.phone || "+250 780 000 000",
      email: userProfile?.email || "farmer@mahembe.rw",
    }
    : (farmers || []).find((f) => f.id === watch("farmerId"));

  function onGradeChange(e) {
    const grade = e.target.value || "AA";
    setValue("grade", grade, { shouldValidate: true });
    if (grade && GRADE_PRICES[grade]) {
      setValue("pricePerKg", GRADE_PRICES[grade], { shouldValidate: true });
    }
  }

  async function onSubmit(data) {
    let farmerName = "";
    let farmerPhone = "";
    let farmerEmail = "";
    let farmerId = data.farmerId;

    if (isFarmer) {
      farmerName = userProfile?.displayName || userProfile?.email?.split("@")[0] || "Farmer Submitter";
      farmerPhone = userProfile?.phone || "";
      farmerEmail = userProfile?.email || "";
      farmerId = userProfile?.uid || userProfile?.id || userProfile?.email || "FRM-LOGGED-IN";
    } else {
      const farmer = (farmers || []).find((f) => f.id === data.farmerId);
      farmerName = farmer?.name || "Unknown Farmer";
      farmerPhone = farmer?.phone || "";
      farmerEmail = farmer?.email || "";
    }

    const centerObj = collectionCenters.find((c) => c.value === data.center);
    const finalGrade = data.grade || selectedGrade || "AA";
    const finalPricePerKg = parseFloat(data.pricePerKg) || autoPrice || 1200;
    const finalWeight = parseFloat(data.weight) || 0;
    const computedTotal = Math.round(finalWeight * finalPricePerKg * 100) / 100;

    const record = {
      id: `COL-${Date.now()}`,
      receiptNumber,
      date: data.date || new Date().toISOString().split("T")[0],
      farmer: farmerName,
      farmerName,
      farmerId,
      farmerPhone,
      farmerEmail,
      center: centerObj?.label || data.center || "Mahembe Central Collection Center",
      weight: finalWeight,
      quantity: finalWeight,
      grade: finalGrade,
      pricePerKg: finalPricePerKg,
      price: finalPricePerKg,
      amount: computedTotal,
      totalAmount: computedTotal,
      total: computedTotal,
      qualityNotes: data.qualityNotes || "",
      collectedBy: isFarmer ? `Farmer (${farmerName})` : "Collection Officer",
      status: "Received",
      processingStage: "Received",
      createdAt: new Date().toISOString(),
    };

    // Add to real-time storage
    await addCollection(record);

    setSavedRecord(record);
    setShowSuccess(true);

    // Send email & SMS notifications to farmer
    try {
      await notifyCoffeeReceived({
        farmerId,
        farmerName,
        farmerEmail,
        farmerPhone,
        weight: finalWeight,
        grade: finalGrade,
        center: centerObj?.label || data.center || "Mahembe Central Collection Center",
        receiptNumber,
        pricePerKg: finalPricePerKg,
        totalPrice: computedTotal,
      });
      setEmailSent(true);
    } catch (err) {
      console.warn("Notification dispatch failed:", err);
      setEmailSent(false);
    }
  }

  function handleRecordAnother() {
    setShowSuccess(false);
    setSavedRecord(null);
    setEmailSent(false);
    reset({
      date: new Date().toISOString().split("T")[0],
      farmerId: isFarmer ? (userProfile?.uid || userProfile?.id || userProfile?.email || "FRM-LOGGED-IN") : "",
      center: "mahembe-cc",
      weight: "",
      grade: "AA",
      qualityNotes: "",
      pricePerKg: 1200,
    });
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-bg">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => navigate(isFarmer ? "/my-collections" : "/collections")}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft size={16} />
          {isFarmer ? "Back to My Deliveries" : "Back to Collection List"}
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Leaf size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isFarmer ? "Deliver Coffee Cherries" : "Record New Collection"}
            </h1>
            <p className="text-sm text-gray-500">
              {isFarmer
                ? "Submit harvest delivery record directly to Mahembe Factory"
                : "Fill in the details for a new coffee collection"}
            </p>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl">
        <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible" className="mb-6">
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <FileText size={18} className="text-primary" />
              <h2 className="text-base font-semibold text-gray-900">Collection Details</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Collection Date"
                type="date"
                {...register("date", { required: "Date is required" })}
                error={errors.date?.message}
              />
              <Input
                label="Receipt Number"
                value={receiptNumber}
                readOnly
                helperText="Auto-generated receipt number"
                className="[&>div>input]:bg-gray-50 [&>div>input]:cursor-not-allowed"
              />
            </div>
          </Card>
        </motion.div>

        <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible" className="mb-6">
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <User size={18} className="text-primary" />
              <h2 className="text-base font-semibold text-gray-900">Submitter Farmer Information</h2>
            </div>

            {isFarmer ? (
              /* Simple auto-filled Submitter Card for logged-in Farmer */
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary text-white">
                    <UserCheck size={13} /> Submitter Details (Pre-filled)
                  </span>
                  <span className="text-xs text-gray-500">Authenticated Farmer</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-gray-500 block">Farmer Name</span>
                    <p className="font-bold text-gray-900">{selectedFarmer?.name}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Phone Number</span>
                    <p className="font-medium text-gray-900">{selectedFarmer?.phone || "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Email Address</span>
                    <p className="font-medium text-gray-900">{selectedFarmer?.email || "—"}</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Searchable dropdown for Admin/Manager */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Select
                  label="Select Farmer"
                  options={farmerOptions}
                  placeholder="Choose a farmer..."
                  searchable
                  value={watch("farmerId")}
                  onChange={(val) => setValue("farmerId", val, { shouldValidate: true })}
                  error={errors.farmerId?.message}
                  className="sm:col-span-2"
                />
                {selectedFarmer && (
                  <div className="sm:col-span-2 rounded-xl bg-gray-50 border border-gray-100 p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <p className="font-medium text-gray-900">{selectedFarmer.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <p className="font-medium text-gray-900">{selectedFarmer.phone}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <input type="hidden" {...register("farmerId")} />
          </Card>
        </motion.div>

        <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible" className="mb-6">
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <Building2 size={18} className="text-primary" />
              <h2 className="text-base font-semibold text-gray-900">Collection Center</h2>
            </div>
            <Select
              label="Collection Center"
              options={collectionCenters}
              placeholder="Select collection center..."
              searchable
              value={watch("center")}
              onChange={(val) => setValue("center", val, { shouldValidate: true })}
              error={errors.center?.message}
            />
          </Card>
        </motion.div>

        <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible" className="mb-6">
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <Coffee size={18} className="text-primary" />
              <h2 className="text-base font-semibold text-gray-900">Coffee Details</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Weight (kg) *"
                type="number"
                step="0.1"
                min="0.1"
                placeholder="e.g. 45.5"
                {...register("weight", {
                  required: "Weight in kg is required",
                  min: { value: 0.1, message: "Weight must be at least 0.1 kg" },
                })}
                error={errors.weight?.message}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Coffee Grade</label>
                <select
                  value={watch("grade") || "AA"}
                  onChange={onGradeChange}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
                >
                  {gradeOptions.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
                <input type="hidden" {...register("grade")} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Quality Notes</label>
                <textarea
                  {...register("qualityNotes")}
                  rows={3}
                  placeholder="Optional notes about coffee quality, moisture content, cherry appearance..."
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="visible" className="mb-8">
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <DollarSign size={18} className="text-primary" />
              <h2 className="text-base font-semibold text-gray-900">Pricing</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Input
                label="Price per kg (RWF)"
                type="number"
                step="0.01"
                min="0"
                {...register("pricePerKg")}
                error={errors.pricePerKg?.message}
                helperText={`Auto-set for ${selectedGrade}: RWF ${autoPrice.toLocaleString()}`}
              />
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Total Amount</label>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5">
                  <p className="text-2xl font-bold text-primary">
                    RWF {totalAmount.toLocaleString("en-RW", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Calculated automatically (read-only)</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div custom={5} variants={sectionVariants} initial="hidden" animate="visible">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => navigate(isFarmer ? "/my-collections" : "/collections")}
              className="sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              icon={RotateCcw}
              fullWidth
              onClick={handleRecordAnother}
              className="sm:order-2"
            >
              Save & Record Another
            </Button>
            <Button
              type="submit"
              icon={Save}
              fullWidth
              loading={isSubmitting}
              className="sm:order-3"
            >
              Save Coffee Delivery
            </Button>
          </div>
        </motion.div>
      </form>

      <Modal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Delivery Recorded Successfully"
        size="md"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="ghost" onClick={handleRecordAnother} className="flex-1">
              Record Another
            </Button>
            <Button
              fullWidth
              className="flex-1"
              onClick={() => {
                setShowSuccess(false);
                navigate(isFarmer ? "/my-collections" : "/collections");
              }}
            >
              View My Deliveries
            </Button>
          </div>
        }
      >
        {savedRecord && (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
              className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle size={32} className="text-primary" />
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Receipt Generated & Saved</h3>
            <p className="text-sm text-gray-500 mb-2">Delivery record saved & available in Factory Production.</p>
            {emailSent && (
              <div className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1 mb-4">
                <Mail size={12} />
                SMS & Email notification sent to submitter
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Receipt Number</span>
                <span className="font-mono font-semibold text-primary">{savedRecord.receiptNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Submitter Farmer</span>
                <span className="font-medium text-gray-900">{savedRecord.farmerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Weight</span>
                <span className="font-medium text-gray-900">{parseFloat(savedRecord.weight).toFixed(1)} kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Grade</span>
                <span className="font-medium text-gray-900">{savedRecord.grade}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Price per kg</span>
                <span className="font-medium text-gray-900">RWF {(parseFloat(savedRecord.pricePerKg) || autoPrice).toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="text-sm font-semibold text-gray-900">Total Amount</span>
                <span className="text-lg font-bold text-primary">
                  RWF {totalAmount.toLocaleString("en-RW", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default CollectionFormPage;
