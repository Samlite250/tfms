import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Receipt,
  Tag,
  FileText,
  DollarSign,
  Calendar,
  CreditCard,
  Store,
  Hash,
  StickyNote,
  User,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  File,
  ImageIcon,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";

const CATEGORY_ICONS = {
  Electricity: "text-accent",
  Fuel: "text-red-600",
  Maintenance: "text-blue-600",
  Transport: "text-purple-600",
  Water: "text-cyan-600",
  Salaries: "text-primary",
  Other: "text-gray-500",
};

const CATEGORY_BG = {
  Electricity: "bg-accent/10",
  Fuel: "bg-red-100",
  Maintenance: "bg-blue-100",
  Transport: "bg-purple-100",
  Water: "bg-cyan-100",
  Salaries: "bg-green-100",
  Other: "bg-gray-100",
};

const STATUS_VARIANT = {
  Approved: "success",
  Pending: "warning",
  Rejected: "danger",
};

const STATUS_ICON = {
  Approved: CheckCircle,
  Pending: Clock,
  Rejected: XCircle,
};

const mockExpense = {
  id: "EXP-0012",
  date: "2026-07-10",
  category: "Electricity",
  description: "Monthly power bill - Factory operations including production floor, packaging line and cold storage units",
  amount: 4250.00,
  paymentMethod: "Bank Transfer",
  vendor: "Ceylon Electricity Board",
  receiptNumber: "RCT-202607-0015",
  recordedBy: "Ravi Wickrama",
  status: "Approved",
  hasReceipt: true,
  notes: "Approved by factory manager. Includes night shift surcharge for July production cycle.",
  createdAt: "2026-07-10T09:30:00Z",
  approvedBy: "Anita Jayawardena",
  approvedAt: "2026-07-11T14:20:00Z",
  accountCode: "ACC-4010",
  department: "Production",
};

function InfoRow({ label, value, icon: Icon, iconColor }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      {Icon && (
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${iconColor || "bg-gray-100"}`}>
          <Icon size={15} className={iconColor ? "text-white" : "text-gray-500"} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-900 break-words">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function ExpenseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success } = useToast();
  const [deleteModal, setDeleteModal] = useState(false);

  const expense = { ...mockExpense, id: id || mockExpense.id };

  function handleDelete() {
    success(`Expense ${expense.id} deleted successfully`);
    navigate("/expenses");
  }

  function formatCurrency(val) {
    return `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }

  function formatDateTime(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  }

  const StatusIcon = STATUS_ICON[expense.status];

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
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${CATEGORY_BG[expense.category] || "bg-gray-100"}`}>
              <Receipt size={28} className={CATEGORY_ICONS[expense.category] || "text-gray-500"} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{expense.id}</h1>
                <Badge variant={STATUS_VARIANT[expense.status]} dot>{expense.status}</Badge>
              </div>
              <p className="text-gray-500 mt-1 line-clamp-1">{expense.description}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><Tag size={14} /> {expense.category}</span>
                <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(expense.date)}</span>
                <span className="flex items-center gap-1.5 font-semibold text-primary"><DollarSign size={14} /> {formatCurrency(expense.amount)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link to={`/expenses/${expense.id}/edit`}>
                <Button variant="outline" size="sm" icon={Pencil}>Edit</Button>
              </Link>
              <Button variant="danger" size="sm" icon={Trash2} onClick={() => setDeleteModal(true)}>Delete</Button>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              Basic Information
            </h3>
            <div className="divide-y divide-gray-100">
              <InfoRow label="Expense ID" value={expense.id} icon={Hash} />
              <InfoRow label="Category" value={expense.category} icon={Tag} iconColor="bg-primary" />
              <InfoRow label="Description" value={expense.description} />
              <InfoRow label="Date" value={formatDate(expense.date)} icon={Calendar} />
              <InfoRow label="Department" value={expense.department} />
              <InfoRow label="Account Code" value={expense.accountCode} icon={Hash} />
              <InfoRow label="Recorded By" value={expense.recordedBy} icon={User} />
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <CreditCard size={18} className="text-primary" />
              Payment Information
            </h3>
            <div className="divide-y divide-gray-100">
              <InfoRow label="Amount" value={formatCurrency(expense.amount)} icon={DollarSign} iconColor="bg-primary" />
              <InfoRow label="Payment Method" value={expense.paymentMethod} icon={CreditCard} />
              <InfoRow label="Vendor / Supplier" value={expense.vendor} icon={Store} />
              <InfoRow label="Receipt Number" value={expense.receiptNumber || "Not provided"} icon={Hash} />
              <InfoRow label="Status" value={expense.status} icon={StatusIcon} />
              {expense.approvedBy && (
                <>
                  <InfoRow label="Approved By" value={expense.approvedBy} icon={User} />
                  <InfoRow label="Approved At" value={formatDateTime(expense.approvedAt)} icon={Calendar} />
                </>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {expense.notes && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card>
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <StickyNote size={18} className="text-primary" />
              Notes
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4">{expense.notes}</p>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <File size={18} className="text-primary" />
            Receipt
          </h3>
          {expense.hasReceipt ? (
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <ImageIcon size={24} className="text-primary" />
                </div>
                <p className="text-sm font-medium text-gray-700">Receipt_{expense.receiptNumber}.pdf</p>
                <p className="text-xs text-gray-400 mt-1">Uploaded on {formatDate(expense.date)}</p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <Button variant="outline" size="sm" icon={Download}>Download</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
              <Receipt size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No receipt attached</p>
              <p className="text-xs text-gray-400 mt-1">Receipt was not uploaded for this expense</p>
            </div>
          )}
        </Card>
      </motion.div>

      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Expense"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete expense <strong>{expense.id}</strong> - {expense.description}?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
