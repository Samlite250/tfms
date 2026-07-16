import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Printer,
  FileText,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";

const MOCK_SALES = {
  1: {
    id: 1,
    invoiceNo: "INV-2026-0001",
    date: "2026-07-01",
    dueDate: "2026-07-31",
    status: "Paid",
    paymentMethod: "Bank Transfer",
    notes: "Bulk order for Q3 supply chain. Free shipping included.",
    customer: {
      name: "Emerald Coffee Traders",
      company: "Emerald Coffee Traders Ltd.",
      email: "orders@emeraldcoffee.com",
      phone: "+1 (555) 234-5678",
      address: "125 Commerce Ave, Portland, OR 97201",
    },
    company: {
      name: "MCFS - Mahembe Coffee Factory System",
      address: "45 Highland Plantation Rd, Coffee District",
      email: "sales@mcfms-coffee.com",
      phone: "+1 (555) 100-2000",
    },
    items: [
      { grade: "AA", description: "Premium AA Coffee Grade", quantity: 150, unitPrice: 12.5 },
      { grade: "AB", description: "Medium AB Coffee Grade", quantity: 80, unitPrice: 15.0 },
      { grade: "Specialty Grade 1", description: "Specialty Grade 1 Arabica", quantity: 50, unitPrice: 22.0 },
    ],
  },
  2: {
    id: 2,
    invoiceNo: "INV-2026-0002",
    date: "2026-07-03",
    dueDate: "2026-08-02",
    status: "Pending",
    paymentMethod: "Mobile Money",
    notes: "",
    customer: {
      name: "Green Valley Imports",
      company: "Green Valley Imports Inc.",
      email: "procurement@greenvalley.com",
      phone: "+1 (555) 345-6789",
      address: "789 Import Lane, Seattle, WA 98101",
    },
    company: {
      name: "MCFS - Mahembe Coffee Factory System",
      address: "45 Highland Plantation Rd, Coffee District",
      email: "sales@mcfms-coffee.com",
      phone: "+1 (555) 100-2000",
    },
    items: [
      { grade: "AB", description: "Medium AB Coffee Grade", quantity: 200, unitPrice: 9.75 },
      { grade: "C", description: "Commercial Grade C Coffee", quantity: 100, unitPrice: 6.5 },
    ],
  },
};

for (let i = 3; i <= 24; i++) {
  const grades = ["AA", "AB", "PB", "C", "E", "Premium Arabica", "Standard Robusta"];
  const grade = grades[Math.floor(Math.random() * grades.length)];
  const qty = Math.floor(Math.random() * 200) + 20;
  const price = +(Math.random() * 25 + 5).toFixed(2);
  const subtotal = qty * price;
  const tax = +(subtotal * 0.16).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
  const month = String(Math.floor(Math.random() * 7) + 1).padStart(2, "0");
  const statuses = ["Paid", "Paid", "Pending", "Overdue"];
  MOCK_SALES[i] = {
    id: i,
    invoiceNo: `INV-2026-${String(i).padStart(4, "0")}`,
    date: `2026-${month}-${day}`,
    dueDate: `2026-${month}-${String(Math.min(28, Number(day) + 30)).padStart(2, "0")}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    paymentMethod: ["Cash", "Bank Transfer", "Mobile Money"][Math.floor(Math.random() * 3)],
    notes: "",
    customer: {
      name: ["Pacific Rim Beverages", "Highland Exports Ltd.", "Oriental Coffee House", "Zenith Beverages Co.", "Royal Coffee Merchants"][Math.floor(Math.random() * 5)],
      company: "Co. Ltd.",
      email: "info@example.com",
      phone: "+1 (555) 000-0000",
      address: "123 Business St, City, ST 00000",
    },
    company: {
      name: "MCFS - Mahembe Coffee Factory System",
      address: "45 Highland Plantation Rd, Coffee District",
      email: "sales@mcfms-coffee.com",
      phone: "+1 (555) 100-2000",
    },
    items: [
      { grade, description: grade, quantity: qty, unitPrice: price },
    ],
  };
}

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const staggerContainer = { visible: { transition: { staggerChildren: 0.06 } } };

function SalesDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const sale = MOCK_SALES[id] || MOCK_SALES[1];

  const subtotal = sale.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = subtotal * 0.16;
  const discount = sale.discount || 0;
  const grandTotal = subtotal + tax - discount;

  const statusVariant = (status) => {
    if (status === "Paid") return "success";
    if (status === "Pending") return "warning";
    return "danger";
  };

  const statusIcon = (status) => {
    if (status === "Paid") return CheckCircle;
    if (status === "Pending") return Clock;
    return AlertCircle;
  };

  const StatusIcon = statusIcon(sale.status);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-bg p-4 md:p-8">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto space-y-6"
      >
        <motion.div variants={fadeIn}>
          <button
            onClick={() => navigate("/sales")}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm font-medium mb-4 cursor-pointer"
          >
            <ArrowLeft size={18} />
            Back to Sales
          </button>
        </motion.div>

        <motion.div
          variants={fadeIn}
          className="flex flex-col sm:flex-row sm:items-start justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-text-primary">{sale.invoiceNo}</h1>
              <Badge variant={statusVariant(sale.status)} dot>{sale.status}</Badge>
            </div>
            <p className="text-sm text-text-secondary mt-1 flex items-center gap-2">
              <Calendar size={14} />
              Created on {sale.date}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" icon={Printer} onClick={handlePrint}>
              Print
            </Button>
            <Button variant="outline" size="sm" icon={Edit} onClick={() => navigate(`/sales/${sale.id}/edit`)}>
              Edit
            </Button>
            <Button variant="danger" size="sm" icon={Trash2} onClick={() => setShowDeleteModal(true)}>
              Delete
            </Button>
          </div>
        </motion.div>

        <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card padding="md" hover>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2.5 rounded-xl">
                <FileText size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Invoice</p>
                <p className="text-lg font-bold text-text-primary">{sale.invoiceNo}</p>
              </div>
            </div>
          </Card>
          <Card padding="md" hover>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${sale.status === "Paid" ? "bg-success/10" : sale.status === "Pending" ? "bg-warning/10" : "bg-danger/10"}`}>
                <StatusIcon size={20} className={sale.status === "Paid" ? "text-success" : sale.status === "Pending" ? "text-warning" : "text-danger"} />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Payment Status</p>
                <p className="text-lg font-bold text-text-primary">{sale.status}</p>
              </div>
            </div>
          </Card>
          <Card padding="md" hover>
            <div className="flex items-center gap-3">
              <div className="bg-success/10 p-2.5 rounded-xl">
                <CreditCard size={20} className="text-success" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Total Amount</p>
                <p className="text-lg font-bold text-primary">
                  ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card padding="none" shadow="md">
            <div className="p-6 border-b border-border">
              <h2 className="text-base font-semibold text-text-primary mb-1 flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                Invoice
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">From</h3>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-text-primary flex items-center gap-2">
                      <Building2 size={14} className="text-primary" />
                      {sale.company.name}
                    </p>
                    <p className="text-sm text-text-secondary flex items-center gap-2">
                      <MapPin size={14} />
                      {sale.company.address}
                    </p>
                    <p className="text-sm text-text-secondary flex items-center gap-2">
                      <Mail size={14} />
                      {sale.company.email}
                    </p>
                    <p className="text-sm text-text-secondary flex items-center gap-2">
                      <Phone size={14} />
                      {sale.company.phone}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Bill To</h3>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-text-primary flex items-center gap-2">
                      <User size={14} className="text-primary" />
                      {sale.customer.name}
                    </p>
                    {sale.customer.company && (
                      <p className="text-sm text-text-secondary flex items-center gap-2">
                        <Building2 size={14} />
                        {sale.customer.company}
                      </p>
                    )}
                    <p className="text-sm text-text-secondary flex items-center gap-2">
                      <MapPin size={14} />
                      {sale.customer.address}
                    </p>
                    <p className="text-sm text-text-secondary flex items-center gap-2">
                      <Mail size={14} />
                      {sale.customer.email}
                    </p>
                    <p className="text-sm text-text-secondary flex items-center gap-2">
                      <Phone size={14} />
                      {sale.customer.phone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-gray-50/80">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Coffee Grade</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Qty (kg)</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Unit Price</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sale.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-text-secondary">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-primary">{item.grade}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-primary">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-text-primary text-right">{item.quantity.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-text-primary text-right">${item.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-text-primary text-right">
                          ${(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-text-secondary">Subtotal</span>
                    <span className="text-sm font-semibold text-text-primary">
                      ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/60">
                    <span className="text-sm text-text-secondary">Tax (16%)</span>
                    <span className="text-sm font-semibold text-text-primary">
                      ${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between py-2 border-b border-border/60">
                      <span className="text-sm text-text-secondary">Discount</span>
                      <span className="text-sm font-semibold text-danger">
                        -${discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-3">
                    <span className="text-base font-bold text-text-primary">Grand Total</span>
                    <span className="text-xl font-bold text-primary">
                      ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border bg-gray-50/50">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Payment Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-text-secondary">Payment Method</p>
                  <p className="text-sm font-medium text-text-primary flex items-center gap-1.5 mt-0.5">
                    <CreditCard size={14} className="text-primary" />
                    {sale.paymentMethod}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Due Date</p>
                  <p className="text-sm font-medium text-text-primary flex items-center gap-1.5 mt-0.5">
                    <Calendar size={14} className="text-primary" />
                    {sale.dueDate}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Status</p>
                  <div className="mt-0.5">
                    <Badge variant={statusVariant(sale.status)} dot>{sale.status}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {sale.notes && (
              <div className="px-6 py-4 border-t border-border">
                <h3 className="text-sm font-semibold text-text-primary mb-2">Notes</h3>
                <p className="text-sm text-text-secondary bg-gray-50 rounded-xl p-3">{sale.notes}</p>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Invoice"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={Trash2}
              onClick={() => {
                setShowDeleteModal(false);
                toast.success(`Invoice ${sale.invoiceNo} deleted.`);
                navigate("/sales");
              }}
            >
              Delete Invoice
            </Button>
          </>
        }
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-danger" />
          </div>
          <p className="text-text-primary font-medium">
            Are you sure you want to delete this invoice?
          </p>
          <p className="text-sm text-text-secondary mt-2">
            This will permanently remove <strong>{sale.invoiceNo}</strong> and all
            associated data. This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default SalesDetailPage;
