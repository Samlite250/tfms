import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Banknote,
  Calendar,
  User,
  Coffee,
  Weight,
  CreditCard,
  CheckCircle,
  Clock,
  FileText,
  Printer,
  Edit,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { formatCurrency } from "../../utils/helpers";

const MOCK_PAYMENTS = [
  { id: "PAY-0001", paymentNumber: "PAY-202607-0001", date: "2026-07-14", farmer: "Jean-Paul Habimana", collectionRef: "COL-0001", grade: "AA", weight: 120, pricePerKg: 1200, totalAmount: 144000, status: "Paid", paymentMethod: "Bank Transfer", approvedBy: "Admin User", approvedDate: "2026-07-14", notes: "Regular payment for coffee delivery" },
  { id: "PAY-0002", paymentNumber: "PAY-202607-0002", date: "2026-07-13", farmer: "Marie Claire Uwimana", collectionRef: "COL-0002", grade: "AB", weight: 85, pricePerKg: 1000, totalAmount: 85000, status: "Pending", paymentMethod: "Mobile Money", approvedBy: "", approvedDate: "", notes: "" },
  { id: "PAY-0003", paymentNumber: "PAY-202607-0003", date: "2026-07-12", farmer: "Emmanuel Ndayisaba", collectionRef: "COL-0003", grade: "PB", weight: 150, pricePerKg: 1100, totalAmount: 165000, status: "Approved", paymentMethod: "Cash", approvedBy: "Admin User", approvedDate: "2026-07-12", notes: "Premium peaberry batch" },
];

const STATUS_VARIANT = {
  Pending: "warning",
  Approved: "info",
  Paid: "success",
  Rejected: "danger",
};

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function PaymentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const payment = MOCK_PAYMENTS.find((p) => p.id === id) || MOCK_PAYMENTS[0];

  function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
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

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Banknote size={20} className="text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{payment.paymentNumber}</h1>
                <p className="text-gray-500 text-sm">Payment details and history</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={STATUS_VARIANT[payment.status]} dot>{payment.status}</Badge>
              <Button variant="outline" size="sm" icon={Printer}>Print</Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={fadeIn} className="lg:col-span-2 space-y-6">
            <Card padding="lg" shadow="md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Banknote size={18} className="text-primary" />
                  <div>
                    <p className="text-xs text-gray-500">Payment Number</p>
                    <p className="text-sm font-semibold text-gray-900">{payment.paymentNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Calendar size={18} className="text-primary" />
                  <div>
                    <p className="text-xs text-gray-500">Payment Date</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(payment.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <User size={18} className="text-primary" />
                  <div>
                    <p className="text-xs text-gray-500">Farmer</p>
                    <p className="text-sm font-medium text-gray-900">{payment.farmer}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <FileText size={18} className="text-primary" />
                  <div>
                    <p className="text-xs text-gray-500">Collection Reference</p>
                    <p className="text-sm font-medium text-gray-900">{payment.collectionRef}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card padding="lg" shadow="md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Coffee Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-xl">
                  <Coffee size={24} className="text-primary mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Grade</p>
                  <p className="text-lg font-bold text-gray-900">{payment.grade}</p>
                </div>
                <div className="text-center p-4 bg-primary/5 rounded-xl">
                  <Weight size={24} className="text-primary mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Weight</p>
                  <p className="text-lg font-bold text-gray-900">{payment.weight} kg</p>
                </div>
                <div className="text-center p-4 bg-primary/5 rounded-xl">
                  <Banknote size={24} className="text-primary mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Price per kg</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(payment.pricePerKg)}</p>
                </div>
              </div>
            </Card>

            {payment.notes && (
              <Card padding="lg" shadow="md">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
                <p className="text-sm text-gray-600">{payment.notes}</p>
              </Card>
            )}
          </motion.div>

          <motion.div variants={fadeIn} className="space-y-6">
            <Card padding="lg" shadow="md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-500">Grade Price</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(payment.pricePerKg)}/kg</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-500">Weight</span>
                  <span className="text-sm font-medium text-gray-900">{payment.weight} kg</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-base font-bold text-gray-900">Total Amount</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(payment.totalAmount)}</span>
                </div>
              </div>
            </Card>

            <Card padding="lg" shadow="md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <CreditCard size={18} className="text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Method</p>
                    <p className="text-sm font-medium text-gray-900">{payment.paymentMethod}</p>
                  </div>
                </div>
                {payment.approvedBy && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <CheckCircle size={18} className="text-success" />
                    <div>
                      <p className="text-xs text-gray-500">Approved By</p>
                      <p className="text-sm font-medium text-gray-900">{payment.approvedBy}</p>
                    </div>
                  </div>
                )}
                {payment.approvedDate && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <Calendar size={18} className="text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Approved Date</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(payment.approvedDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" icon={Edit} onClick={() => navigate(`/payments/${id}/edit`)}>
                Edit
              </Button>
              <Button className="flex-1" icon={Printer} onClick={() => window.print()}>
                Print Receipt
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
