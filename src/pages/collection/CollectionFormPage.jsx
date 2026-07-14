import { useState, useMemo } from "react";
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
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";

const TEA_GRADES = ["PF1", "PF2", "PF3", "PD", "Dust", "Fannings"];

const GRADE_PRICES = {
  PF1: 850,
  PF2: 750,
  PF3: 650,
  PD: 550,
  Dust: 480,
  Fannings: 520,
};

const farmers = [
  { id: "F001", name: "James Kamau", phone: "0712345678" },
  { id: "F002", name: "Grace Wanjiku", phone: "0723456789" },
  { id: "F003", name: "Peter Mwangi", phone: "0734567890" },
  { id: "F004", name: "Mary Njeri", phone: "0745678901" },
  { id: "F005", name: "John Ochieng", phone: "0756789012" },
  { id: "F006", name: "Sarah Akinyi", phone: "0767890123" },
  { id: "F007", name: "David Kipchoge", phone: "0778901234" },
  { id: "F008", name: "Faith Jepkorir", phone: "0789012345" },
  { id: "F009", name: "Robert Simiyu", phone: "0790123456" },
  { id: "F010", name: "Anne Chebet", phone: "0701234567" },
  { id: "F011", name: "Samuel Mutua", phone: "0712345670" },
  { id: "F012", name: "Lucy Wairimu", phone: "0723456780" },
];

const collectionCenters = [
  { value: "kericho-central", label: "Kericho Central Collection Center" },
  { value: "nandi-hills", label: "Nandi Hills Collection Center" },
  { value: "kisii-highlands", label: "Kisii Highlands Collection Center" },
  { value: "nyeri-mount-kenya", label: "Nyeri Mount Kenya Collection Center" },
  { value: "muranga-valley", label: "Murang'a Valley Collection Center" },
  { value: "kiambu-ridge", label: "Kiambu Ridge Collection Center" },
];

const farmerOptions = farmers.map((f) => ({
  value: f.id,
  label: `${f.name} — ${f.phone}`,
}));

const gradeOptions = TEA_GRADES.map((g) => ({
  value: g,
  label: `${g} — KES ${GRADE_PRICES[g].toLocaleString()}/kg`,
}));

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
  const [receiptNumber] = useState(generateReceiptNumber);
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedRecord, setSavedRecord] = useState(null);

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
      farmerId: "",
      center: "",
      weight: "",
      grade: "",
      qualityNotes: "",
      pricePerKg: "",
    },
  });

  const selectedGrade = watch("grade");
  const weight = watch("weight");
  const pricePerKg = watch("pricePerKg");

  const autoPrice = selectedGrade ? GRADE_PRICES[selectedGrade] : 0;

  const totalAmount = useMemo(() => {
    const w = parseFloat(weight) || 0;
    const p = parseFloat(pricePerKg) || autoPrice;
    return Math.round(w * p * 100) / 100;
  }, [weight, pricePerKg, autoPrice]);

  const selectedFarmer = farmers.find((f) => f.id === watch("farmerId"));

  function onGradeChange(e) {
    const grade = e.target.value;
    setValue("grade", grade, { shouldValidate: true });
    if (grade && GRADE_PRICES[grade]) {
      setValue("pricePerKg", GRADE_PRICES[grade], { shouldValidate: true });
    }
  }

  function onSubmit(data) {
    const farmer = farmers.find((f) => f.id === data.farmerId);
    const center = collectionCenters.find((c) => c.value === data.center);
    const record = {
      receiptNumber,
      ...data,
      farmerName: farmer?.name,
      farmerPhone: farmer?.phone,
      centerName: center?.label,
      totalAmount,
      pricePerKg: parseFloat(data.pricePerKg) || autoPrice,
    };
    setSavedRecord(record);
    setShowSuccess(true);
  }

  function handleRecordAnother() {
    setShowSuccess(false);
    setSavedRecord(null);
    reset({
      date: new Date().toISOString().split("T")[0],
      farmerId: "",
      center: "",
      weight: "",
      grade: "",
      qualityNotes: "",
      pricePerKg: "",
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
          onClick={() => navigate("/collection")}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to Collection List
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Leaf size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Record New Collection</h1>
            <p className="text-sm text-gray-500">Fill in the details for a new tea collection</p>
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
              <h2 className="text-base font-semibold text-gray-900">Farmer Information</h2>
            </div>
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
            <input type="hidden" {...register("farmerId", { required: "Please select a farmer" })} />
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
              <h2 className="text-base font-semibold text-gray-900">Tea Details</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Weight (kg)"
                type="number"
                step="0.1"
                min="0.1"
                placeholder="e.g. 45.5"
                {...register("weight", {
                  required: "Weight is required",
                  min: { value: 0.1, message: "Weight must be at least 0.1 kg" },
                })}
                error={errors.weight?.message}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Tea Grade</label>
                <select
                  value={watch("grade")}
                  onChange={onGradeChange}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
                >
                  <option value="">Select grade...</option>
                  {gradeOptions.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
                {errors.grade && <p className="text-xs text-red-500">{errors.grade.message}</p>}
                <input type="hidden" {...register("grade", { required: "Tea grade is required" })} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Quality Notes</label>
                <textarea
                  {...register("qualityNotes")}
                  rows={3}
                  placeholder="Optional notes about tea quality, moisture content, leaf appearance..."
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
                label="Price per kg (KES)"
                type="number"
                step="0.01"
                min="0"
                {...register("pricePerKg", {
                  required: "Price per kg is required",
                  min: { value: 0, message: "Price must be positive" },
                })}
                error={errors.pricePerKg?.message}
                helperText={autoPrice ? `Auto-set for ${selectedGrade}: KES ${autoPrice.toLocaleString()}` : "Select a grade to auto-set price"}
              />
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Total Amount</label>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5">
                  <p className="text-2xl font-bold text-primary">
                    KES {totalAmount.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Calculated automatically (read-only)</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div custom={5} variants={sectionVariants} initial="hidden" animate="visible">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Link to="/collection" className="sm:order-1">
              <Button variant="ghost" fullWidth>Cancel</Button>
            </Link>
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
              className="sm:order-3"
            >
              Save Collection
            </Button>
          </div>
        </motion.div>
      </form>

      <Modal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Collection Recorded Successfully"
        size="md"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="ghost" onClick={handleRecordAnother} className="flex-1">
              Record Another
            </Button>
            <Link to="/collection" className="flex-1">
              <Button fullWidth onClick={() => setShowSuccess(false)}>
                View All Collections
              </Button>
            </Link>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Receipt Generated</h3>
            <p className="text-sm text-gray-500 mb-6">Collection has been recorded successfully.</p>

            <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Receipt Number</span>
                <span className="font-mono font-semibold text-primary">{savedRecord.receiptNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Farmer</span>
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
                <span className="font-medium text-gray-900">KES {(parseFloat(savedRecord.pricePerKg) || autoPrice).toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="text-sm font-semibold text-gray-900">Total Amount</span>
                <span className="text-lg font-bold text-primary">
                  KES {totalAmount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
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
