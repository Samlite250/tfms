import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Printer,
  Edit,
  Trash2,
  Leaf,
  Calendar,
  Hash,
  User,
  Phone,
  MapPin,
  Weight,
  Tag,
  DollarSign,
  FileText,
  Building2,
  UserCheck,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { useState } from "react";

const gradeBadgeVariant = {
  PF1: "success",
  PF2: "info",
  PF3: "warning",
  PD: "default",
  Dust: "danger",
  Fannings: "info",
};

const MOCK_COLLECTIONS = {
  "COL-0001": {
    id: "COL-0001",
    receiptNumber: "REC-202607-0001",
    date: "2026-07-14",
    farmer: "James Kamau",
    farmerId: "F001",
    farmerPhone: "0712345678",
    farmerAddress: "Nandi Hills, Nandi County",
    center: "Kericho Central Collection Center",
    weight: 45.5,
    grade: "PF1",
    pricePerKg: 850,
    amount: 38675,
    collectedBy: "Michael Otieno",
    qualityNotes: "Excellent leaf quality with fine tips. Well processed, good moisture content at 12%. Uniform leaf size indicating careful plucking during optimal flush period.",
    status: "Verified",
  },
  "COL-0002": {
    id: "COL-0002",
    receiptNumber: "REC-202607-0002",
    date: "2026-07-13",
    farmer: "Grace Wanjiku",
    farmerId: "F002",
    farmerPhone: "0723456789",
    farmerAddress: "Kericho Town, Kericho County",
    center: "Nandi Hills Collection Center",
    weight: 62.0,
    grade: "PF2",
    pricePerKg: 750,
    amount: 46500,
    collectedBy: "Patricia Wambui",
    qualityNotes: "Good quality CTC processed tea. Consistent granule size. Moisture content within acceptable range.",
    status: "Pending",
  },
};

const DEFAULT_COLLECTION = {
  id: "COL-0001",
  receiptNumber: "REC-202607-0001",
  date: "2026-07-14",
  farmer: "James Kamau",
  farmerId: "F001",
  farmerPhone: "0712345678",
  farmerAddress: "Nandi Hills, Nandi County",
  center: "Kericho Central Collection Center",
  weight: 45.5,
  grade: "PF1",
  pricePerKg: 850,
  amount: 38675,
  collectedBy: "Michael Otieno",
  qualityNotes: "Excellent leaf quality with fine tips. Well processed, good moisture content at 12%. Uniform leaf size indicating careful plucking during optimal flush period.",
  status: "Verified",
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, type: "spring", damping: 20, stiffness: 200 },
  }),
};

function DetailRow({ icon: Icon, label, value, iconColor = "text-gray-400" }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className={`mt-0.5 ${iconColor}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-900 break-words">{value}</p>
      </div>
    </div>
  );
}

function CollectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState(false);

  const collection = MOCK_COLLECTIONS[id] || { ...DEFAULT_COLLECTION, id, receiptNumber: `REC-202607-${String(id).replace("COL-", "")}` };

  function handlePrint() {
    window.print();
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Leaf size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Collection Record</h1>
              <p className="text-sm text-gray-500 font-mono">{collection.receiptNumber}</p>
            </div>
          </div>
          <div className="flex gap-2 no-print">
            <Button variant="outline" size="md" icon={Printer} onClick={handlePrint}>
              Print Receipt
            </Button>
            <Link to={`/collection/${id}/edit`}>
              <Button size="md" icon={Edit}>
                Edit
              </Button>
            </Link>
            <Button variant="danger" size="md" icon={Trash2} onClick={() => setDeleteModal(true)}>
              Delete
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-5xl print:max-w-none">
        <motion.div
          custom={0}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="mb-6 print:mb-4"
        >
          <Card padding="lg" className="print:shadow-none print:border print:border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center print:bg-primary">
                  <Leaf size={28} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Tea Collection Receipt</h2>
                  <p className="text-sm text-gray-500">Tea Factory Management System</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold font-mono text-primary">{collection.receiptNumber}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(collection.date).toLocaleDateString("en-KE", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <div className="mt-2">
                  <Badge variant={collection.status === "Verified" ? "success" : "warning"} dot>
                    {collection.status}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
          <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible">
            <Card padding="md" className="print:shadow-none print:border print:border-gray-200">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                <FileText size={16} className="text-primary" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Collection Info</h3>
              </div>
              <DetailRow icon={Hash} label="Record ID" value={collection.id} iconColor="text-primary" />
              <DetailRow icon={Calendar} label="Collection Date" value={new Date(collection.date).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })} iconColor="text-secondary" />
              <DetailRow icon={MapPin} label="Collection Center" value={collection.center} iconColor="text-accent" />
              <DetailRow icon={UserCheck} label="Collected By" value={collection.collectedBy} iconColor="text-primary" />
            </Card>
          </motion.div>

          <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
            <Card padding="md" className="print:shadow-none print:border print:border-gray-200">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                <User size={16} className="text-primary" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Farmer Info</h3>
              </div>
              <DetailRow icon={User} label="Farmer Name" value={collection.farmer} iconColor="text-primary" />
              <DetailRow icon={Hash} label="Farmer ID" value={collection.farmerId} iconColor="text-secondary" />
              <DetailRow icon={Phone} label="Phone Number" value={collection.farmerPhone} iconColor="text-accent" />
              <DetailRow icon={MapPin} label="Address" value={collection.farmerAddress} iconColor="text-primary" />
            </Card>
          </motion.div>

          <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
            <Card padding="md" className="print:shadow-none print:border print:border-gray-200">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                <Tag size={16} className="text-primary" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Tea Info</h3>
              </div>
              <DetailRow icon={Weight} label="Weight" value={`${collection.weight.toFixed(1)} kg`} iconColor="text-primary" />
              <div className="flex items-start gap-3 py-2.5">
                <div className="mt-0.5 text-secondary">
                  <Tag size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">Tea Grade</p>
                  <Badge variant={gradeBadgeVariant[collection.grade]} dot>{collection.grade}</Badge>
                </div>
              </div>
              <div className="flex items-start gap-3 py-2.5">
                <div className="mt-0.5 text-accent">
                  <FileText size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Quality Notes</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{collection.qualityNotes}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="visible">
            <Card padding="md" className="print:shadow-none print:border print:border-gray-200">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                <DollarSign size={16} className="text-primary" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Payment Info</h3>
              </div>
              <DetailRow icon={DollarSign} label="Price per kg" value={`KES ${collection.pricePerKg.toLocaleString()}`} iconColor="text-primary" />
              <DetailRow icon={Weight} label="Total Weight" value={`${collection.weight.toFixed(1)} kg`} iconColor="text-secondary" />
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-primary" />
                    <span className="text-sm font-semibold text-gray-900">Total Amount</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    KES {collection.amount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Collection Record"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => { setDeleteModal(false); navigate("/collection"); }}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete collection record <strong>{collection.receiptNumber}</strong>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

export default CollectionDetailPage;
