import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Building2,
  Mail,
  Phone,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import DataTable from "../../components/ui/DataTable";
import SearchInput from "../../components/ui/SearchInput";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import { useToast } from "../../components/ui/Toast";
import StatCard from "../../components/ui/StatCard";

const MOCK_CUSTOMERS = [
  { id: 1, name: "James Mitchell", company: "Emerald Coffee Traders Ltd.", email: "james@emeraldcoffee.com", phone: "+1 (555) 234-5678", totalPurchases: 12500, outstandingBalance: 0 },
  { id: 2, name: "Sarah Chen", company: "Green Valley Imports Inc.", email: "sarah@greenvalley.com", phone: "+1 (555) 345-6789", totalPurchases: 8750, outstandingBalance: 2100 },
  { id: 3, name: "David Okafor", company: "Pacific Rim Beverages", email: "david@pacificrim.com", phone: "+1 (555) 456-7890", totalPurchases: 15200, outstandingBalance: 0 },
  { id: 4, name: "Maria Garcia", company: "Highland Exports Ltd.", email: "maria@highlandexports.com", phone: "+1 (555) 567-8901", totalPurchases: 6300, outstandingBalance: 850 },
  { id: 5, name: "Wei Zhang", company: "Oriental Coffee House", email: "wei@orientalcoffeehouse.com", phone: "+1 (555) 678-9012", totalPurchases: 22400, outstandingBalance: 0 },
  { id: 6, name: "Aisha Patel", company: "Zenith Beverages Co.", email: "aisha@zenithbev.com", phone: "+1 (555) 789-0123", totalPurchases: 9800, outstandingBalance: 3200 },
  { id: 7, name: "Thomas Brown", company: "Sunrise Trading", email: "thomas@sunrisetrading.com", phone: "+1 (555) 890-1234", totalPurchases: 4200, outstandingBalance: 0 },
  { id: 8, name: "Yuki Tanaka", company: "Mountain Dew Distributors", email: "yuki@mtn-dist.com", phone: "+1 (555) 901-2345", totalPurchases: 18500, outstandingBalance: 1500 },
  { id: 9, name: "Robert Williams", company: "Royal Coffee Merchants", email: "robert@royalcoffee.com", phone: "+1 (555) 012-3456", totalPurchases: 31200, outstandingBalance: 0 },
  { id: 10, name: "Fatima Al-Hassan", company: "Global Bean Co.", email: "fatima@globalbean.com", phone: "+1 (555) 123-4567", totalPurchases: 7600, outstandingBalance: 920 },
  { id: 11, name: "Lucas Fernandes", company: "Aroma Coffee International", email: "lucas@aromacoffee.com", phone: "+1 (555) 234-5679", totalPurchases: 14300, outstandingBalance: 0 },
  { id: 12, name: "Emma Thompson", company: "Herbal Harmony Ltd.", email: "emma@herbalharm.com", phone: "+1 (555) 345-6780", totalPurchases: 5900, outstandingBalance: 450 },
  { id: 13, name: "Ahmed Khan", company: "Bean & Cup Co.", email: "ahmed@leafcup.com", phone: "+1 (555) 456-7891", totalPurchases: 11200, outstandingBalance: 0 },
  { id: 14, name: "Olivia Martin", company: "Misty Morning Imports", email: "olivia@mistymorning.com", phone: "+1 (555) 567-8902", totalPurchases: 8100, outstandingBalance: 1800 },
  { id: 15, name: "Raj Sharma", company: "Silk Road Coffee Co.", email: "raj@silkroadcoffee.com", phone: "+1 (555) 678-9013", totalPurchases: 19800, outstandingBalance: 0 },
  { id: 16, name: "Isabella Rossi", company: "Tuscany Coffee Traders", email: "isabella@tuscanicoffee.com", phone: "+1 (555) 789-0124", totalPurchases: 3400, outstandingBalance: 600 },
  { id: 17, name: "Daniel Kim", company: "Seoul Sip Co.", email: "daniel@seoulsip.com", phone: "+1 (555) 890-1235", totalPurchases: 16700, outstandingBalance: 0 },
  { id: 18, name: "Grace Oduya", company: "Nairobi Coffee Co.", email: "grace@nairobinbean.com", phone: "+1 (555) 901-2346", totalPurchases: 9500, outstandingBalance: 2750 },
];

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const staggerContainer = { visible: { transition: { staggerChildren: 0.05 } } };

const EMPTY_FORM = { name: "", company: "", email: "", phone: "" };

function CustomersPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [deleteModal, setDeleteModal] = useState({ open: false, customer: null });

  const filteredCustomers = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [search, customers]);

  const stats = useMemo(() => {
    const totalPurchases = customers.reduce((s, c) => s + c.totalPurchases, 0);
    const outstanding = customers.reduce((s, c) => s + c.outstandingBalance, 0);
    const withBalance = customers.filter((c) => c.outstandingBalance > 0).length;
    return { totalPurchases, outstanding, count: customers.length, withBalance };
  }, [customers]);

  function openAddModal() {
    setEditingCustomer(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEditModal(customer) {
    setEditingCustomer(customer);
    setFormData({ name: customer.name, company: customer.company, email: customer.email, phone: customer.phone });
    setFormErrors({});
    setModalOpen(true);
  }

  function validate() {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.company.trim()) errs.company = "Company is required";
    if (!formData.email.trim()) errs.email = "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) errs.email = "Invalid email";
    if (!formData.phone.trim()) errs.phone = "Phone is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    if (editingCustomer) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === editingCustomer.id ? { ...c, ...formData } : c))
      );
      toast.success("Customer updated successfully!");
    } else {
      const newCustomer = {
        ...formData,
        id: Math.max(...customers.map((c) => c.id)) + 1,
        totalPurchases: 0,
        outstandingBalance: 0,
      };
      setCustomers((prev) => [...prev, newCustomer]);
      toast.success("Customer added successfully!");
    }
    setModalOpen(false);
  }

  function handleDelete(customer) {
    setDeleteModal({ open: true, customer });
  }

  function confirmDelete() {
    setCustomers((prev) => prev.filter((c) => c.id !== deleteModal.customer.id));
    toast.success(`Customer "${deleteModal.customer.name}" has been deleted.`);
    setDeleteModal({ open: false, customer: null });
  }

  const columns = [
    {
      header: "ID",
      accessor: "id",
      render: (row) => <span className="text-text-secondary">#{row.id}</span>,
    },
    {
      header: "Name",
      accessor: "name",
      render: (row) => (
        <div>
          <p className="font-medium text-text-primary">{row.name}</p>
          <p className="text-xs text-text-secondary mt-0.5">{row.email}</p>
        </div>
      ),
    },
    {
      header: "Company",
      accessor: "company",
      render: (row) => (
        <span className="flex items-center gap-1.5 text-sm text-text-primary">
          <Building2 size={14} className="text-text-secondary shrink-0" />
          {row.company}
        </span>
      ),
    },
    {
      header: "Phone",
      accessor: "phone",
      render: (row) => (
        <span className="flex items-center gap-1.5 text-sm text-text-secondary">
          <Phone size={14} className="shrink-0" />
          {row.phone}
        </span>
      ),
    },
    {
      header: "Total Purchases",
      accessor: "totalPurchases",
      render: (row) => (
        <span className="font-semibold text-text-primary">
          ${row.totalPurchases.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Outstanding",
      accessor: "outstandingBalance",
      render: (row) => (
        <span className={row.outstandingBalance > 0 ? "font-semibold text-danger" : "font-medium text-success"}>
          ${row.outstandingBalance.toLocaleString()}
        </span>
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
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Customer Management</h1>
            <p className="text-text-secondary mt-1">Manage your customer database and accounts</p>
          </div>
          <Button icon={Plus} onClick={openAddModal}>
            Add Customer
          </Button>
        </motion.div>

        <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Customers", value: stats.count, icon: Users, color: "text-primary", bg: "bg-primary/10", borderColor: "#2E7D32", change: "+12%", up: true },
            { label: "Total Purchases", value: `RWF ${stats.totalPurchases.toLocaleString()}`, icon: DollarSign, color: "text-success", bg: "bg-success/10", borderColor: "#43A047", change: "+8.5%", up: true },
            { label: "Outstanding Balance", value: `RWF ${stats.outstanding.toLocaleString()}`, icon: AlertTriangle, color: "text-danger", bg: "bg-danger/10", borderColor: "#D32F2F", change: "-3.2%", up: false },
            { label: "With Balance", value: stats.withBalance, icon: Mail, color: "text-warning", bg: "bg-warning/10", borderColor: "#F57C00", change: "+5.1%", up: true },
          ].map((stat, idx) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              up={stat.up}
              color={stat.color}
              bg={stat.bg}
              borderColor={stat.borderColor}
              delay={idx * 0.06}
            />
          ))}
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card padding="none" shadow="md">
            <div className="px-6 py-4 border-b border-border">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search customers by name, company, or email..."
                className="max-w-sm"
              />
            </div>

            <DataTable
              columns={columns}
              data={filteredCustomers}
              searchable={false}
              pageSize={10}
              actions={(row) => (
                <>
                  <button
                    onClick={() => openEditModal(row)}
                    className="p-2 rounded-lg text-text-secondary hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(row)}
                    className="p-2 rounded-lg text-text-secondary hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            />
          </Card>
        </motion.div>
      </motion.div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCustomer ? "Edit Customer" : "Add New Customer"}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} icon={editingCustomer ? Pencil : Plus}>
              {editingCustomer ? "Update Customer" : "Add Customer"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. John Smith"
            icon={Users}
            error={formErrors.name}
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          />
          <Input
            label="Company"
            placeholder="e.g. Coffee Trading Co."
            icon={Building2}
            error={formErrors.company}
            value={formData.company}
            onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            placeholder="e.g. john@company.com"
            icon={Mail}
            error={formErrors.email}
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          />
          <Input
            label="Phone"
            placeholder="e.g. +1 (555) 123-4567"
            icon={Phone}
            error={formErrors.phone}
            value={formData.phone}
            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
          />
        </div>
      </Modal>

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, customer: null })}
        title="Delete Customer"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal({ open: false, customer: null })}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-text-secondary">
          Are you sure you want to delete <strong className="text-text-primary">{deleteModal.customer?.name}</strong>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

export default CustomersPage;
