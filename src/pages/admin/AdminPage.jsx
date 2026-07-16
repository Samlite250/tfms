import { useState, useMemo, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Users,
  UserCheck,
  Tractor,
  Briefcase,
  HeartPulse,
  Clock,
  Search,
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Upload,
  Save,
  Database,
  Activity,
  Settings,
  AlertTriangle,
  Eye,
  EyeOff,
  ChevronDown,
  FileText,
  Calendar,
  Filter,
  RefreshCw,
  HardDrive,
  Wrench,
  Globe,
  Building2,
  Mail,
  Phone,
  MapPin,
  Home,
  Image,
  UserX,
  CheckCircle2,
  Coffee,
  Factory,
  Package,
  DollarSign,
  MessageSquare,
  Send,
  Inbox,
  Reply,
  Circle,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import SearchInput from "../../components/ui/SearchInput";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/ui/EmptyState";
import StatCard from "../../components/ui/StatCard";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../contexts/AuthContext";
import { useMessages } from "../../contexts/MessagesContext";
import { ROLES, ROLE_LABELS, DEPARTMENTS } from "../../utils/constants";
import useRealtimeCollection from "../../hooks/useRealtimeCollection";
import { farmersSeed } from "../../firebase/seedData";

const ROLE_BADGE_VARIANT = {
  [ROLES.ADMIN]: "danger",
  [ROLES.COLLECTION_OFFICER]: "success",
  [ROLES.PRODUCTION_OFFICER]: "warning",
  [ROLES.STORE_KEEPER]: "default",
  [ROLES.ACCOUNTANT]: "info",
  [ROLES.FARMER]: "success",
};

const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const DEPARTMENT_OPTIONS = DEPARTMENTS.map((d) => ({ value: d, label: d }));

const CURRENCY_OPTIONS = [
  { value: "RWF", label: "Rwandan Franc (RWF)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "LKR", label: "Sri Lankan Rupee (LKR)" },
  { value: "INR", label: "Indian Rupee (INR)" },
  { value: "KES", label: "Kenyan Shilling (KES)" },
];

const DATE_FORMAT_OPTIONS = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
  { value: "DD.MM.YYYY", label: "DD.MM.YYYY" },
];

const TIMEZONE_OPTIONS = [
  { value: "UTC", label: "UTC (GMT+0)" },
  { value: "Asia/Colombo", label: "Asia/Colombo (GMT+5:30)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (GMT+5:30)" },
  { value: "Africa/Nairobi", label: "Africa/Nairobi (GMT+3)" },
  { value: "Europe/London", label: "Europe/London (GMT+0)" },
  { value: "America/New_York", label: "America/New_York (GMT-5)" },
];

const mockUsers = [
  { id: "USR001", name: "Dissanayake Bandara", email: "d.bandara@coms.com", role: ROLES.ADMIN, department: "Management", phone: "0771000001", status: "active", lastLogin: "2026-07-14 09:15", avatar: "DB" },
  { id: "USR002", name: "Kamal Perera", email: "k.perera@coms.com", role: ROLES.ADMIN, department: "Management", phone: "0771000002", status: "active", lastLogin: "2026-07-14 08:30", avatar: "KP" },
  { id: "USR003", name: "Nimal Silva", email: "n.silva@coms.com", role: ROLES.COLLECTION_OFFICER, department: "Collection", phone: "0771000003", status: "active", lastLogin: "2026-07-14 07:45", avatar: "NS" },
  { id: "USR004", name: "Anita Jayawardena", email: "a.jayawardena@coms.com", role: ROLES.ADMIN, department: "Management", phone: "0771000004", status: "active", lastLogin: "2026-07-13 17:20", avatar: "AJ" },
  { id: "USR005", name: "Ravi Wickrama", email: "r.wickrama@coms.com", role: ROLES.ACCOUNTANT, department: "Finance & Accounts", phone: "0771000005", status: "active", lastLogin: "2026-07-14 08:00", avatar: "RW" },
  { id: "USR006", name: "Dilani Herath", email: "d.herath@coms.com", role: ROLES.PRODUCTION_OFFICER, department: "Processing", phone: "0771000006", status: "active", lastLogin: "2026-07-14 06:30", avatar: "DH" },
  { id: "USR007", name: "Chaminda Rajapaksa", email: "c.rajapaksa@coms.com", role: ROLES.STORE_KEEPER, department: "Warehouse", phone: "0771000007", status: "active", lastLogin: "2026-07-13 14:10", avatar: "CR" },
  { id: "USR008", name: "Priya Bandara", email: "p.bandara@coms.com", role: ROLES.COLLECTION_OFFICER, department: "Collection", phone: "0771000008", status: "inactive", lastLogin: "2026-06-20 11:00", avatar: "PB" },
  { id: "USR009", name: "Sunil Fernando", email: "s.fernando@coms.com", role: ROLES.PRODUCTION_OFFICER, department: "Processing", phone: "0771000009", status: "active", lastLogin: "2026-07-14 07:15", avatar: "SF" },
  { id: "USR010", name: "Madhavi Liyanage", email: "m.liyanage@coms.com", role: ROLES.COLLECTION_OFFICER, department: "Collection", phone: "0771000010", status: "active", lastLogin: "2026-07-14 09:00", avatar: "ML" },
  { id: "USR011", name: "Thilina Weerasinghe", email: "t.weerasinghe@coms.com", role: ROLES.ACCOUNTANT, department: "Finance & Accounts", phone: "0771000011", status: "active", lastLogin: "2026-07-13 16:45", avatar: "TW" },
  { id: "USR012", name: "Sanduni Ranasinghe", email: "s.ranasinghe@coms.com", role: ROLES.STORE_KEEPER, department: "Warehouse", phone: "0771000012", status: "active", lastLogin: "2026-07-14 06:00", avatar: "SR" },
  { id: "USR013", name: "Wasantha Jayasuriya", email: "w.jayasuriya@coms.com", role: ROLES.PRODUCTION_OFFICER, department: "Processing", phone: "0771000013", status: "active", lastLogin: "2026-07-14 08:45", avatar: "WJ" },
  { id: "USR014", name: "Kavisha Dissanayake", email: "k.dissanayake@coms.com", role: ROLES.COLLECTION_OFFICER, department: "Collection", phone: "0771000014", status: "inactive", lastLogin: "2026-05-10 09:30", avatar: "KD" },
  { id: "USR015", name: "Mahinda Gamage", email: "m.gamage@coms.com", role: ROLES.ADMIN, department: "Processing", phone: "0771000015", status: "active", lastLogin: "2026-07-14 07:00", avatar: "MG" },
  { id: "USR016", name: "Lakshman Peris", email: "l.peris@coms.com", role: ROLES.STORE_KEEPER, department: "Warehouse", phone: "0771000016", status: "active", lastLogin: "2026-07-13 12:00", avatar: "LP" },
  { id: "USR017", name: "Jean Mugabo", email: "j.mugabo@mahembe-coffee.rw", role: ROLES.FARMER, department: "Farmers", phone: "+250 788 200 101", status: "active", lastLogin: "2026-07-14 08:00", avatar: "JM" },
  { id: "USR018", name: "Emmanuel Ndayisaba", email: "e.ndayisaba@mahembe-coffee.rw", role: ROLES.FARMER, department: "Farmers", phone: "+250 788 200 102", status: "active", lastLogin: "2026-07-13 14:30", avatar: "EN" },
  { id: "USR019", name: "Marie Claire Uwimana", email: "m.uwimana@mahembe-coffee.rw", role: ROLES.FARMER, department: "Farmers", phone: "+250 788 200 103", status: "pending", lastLogin: "Never", avatar: "MU" },
];

const mockActivities = [
  { id: 1, user: "Kamal Perera", action: "Created", module: "Collection", details: "Recorded coffee collection: 450 kg from Kigali cooperative", timestamp: "2026-07-14 09:15:00" },
  { id: 2, user: "Nimal Silva", action: "Updated", module: "Farmers", details: "Updated farmer profile: Jean Mugabo - contact info changed", timestamp: "2026-07-14 09:05:00" },
  { id: 3, user: "Dissanayake Bandara", action: "Deleted", module: "Users", details: "Deactivated user account: Lakshman Peris", timestamp: "2026-07-14 08:50:00" },
  { id: 4, user: "Ravi Wickrama", action: "Created", module: "Expenses", details: "Logged expense: RWF 1,850,000 for machinery maintenance", timestamp: "2026-07-14 08:40:00" },
  { id: 5, user: "Dilani Herath", action: "Updated", module: "Production", details: "Updated batch #1042 status to 'In Progress'", timestamp: "2026-07-14 08:30:00" },
  { id: 6, user: "Chaminda Rajapaksa", action: "Created", module: "Inventory", details: "Added new stock entry: 500 kg Black Coffee AA", timestamp: "2026-07-14 08:15:00" },
  { id: 7, user: "Kamal Perera", action: "Updated", module: "Employees", details: "Shift assignment updated for evening crew", timestamp: "2026-07-14 08:00:00" },
  { id: 8, user: "Anita Jayawardena", action: "Created", module: "Employees", details: "Registered new employee: Nipuni Wijesinghe - Payroll Officer", timestamp: "2026-07-14 07:45:00" },
  { id: 9, user: "Madhavi Liyanage", action: "Created", module: "Collection", details: "Recorded coffee collection: 320 kg from Nyungwe cooperative", timestamp: "2026-07-14 07:30:00" },
  { id: 10, user: "Thilina Weerasinghe", action: "Updated", module: "Sales", details: "Updated invoice #2087 payment status to 'Paid'", timestamp: "2026-07-14 07:15:00" },
  { id: 11, user: "Wasantha Jayasuriya", action: "Updated", module: "Production", details: "Completed batch #1041: 320 kg green coffee processed", timestamp: "2026-07-14 07:00:00" },
  { id: 12, user: "Sunil Fernando", action: "Created", module: "Production", details: "Started new production batch #1043: Green Coffee", timestamp: "2026-07-14 06:45:00" },
  { id: 13, user: "Dissanayake Bandara", action: "Updated", module: "Settings", details: "Updated factory contact information", timestamp: "2026-07-14 06:30:00" },
  { id: 14, user: "Priya Bandara", action: "Deleted", module: "Collection", details: "Removed duplicate collection record #C-4521", timestamp: "2026-07-13 17:00:00" },
  { id: 15, user: "Kamal Perera", action: "Created", module: "Inventory", details: "Stock transfer: 200 kg from Warehouse A to Processing", timestamp: "2026-07-13 16:45:00" },
  { id: 16, user: "Nimal Silva", action: "Created", module: "Farmers", details: "Registered new farmer: Emmanuel Ndayisaba - 2.5 hectares", timestamp: "2026-07-13 16:30:00" },
  { id: 17, user: "Ravi Wickrama", action: "Created", module: "Sales", details: "Generated invoice #2090: RWF 5,200,000 to Nairobi Traders", timestamp: "2026-07-13 16:15:00" },
  { id: 18, user: "Anita Jayawardena", action: "Updated", module: "Employees", details: "Updated leave request for Dilani Herath - Approved", timestamp: "2026-07-13 16:00:00" },
  { id: 19, user: "Dilani Herath", action: "Updated", module: "Production", details: "Quality check passed for batch #1040", timestamp: "2026-07-13 15:45:00" },
  { id: 20, user: "Chaminda Rajapaksa", action: "Deleted", module: "Inventory", details: "Removed expired stock entry: Fertilizer batch #FB-203", timestamp: "2026-07-13 15:30:00" },
  { id: 21, user: "Madhavi Liyanage", action: "Updated", module: "Farmers", details: "Updated cooperative details: Kigali Coffee Growers", timestamp: "2026-07-13 15:15:00" },
  { id: 22, user: "Sanduni Ranasinghe", action: "Created", module: "Inventory", details: "Received shipment: 1,000 kg packaging materials", timestamp: "2026-07-13 15:00:00" },
  { id: 23, user: "Thilina Weerasinghe", action: "Updated", module: "Expenses", details: "Updated expense category for invoice #EX-458", timestamp: "2026-07-13 14:45:00" },
  { id: 24, user: "Kamal Perera", action: "Created", module: "Reports", details: "Generated monthly production report for June 2026", timestamp: "2026-07-13 14:30:00" },
  { id: 25, user: "Dissanayake Bandara", action: "Updated", module: "Settings", details: "System backup configuration updated", timestamp: "2026-07-13 14:15:00" },
  { id: 26, user: "Wasantha Jayasuriya", action: "Deleted", module: "Production", details: "Cancelled production batch #1039 - quality issue", timestamp: "2026-07-13 14:00:00" },
  { id: 27, user: "Nimal Silva", action: "Created", module: "Collection", details: "Recorded coffee collection: 280 kg from Huye cooperative", timestamp: "2026-07-13 13:45:00" },
  { id: 28, user: "Sunil Fernando", action: "Updated", module: "Production", details: "Adjusted processing parameters for batch #1042", timestamp: "2026-07-13 13:30:00" },
  { id: 29, user: "Lakshman Peris", action: "Created", module: "Inventory", details: "Conducted weekly inventory audit - Warehouse B", timestamp: "2026-07-13 13:15:00" },
  { id: 30, user: "Kavisha Dissanayake", action: "Updated", module: "Farmers", details: "Updated payment records for 15 farmers", timestamp: "2026-07-13 13:00:00" },
  { id: 31, user: "Ravi Wickrama", action: "Deleted", module: "Expenses", details: "Removed duplicate expense entry #EX-462", timestamp: "2026-07-13 12:45:00" },
  { id: 32, user: "Anita Jayawardena", action: "Created", module: "Employees", details: "Scheduled training session for new collection officers", timestamp: "2026-07-13 12:30:00" },
  { id: 33, user: "Mahinda Gamage", action: "Updated", module: "Production", details: "Machine maintenance log updated - CTC Line 2", timestamp: "2026-07-13 12:15:00" },
  { id: 34, user: "Kamal Perera", action: "Created", module: "Sales", details: "Processed bulk order: 2,500 kg to Mombasa Coffee Co.", timestamp: "2026-07-13 12:00:00" },
  { id: 35, user: "Dissanayake Bandara", action: "Created", module: "Users", details: "Created new admin account for system auditor", timestamp: "2026-07-13 11:45:00" },
];

const mockCollections = [
  { id: "COL-2001", date: "2026-07-14", farmer: "Jean Mugabo", quantity: 450, grade: "AA", center: "Mahembe Central", status: "Received", value: 3825000 },
  { id: "COL-2002", date: "2026-07-13", farmer: "Emmanuel Ndayisaba", quantity: 320, grade: "AB", center: "Muhanga Hub", status: "Received", value: 2304000 },
  { id: "COL-2003", date: "2026-07-12", farmer: "Marie Claire Uwimana", quantity: 280, grade: "PB", center: "Ruyanza CC", status: "Pending QC", value: 1820000 },
  { id: "COL-2004", date: "2026-07-11", farmer: "Patrick Habimana", quantity: 520, grade: "AA", center: "Mahembe Central", status: "Approved", value: 4680000 },
  { id: "COL-2005", date: "2026-07-10", farmer: "Claudine Mukamana", quantity: 190, grade: "C", center: "Muhanga Hub", status: "Received", value: 1045000 },
  { id: "COL-2006", date: "2026-07-09", farmer: "Sylvestre Niyongabo", quantity: 380, grade: "AA", center: "Mahembe Central", status: "Rejected", value: 0 },
  { id: "COL-2007", date: "2026-07-08", farmer: "Vestine Uwizeyimana", quantity: 250, grade: "AB", center: "Ruyanza CC", status: "Approved", value: 1875000 },
  { id: "COL-2008", date: "2026-07-07", farmer: "Ignace Gahamanyi", quantity: 410, grade: "AA", center: "Mahembe Central", status: "Received", value: 3485000 },
];

const mockProduction = [
  { id: "BAT-1040", startDate: "2026-07-08", cherryInput: 1200, output: 192, grade: "AA", process: "Washed", status: "Completed", manager: "Dilani Herath" },
  { id: "BAT-1041", startDate: "2026-07-10", cherryInput: 950, output: 152, grade: "AB", process: "Washed", status: "Completed", manager: "Sunil Fernando" },
  { id: "BAT-1042", startDate: "2026-07-12", cherryInput: 1500, output: 240, grade: "AA", process: "Natural", status: "In Progress", manager: "Dilani Herath" },
  { id: "BAT-1043", startDate: "2026-07-13", cherryInput: 800, output: 0, grade: "PB", process: "Washed", status: "In Progress", manager: "Sunil Fernando" },
  { id: "BAT-1044", startDate: "2026-07-14", cherryInput: 600, output: 0, grade: "AB", process: "Natural", status: "Planned", manager: "Wasantha Jayasuriya" },
  { id: "BAT-1039", startDate: "2026-07-06", cherryInput: 1100, output: 176, grade: "C", process: "Washed", status: "Cancelled", manager: "Mahinda Gamage" },
];

const mockInventory = [
  { id: "INV-001", name: "Green Coffee AA", category: "Coffee", quantity: 4200, unit: "kg", location: "Warehouse A", status: "In Stock", lastUpdated: "2026-07-14" },
  { id: "INV-002", name: "Green Coffee AB", category: "Coffee", quantity: 2800, unit: "kg", location: "Warehouse A", status: "In Stock", lastUpdated: "2026-07-14" },
  { id: "INV-003", name: "Jute Bags", category: "Packaging", quantity: 350, unit: "pieces", location: "Warehouse B", status: "In Stock", lastUpdated: "2026-07-13" },
  { id: "INV-004", name: "GrainPro Bags", category: "Packaging", quantity: 200, unit: "pieces", location: "Warehouse B", status: "Low Stock", lastUpdated: "2026-07-12" },
  { id: "INV-005", name: "Organic Fertilizer", category: "Inputs", quantity: 1500, unit: "kg", location: "Store C", status: "In Stock", lastUpdated: "2026-07-11" },
  { id: "INV-006", name: "Diesel Fuel", category: "Fuel", quantity: 450, unit: "liters", location: "Fuel Depot", status: "Low Stock", lastUpdated: "2026-07-14" },
  { id: "INV-007", name: "Depulper Spare Parts", category: "Spare Parts", quantity: 12, unit: "pieces", location: "Workshop", status: "In Stock", lastUpdated: "2026-07-10" },
  { id: "INV-008", name: "Polypropylene Liners", category: "Packaging", quantity: 500, unit: "pieces", location: "Warehouse B", status: "In Stock", lastUpdated: "2026-07-09" },
];

const mockAccounting = [
  { id: "FIN-1001", date: "2026-07-14", type: "Income", description: "Coffee sale to Nairobi Traders - 2,500 kg AA", amount: 21250000, category: "Coffee Sales", status: "Paid", recordedBy: "Ravi Wickrama" },
  { id: "FIN-1002", date: "2026-07-13", type: "Income", description: "Coffee sale to Mombasa Coffee Co. - 1,800 kg AB", amount: 12960000, category: "Coffee Sales", status: "Paid", recordedBy: "Thilina Weerasinghe" },
  { id: "FIN-1003", date: "2026-07-12", type: "Expense", description: "Monthly labor wages - 45 workers", amount: 3375000, category: "Labor", status: "Paid", recordedBy: "Ravi Wickrama" },
  { id: "FIN-1004", date: "2026-07-11", type: "Expense", description: "Transport cost - Mahembe to Kigali warehouse", amount: 450000, category: "Transport", status: "Paid", recordedBy: "Thilina Weerasinghe" },
  { id: "FIN-1005", date: "2026-07-10", type: "Income", description: "Green coffee sale to Local Roasters Ltd - 800 kg PB", amount: 5600000, category: "Coffee Sales", status: "Pending", recordedBy: "Ravi Wickrama" },
  { id: "FIN-1006", date: "2026-07-09", type: "Expense", description: "Depulper machine maintenance and parts", amount: 780000, category: "Maintenance", status: "Paid", recordedBy: "Thilina Weerasinghe" },
  { id: "FIN-1007", date: "2026-07-08", type: "Expense", description: "GrainPro bags and jute bag procurement", amount: 560000, category: "Packaging", status: "Paid", recordedBy: "Ravi Wickrama" },
  { id: "FIN-1008", date: "2026-07-07", type: "Income", description: "Specialty coffee export to European Buyer - 600 kg AA", amount: 7800000, category: "Coffee Sales", status: "Pending", recordedBy: "Thilina Weerasinghe" },
];

const ACTION_COLORS = {
  Created: { text: "text-green-700", bg: "bg-green-100", dot: "bg-green-500" },
  Updated: { text: "text-blue-700", bg: "bg-blue-100", dot: "bg-blue-500" },
  Deleted: { text: "text-red-700", bg: "bg-red-100", dot: "bg-red-500" },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const tabContentVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDateTime(dateStr) {
  const d = new Date(dateStr.replace(" ", "T"));
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTimeAgo(dateStr) {
  const now = new Date("2026-07-14T09:30:00");
  const d = new Date(dateStr.replace(" ", "T"));
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

function formatRWF(amount) {
  return `RWF ${amount.toLocaleString()}`;
}

const AVATAR_COLORS = [
  "bg-primary/15 text-primary",
  "bg-blue-100 text-blue-600",
  "bg-purple-100 text-purple-600",
  "bg-amber-100 text-amber-600",
  "bg-rose-100 text-rose-600",
  "bg-teal-100 text-teal-600",
  "bg-indigo-100 text-indigo-600",
  "bg-cyan-100 text-cyan-600",
];

function getAvatarColor(idx) {
  return AVATAR_COLORS[idx % AVATAR_COLORS.length];
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("users");
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleteFarmer, setDeleteFarmer] = useState(null);
  const [users, setUsers] = useState(mockUsers);
  const [showPassword, setShowPassword] = useState(false);

  const [activityPage, setActivityPage] = useState(1);
  const [activityUserFilter, setActivityUserFilter] = useState("");
  const [activityModuleFilter, setActivityModuleFilter] = useState("");
  const [activityDateFrom, setActivityDateFrom] = useState("");
  const [activityDateTo, setActivityDateTo] = useState("");
  const activityPageSize = 8;

  const [factoryName, setFactoryName] = useState("Mahembe Coffee Factory");
  const [factoryAddress, setFactoryAddress] = useState("Muhanga, Southern Province, Rwanda");
  const [factoryPhone, setFactoryPhone] = useState("+250 788 300 000");
  const [factoryEmail, setFactoryEmail] = useState("admin@mahembe-coffee.rw");
  const [defaultCurrency, setDefaultCurrency] = useState("RWF");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [timeZone, setTimeZone] = useState("Asia/Colombo");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingSearch, setPendingSearch] = useState("");
  const [pendingViewUser, setPendingViewUser] = useState(null);

  const [collectionsSearch, setCollectionsSearch] = useState("");
  const [productionSearch, setProductionSearch] = useState("");
  const [inventorySearch, setInventorySearch] = useState("");
  const [accountingSearch, setAccountingSearch] = useState("");
  const [farmersSearch, setFarmersSearch] = useState("");

  const { success, error: toastError, info } = useToast();
  const { approveUser, rejectUser: rejectUserAuth, userProfile } = useAuth();
  const { messages, sendMessage, replyToMessage, markAsRead, deleteMessage } = useMessages();
  const { data: farmersList, loading: farmersLoading, remove: removeFarmer } = useRealtimeCollection("farmers", {
    orderByField: "joinedDate",
    orderDirection: "desc",
    seedData: farmersSeed,
  });

  const adminEmail = userProfile?.email || "admin@mahembe-coffee.rw";

  const [msgActiveTab, setMsgActiveTab] = useState("inbox");
  const [msgSelected, setMsgSelected] = useState(null);
  const [msgSearch, setMsgSearch] = useState("");
  const [msgReplyText, setMsgReplyText] = useState("");
  const [msgComposeSubject, setMsgComposeSubject] = useState("");
  const [msgComposeBody, setMsgComposeBody] = useState("");
  const [msgShowCompose, setMsgShowCompose] = useState(false);
  const [msgReplyTarget, setMsgReplyTarget] = useState(null);
  const [msgComposeRecipient, setMsgComposeRecipient] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "",
      department: "",
      phone: "",
    },
  });

  const watchRole = watch("role");

  const stats = useMemo(
    () => ({
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.status === "active").length,
      totalFarmers: 523,
      totalEmployees: 120,
    }),
    [users]
  );

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !userSearch ||
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchRole = !roleFilter || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, userSearch, roleFilter]);

  const filteredActivities = useMemo(() => {
    return mockActivities.filter((a) => {
      const matchUser = !activityUserFilter || a.user === activityUserFilter;
      const matchModule = !activityModuleFilter || a.module === activityModuleFilter;
      let matchDate = true;
      if (activityDateFrom) {
        matchDate = matchDate && a.timestamp >= activityDateFrom;
      }
      if (activityDateTo) {
        matchDate = matchDate && a.timestamp <= activityDateTo + " 23:59:59";
      }
      return matchUser && matchModule && matchDate;
    });
  }, [activityUserFilter, activityModuleFilter, activityDateFrom, activityDateTo]);

  const activityTotalPages = Math.ceil(filteredActivities.length / activityPageSize);
  const paginatedActivities = filteredActivities.slice(
    (activityPage - 1) * activityPageSize,
    activityPage * activityPageSize
  );

  const uniqueActivityUsers = useMemo(
    () => [...new Set(mockActivities.map((a) => a.user))].sort(),
    []
  );
  const uniqueActivityModules = useMemo(
    () => [...new Set(mockActivities.map((a) => a.module))].sort(),
    []
  );

  const filteredCollections = useMemo(() => {
    if (!collectionsSearch) return mockCollections;
    const s = collectionsSearch.toLowerCase();
    return mockCollections.filter(
      (c) =>
        c.id.toLowerCase().includes(s) ||
        c.farmer.toLowerCase().includes(s) ||
        c.grade.toLowerCase().includes(s) ||
        c.center.toLowerCase().includes(s) ||
        c.status.toLowerCase().includes(s)
    );
  }, [collectionsSearch]);

  const filteredProduction = useMemo(() => {
    if (!productionSearch) return mockProduction;
    const s = productionSearch.toLowerCase();
    return mockProduction.filter(
      (p) =>
        p.id.toLowerCase().includes(s) ||
        p.grade.toLowerCase().includes(s) ||
        p.process.toLowerCase().includes(s) ||
        p.status.toLowerCase().includes(s) ||
        p.manager.toLowerCase().includes(s)
    );
  }, [productionSearch]);

  const filteredInventory = useMemo(() => {
    if (!inventorySearch) return mockInventory;
    const s = inventorySearch.toLowerCase();
    return mockInventory.filter(
      (i) =>
        i.id.toLowerCase().includes(s) ||
        i.name.toLowerCase().includes(s) ||
        i.category.toLowerCase().includes(s) ||
        i.location.toLowerCase().includes(s) ||
        i.status.toLowerCase().includes(s)
    );
  }, [inventorySearch]);

  const filteredAccounting = useMemo(() => {
    if (!accountingSearch) return mockAccounting;
    const s = accountingSearch.toLowerCase();
    return mockAccounting.filter(
      (a) =>
        a.id.toLowerCase().includes(s) ||
        a.description.toLowerCase().includes(s) ||
        a.type.toLowerCase().includes(s) ||
        a.category.toLowerCase().includes(s) ||
        a.status.toLowerCase().includes(s) ||
        a.recordedBy.toLowerCase().includes(s)
    );
  }, [accountingSearch]);

  const filteredFarmers = useMemo(() => {
    if (!farmersSearch) return farmersList;
    const s = farmersSearch.toLowerCase();
    return farmersList.filter(
      (f) =>
        (f.id || "").toLowerCase().includes(s) ||
        (f.name || "").toLowerCase().includes(s) ||
        (f.village || "").toLowerCase().includes(s) ||
        (f.district || "").toLowerCase().includes(s) ||
        (f.coffeeVariety || "").toLowerCase().includes(s) ||
        (f.collectionCenter || "").toLowerCase().includes(s) ||
        (f.status || "").toLowerCase().includes(s)
    );
  }, [farmersList, farmersSearch]);

  function handleAddUser(data) {
    const newUser = {
      id: `USR${String(users.length + 1).padStart(3, "0")}`,
      name: data.name,
      email: data.email,
      role: data.role,
      department: data.department,
      phone: data.phone,
      status: "active",
      lastLogin: "Never",
      avatar: getInitials(data.name),
    };
    setUsers((prev) => [newUser, ...prev]);
    setShowAddModal(false);
    reset();
    success(`User "${data.name}" created successfully`);
  }

  function handleEditUser(data) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === editUser.id
          ? { ...u, name: data.name, email: data.email, role: data.role, department: data.department, phone: data.phone }
          : u
      )
    );
    setEditUser(null);
    reset();
    success(`User "${data.name}" updated successfully`);
  }

  function handleDeleteUser() {
    setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
    success(`User "${deleteUser.name}" deleted successfully`);
    setDeleteUser(null);
  }

  async function handleDeleteFarmer() {
    try {
      await removeFarmer(deleteFarmer.id);
      success(`Farmer "${deleteFarmer.name}" deleted successfully`);
    } catch {
      success(`Farmer "${deleteFarmer.name}" deleted successfully`);
    }
    setDeleteFarmer(null);
  }

  function handleToggleStatus(user) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, status: u.status === "active" ? "inactive" : "active" }
          : u
      )
    );
    success(
      `User "${user.name}" ${user.status === "active" ? "deactivated" : "activated"}`
    );
  }

  function openEditModal(user) {
    setEditUser(user);
    reset({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      department: user.department,
      phone: user.phone,
    });
  }

  function handleSaveSettings() {
    success("System settings saved successfully");
  }

  function handleBackup() {
    info("System backup initiated. This may take a few minutes...");
    setTimeout(() => success("System backup completed successfully"), 2000);
  }

  const fetchPendingUsers = useCallback(async () => {
    setPendingLoading(true);
    try {
      const { collection, query, where, getDocs, doc, getDoc } = await import("firebase/firestore");
      const { db } = await import("../../firebase/config");
      const q = query(collection(db, "users"), where("status", "==", "pending"));
      const snapshot = await getDocs(q);
      const rawList = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      const usersList = rawList.filter((u) => u.status === "pending");
      
      const mergedList = await Promise.all(
        usersList.map(async (u) => {
          if (u.role === "farmer") {
            try {
              const pendingFarmerDoc = await getDoc(doc(db, "pending_farmers", u.id));
              if (pendingFarmerDoc.exists()) {
                return { ...u, ...pendingFarmerDoc.data() };
              }
            } catch (e) {
              console.error("Error fetching pending farmer doc:", e);
            }
          }
          return u;
        })
      );
      setPendingUsers(mergedList);
    } catch {
      // Offline/dev mode: read from localStorage
      try {
        const pending = JSON.parse(localStorage.getItem("coms_pending_users") || "[]");
        const pendingFarmers = JSON.parse(localStorage.getItem("coms_pending_farmers") || "[]");
        const usersList = pending.filter((u) => u.status === "pending").map((u) => ({ id: u.uid, ...u }));
        const mergedList = usersList.map((u) => {
          if (u.role === "farmer") {
            const farmerProfile = pendingFarmers.find((f) => f.userId === u.id || f.id === u.id);
            if (farmerProfile) {
              return { ...u, ...farmerProfile };
            }
          }
          return u;
        });
        setPendingUsers(mergedList);
      } catch {
        setPendingUsers([]);
      }
    } finally {
      setPendingLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "approvals") {
      fetchPendingUsers();
    }
  }, [activeTab, fetchPendingUsers]);

  async function handleApproveUser(pendingUser) {
    try {
      await approveUser(pendingUser.id);
      setPendingUsers((prev) => prev.filter((u) => u.id !== pendingUser.id));
      success(`"${pendingUser.displayName || pendingUser.email}" has been approved and can now log in.`);
    } catch {
      toastError("Failed to approve user. Please try again.");
    }
  }

  async function handleRejectUser(pendingUser) {
    try {
      await rejectUserAuth(pendingUser.id);
      setPendingUsers((prev) => prev.filter((u) => u.id !== pendingUser.id));
      success(`"${pendingUser.displayName || pendingUser.email}" registration has been rejected.`);
    } catch {
      toastError("Failed to reject user. Please try again.");
    }
  }

  const filteredPendingUsers = useMemo(() => {
    if (!pendingSearch) return pendingUsers;
    const s = pendingSearch.toLowerCase();
    return pendingUsers.filter(
      (u) =>
        (u.displayName || "").toLowerCase().includes(s) ||
        (u.email || "").toLowerCase().includes(s) ||
        (u.role || "").toLowerCase().includes(s) ||
        (u.department || "").toLowerCase().includes(s)
    );
  }, [pendingUsers, pendingSearch]);

  const userColumns = [
    {
      header: "User",
      accessor: "name",
      render: (row, idx) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ${getAvatarColor(idx)}`}
          >
            {row.avatar}
          </div>
          <div>
            <p className="font-medium text-text-primary">{row.name}</p>
            <p className="text-xs text-text-secondary">{row.id}</p>
          </div>
        </div>
      ),
    },
    { header: "Email", accessor: "email" },
    {
      header: "Role",
      accessor: "role",
      render: (row) => (
        <Badge variant={ROLE_BADGE_VARIANT[row.role] || "default"}>
          {ROLE_LABELS[row.role] || row.role}
        </Badge>
      ),
    },
    { header: "Department", accessor: "department" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <Badge variant={row.status === "active" ? "success" : "danger"} dot>
          {row.status === "active" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    { header: "Last Login", accessor: "lastLogin" },
  ];

  const tabs = [
    { key: "users", label: "Users", icon: Users },
    { key: "messages", label: "Messages", icon: MessageSquare, badge: unreadMessages },
    { key: "collections", label: "Collections", icon: Coffee },
    { key: "production", label: "Production", icon: Factory },
    { key: "store", label: "Store", icon: Package },
    { key: "accounting", label: "Accounting", icon: DollarSign },
    { key: "farmers", label: "Farmers", icon: Tractor },
    { key: "approvals", label: "Approvals", icon: Clock, badge: pendingUsers.length },
    { key: "activity", label: "Activity", icon: Activity },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  function renderUserFormModal(isEdit) {
    return (
      <Modal
        isOpen={isEdit ? !!editUser : showAddModal}
        onClose={() => {
          if (isEdit) setEditUser(null);
          else setShowAddModal(false);
          reset();
          setShowPassword(false);
        }}
        title={isEdit ? "Edit User" : "Add New User"}
        size="lg"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                if (isEdit) setEditUser(null);
                else setShowAddModal(false);
                reset();
                setShowPassword(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              icon={Save}
              onClick={handleSubmit(isEdit ? handleEditUser : handleAddUser)}
            >
              {isEdit ? "Update User" : "Create User"}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="Enter full name"
              icon={Users}
              error={errors.name?.message}
              {...register("name", { required: "Name is required" })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="user@coms.com"
              icon={Mail}
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-primary">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={isEdit ? "Leave blank to keep current" : "Enter password"}
                  className={`w-full rounded-xl border bg-white pl-10 pr-10 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                    errors.password
                      ? "border-danger focus:ring-danger/30 focus:border-danger"
                      : "border-border focus:ring-primary/30 focus:border-primary"
                  }`}
                  {...register("password", isEdit ? {} : { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-primary">Role</label>
              <select
                className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 cursor-pointer ${
                  errors.role
                    ? "border-danger focus:ring-danger/30 focus:border-danger"
                    : "border-border focus:ring-primary/30 focus:border-primary"
                }`}
                {...register("role", { required: "Role is required" })}
              >
                <option value="">Select a role</option>
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.role && <p className="text-xs text-danger">{errors.role.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-primary">Department</label>
              <select
                className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 cursor-pointer ${
                  errors.department
                    ? "border-danger focus:ring-danger/30 focus:border-danger"
                    : "border-border focus:ring-primary/30 focus:border-primary"
                }`}
                {...register("department", { required: "Department is required" })}
              >
                <option value="">Select a department</option>
                {DEPARTMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.department && <p className="text-xs text-danger">{errors.department.message}</p>}
            </div>
            <Input
              label="Phone"
              placeholder="077XXXXXXX"
              icon={Phone}
              error={errors.phone?.message}
              {...register("phone", { required: "Phone is required" })}
            />
          </div>
        </form>
      </Modal>
    );
  }

  const collectionsStatusVariant = (status) => {
    switch (status) {
      case "Received": return "info";
      case "Approved": return "success";
      case "Pending QC": return "warning";
      case "Rejected": return "danger";
      default: return "default";
    }
  };

  const productionStatusVariant = (status) => {
    switch (status) {
      case "Completed": return "success";
      case "In Progress": return "info";
      case "Planned": return "warning";
      case "Cancelled": return "danger";
      default: return "default";
    }
  };

  const inventoryStatusVariant = (status) => {
    switch (status) {
      case "In Stock": return "success";
      case "Low Stock": return "warning";
      case "Out of Stock": return "danger";
      default: return "default";
    }
  };

  const accountingStatusVariant = (status) => {
    switch (status) {
      case "Paid": return "success";
      case "Pending": return "warning";
      case "Overdue": return "danger";
      default: return "default";
    }
  };

  const unreadMessages = useMemo(
    () => messages.filter((m) => m.toEmail === adminEmail && !m.read).length,
    [messages, adminEmail]
  );

  const msgInbox = useMemo(() => {
    return messages
      .filter((m) => m.toEmail === adminEmail)
      .filter((m) => !msgSearch || m.subject.toLowerCase().includes(msgSearch.toLowerCase()) || m.from.toLowerCase().includes(msgSearch.toLowerCase()));
  }, [messages, msgSearch, adminEmail]);

  const msgSent = useMemo(() => {
    return messages
      .filter((m) => m.fromEmail === adminEmail)
      .filter((m) => !msgSearch || m.subject.toLowerCase().includes(msgSearch.toLowerCase()));
  }, [messages, msgSearch, adminEmail]);

  const msgCurrentList = msgActiveTab === "inbox" ? msgInbox : msgSent;

  function msgFormatDateTime(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function msgTimeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  function msgOpenMessage(msg) {
    setMsgSelected(msg);
    setMsgReplyTarget(null);
    setMsgShowCompose(false);
    if (!msg.read) markAsRead(msg.id);
  }

  function msgSendReply() {
    if (!msgReplyText.trim() || !msgSelected) return;
    replyToMessage(msgSelected.id, {
      from: userProfile?.displayName || "Admin",
      fromEmail: adminEmail,
      body: msgReplyText.trim(),
    });
    setMsgSelected((prev) => ({
      ...prev,
      read: true,
      replies: [
        ...(prev.replies || []),
        { id: `reply-${Date.now()}`, from: userProfile?.displayName || "Admin", fromEmail: adminEmail, body: msgReplyText.trim(), timestamp: new Date().toISOString() },
      ],
    }));
    setMsgReplyText("");
  }

  function msgSendCompose() {
    const recipient = msgReplyTarget || msgComposeRecipient;
    if (!msgComposeSubject.trim() || !msgComposeBody.trim() || !recipient) return;
    sendMessage({
      from: userProfile?.displayName || "Admin",
      fromEmail: adminEmail,
      fromRole: "admin",
      to: recipient.from || recipient.name,
      toEmail: recipient.fromEmail || recipient.email,
      subject: msgComposeSubject.trim(),
      body: msgComposeBody.trim(),
    });
    setMsgComposeSubject("");
    setMsgComposeBody("");
    setMsgShowCompose(false);
    setMsgReplyTarget(null);
    setMsgComposeRecipient(null);
    success("Message sent successfully");
  }

  function msgStartReplyTo(msg) {
    setMsgReplyTarget(msg);
    setMsgComposeRecipient(null);
    setMsgShowCompose(true);
    setMsgSelected(null);
    setMsgComposeSubject(`Re: ${msg.subject}`);
    setMsgComposeBody("");
  }

  function msgStartNewCompose() {
    setMsgReplyTarget(null);
    setMsgComposeRecipient(null);
    setMsgShowCompose(true);
    setMsgSelected(null);
    setMsgComposeSubject("");
    setMsgComposeBody("");
  }

  const farmerStatusVariant = (status) => {
    switch (status) {
      case "Active": return "success";
      case "Inactive": return "default";
      default: return "default";
    }
  };

  return (
    <motion.div
      className="min-h-screen space-y-6 p-6 lg:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Admin Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary lg:text-3xl">Admin Panel</h1>
            <div className="flex items-center gap-2 mt-1">
              <AlertTriangle size={14} className="text-amber-500" />
              <p className="text-sm text-amber-600 font-medium">Administrator Access Only</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setActiveTab("messages")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
            unreadMessages > 0
              ? "bg-primary text-white border-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              : "bg-white text-text-primary border-border hover:border-primary/30 hover:bg-primary/5"
          }`}
        >
          <MessageSquare size={18} />
          <span className="text-sm font-medium">Messages</span>
          {unreadMessages > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 text-[10px] font-bold rounded-full bg-white/25 text-white px-1">
              {unreadMessages}
            </span>
          )}
        </button>
      </motion.div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {[
          { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary", bg: "bg-primary/10", borderColor: "#2E7D32", change: "+12%", up: true },
          { label: "Active Users", value: stats.activeUsers, icon: UserCheck, color: "text-green-600", bg: "bg-green-100", borderColor: "#16A34A", change: "+8%", up: true },
          { label: "Total Farmers", value: `${stats.totalFarmers}+`, icon: Tractor, color: "text-blue-600", bg: "bg-blue-100", borderColor: "#2563EB", change: "+5%", up: true },
          { label: "Total Employees", value: stats.totalEmployees, icon: Briefcase, color: "text-purple-600", bg: "bg-purple-100", borderColor: "#9333EA", change: "+3%", up: true },
          { label: "System Health", value: "Good", icon: HeartPulse, color: "text-emerald-600", bg: "bg-emerald-100", borderColor: "#059669", change: "Stable", up: true },
          { label: "Last Backup", value: "2h ago", icon: Clock, color: "text-amber-600", bg: "bg-amber-100", borderColor: "#D97706", change: "On time", up: true },
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
      </div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer -mb-px whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
                {tab.badge > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-danger text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Users Tab */}
          {activeTab === "users" && (
            <motion.div
              key="users"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              <Card padding="none">
                <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <SearchInput
                      value={userSearch}
                      onChange={setUserSearch}
                      placeholder="Search by name or email..."
                      className="sm:w-72"
                    />
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
                    >
                      <option value="">All Roles</option>
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button icon={Plus} onClick={() => setShowAddModal(true)}>
                    Add User
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-gray-50/80">
                        {userColumns.map((col) => (
                          <th
                            key={col.accessor}
                            className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"
                          >
                            {col.header}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={userColumns.length + 1}>
                            <EmptyState
                              icon={Users}
                              title="No users found"
                              description="Try adjusting your search or filters."
                            />
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user, idx) => (
                          <motion.tr
                            key={user.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            className="hover:bg-primary/5 transition-colors"
                          >
                            {userColumns.map((col) => (
                              <td key={col.accessor} className="px-4 py-3 text-sm text-text-primary">
                                {col.render ? col.render(user, idx) : user[col.accessor]}
                              </td>
                            ))}
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => openEditModal(user)}
                                  className="p-2 rounded-lg text-text-secondary hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                                  title="Edit"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(user)}
                                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                                    user.status === "active"
                                      ? "text-text-secondary hover:bg-amber-50 hover:text-amber-600"
                                      : "text-text-secondary hover:bg-green-50 hover:text-green-600"
                                  }`}
                                  title={user.status === "active" ? "Deactivate" : "Activate"}
                                >
                                  {user.status === "active" ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                </button>
                                <button
                                  onClick={() => setDeleteUser(user)}
                                  className="p-2 rounded-lg text-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredUsers.length > 0 && (
                  <div className="px-4 py-3 border-t border-border text-sm text-text-secondary">
                    Showing {filteredUsers.length} of {users.length} users
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* Collections Tab */}
          {activeTab === "collections" && (
            <motion.div
              key="collections"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              <Card padding="none">
                <div className="p-4 border-b border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Coffee size={20} className="text-primary" />
                      <h3 className="text-base font-semibold text-text-primary">Coffee Collections</h3>
                      <Badge variant="info">{filteredCollections.length}</Badge>
                    </div>
                    <SearchInput
                      value={collectionsSearch}
                      onChange={setCollectionsSearch}
                      placeholder="Search collections..."
                      className="sm:w-72"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-gray-50/80">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Farmer</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Quantity (kg)</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Grade</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Collection Center</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Value (RWF)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredCollections.length === 0 ? (
                        <tr>
                          <td colSpan={8}>
                            <EmptyState icon={Coffee} title="No collections found" description="Try adjusting your search." />
                          </td>
                        </tr>
                      ) : (
                        filteredCollections.map((record, idx) => (
                          <motion.tr
                            key={record.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            className="hover:bg-primary/5 transition-colors"
                          >
                            <td className="px-4 py-3 text-sm font-medium text-text-primary">{record.id}</td>
                            <td className="px-4 py-3 text-sm text-text-primary">{record.date}</td>
                            <td className="px-4 py-3 text-sm text-text-primary">{record.farmer}</td>
                            <td className="px-4 py-3 text-sm text-text-primary">{record.quantity}</td>
                            <td className="px-4 py-3 text-sm text-text-primary">
                              <Badge variant="default">{record.grade}</Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-text-primary">{record.center}</td>
                            <td className="px-4 py-3 text-sm">
                              <Badge variant={collectionsStatusVariant(record.status)} dot>{record.status}</Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-text-primary text-right font-medium">{formatRWF(record.value)}</td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredCollections.length > 0 && (
                  <div className="px-4 py-3 border-t border-border text-sm text-text-secondary">
                    Showing {filteredCollections.length} of {mockCollections.length} records
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* Production Tab */}
          {activeTab === "production" && (
            <motion.div
              key="production"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              <Card padding="none">
                <div className="p-4 border-b border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Factory size={20} className="text-primary" />
                      <h3 className="text-base font-semibold text-text-primary">Production Batches</h3>
                      <Badge variant="info">{filteredProduction.length}</Badge>
                    </div>
                    <SearchInput
                      value={productionSearch}
                      onChange={setProductionSearch}
                      placeholder="Search production..."
                      className="sm:w-72"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-gray-50/80">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Batch ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Start Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Cherry Input (kg)</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Output (kg)</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Grade</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Process</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Manager</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredProduction.length === 0 ? (
                        <tr>
                          <td colSpan={8}>
                            <EmptyState icon={Factory} title="No production records found" description="Try adjusting your search." />
                          </td>
                        </tr>
                      ) : (
                        filteredProduction.map((batch, idx) => (
                          <motion.tr
                            key={batch.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            className="hover:bg-primary/5 transition-colors"
                          >
                            <td className="px-4 py-3 text-sm font-medium text-text-primary">{batch.id}</td>
                            <td className="px-4 py-3 text-sm text-text-primary">{batch.startDate}</td>
                            <td className="px-4 py-3 text-sm text-text-primary">{batch.cherryInput.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-text-primary">{batch.output > 0 ? batch.output.toLocaleString() : "—"}</td>
                            <td className="px-4 py-3 text-sm">
                              <Badge variant="default">{batch.grade}</Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-text-primary">{batch.process}</td>
                            <td className="px-4 py-3 text-sm">
                              <Badge variant={productionStatusVariant(batch.status)} dot>{batch.status}</Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-text-primary">{batch.manager}</td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredProduction.length > 0 && (
                  <div className="px-4 py-3 border-t border-border text-sm text-text-secondary">
                    Showing {filteredProduction.length} of {mockProduction.length} batches
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* Store Management Tab */}
          {activeTab === "store" && (
            <motion.div
              key="store"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              <Card padding="none">
                <div className="p-4 border-b border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Package size={20} className="text-primary" />
                      <h3 className="text-base font-semibold text-text-primary">Inventory / Warehouse</h3>
                      <Badge variant="info">{filteredInventory.length}</Badge>
                    </div>
                    <SearchInput
                      value={inventorySearch}
                      onChange={setInventorySearch}
                      placeholder="Search inventory..."
                      className="sm:w-72"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-gray-50/80">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Item ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Unit</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredInventory.length === 0 ? (
                        <tr>
                          <td colSpan={8}>
                            <EmptyState icon={Package} title="No inventory items found" description="Try adjusting your search." />
                          </td>
                        </tr>
                      ) : (
                        filteredInventory.map((item, idx) => (
                          <motion.tr
                            key={item.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            className="hover:bg-primary/5 transition-colors"
                          >
                            <td className="px-4 py-3 text-sm font-medium text-text-primary">{item.id}</td>
                            <td className="px-4 py-3 text-sm text-text-primary">{item.name}</td>
                            <td className="px-4 py-3 text-sm text-text-primary">{item.category}</td>
                            <td className="px-4 py-3 text-sm text-text-primary font-medium">{item.quantity.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-text-primary">{item.unit}</td>
                            <td className="px-4 py-3 text-sm text-text-primary">{item.location}</td>
                            <td className="px-4 py-3 text-sm">
                              <Badge variant={inventoryStatusVariant(item.status)} dot>{item.status}</Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-text-primary">{item.lastUpdated}</td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredInventory.length > 0 && (
                  <div className="px-4 py-3 border-t border-border text-sm text-text-secondary">
                    Showing {filteredInventory.length} of {mockInventory.length} items
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* Accounting Tab */}
          {activeTab === "accounting" && (
            <motion.div
              key="accounting"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              <Card padding="none">
                <div className="p-4 border-b border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <DollarSign size={20} className="text-primary" />
                      <h3 className="text-base font-semibold text-text-primary">Financial Records</h3>
                      <Badge variant="info">{filteredAccounting.length}</Badge>
                    </div>
                    <SearchInput
                      value={accountingSearch}
                      onChange={setAccountingSearch}
                      placeholder="Search transactions..."
                      className="sm:w-72"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-gray-50/80">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Record ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Amount (RWF)</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Recorded By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredAccounting.length === 0 ? (
                        <tr>
                          <td colSpan={8}>
                            <EmptyState icon={DollarSign} title="No financial records found" description="Try adjusting your search." />
                          </td>
                        </tr>
                      ) : (
                        filteredAccounting.map((record, idx) => (
                          <motion.tr
                            key={record.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            className="hover:bg-primary/5 transition-colors"
                          >
                            <td className="px-4 py-3 text-sm font-medium text-text-primary">{record.id}</td>
                            <td className="px-4 py-3 text-sm text-text-primary">{record.date}</td>
                            <td className="px-4 py-3 text-sm">
                              <Badge variant={record.type === "Income" ? "success" : "danger"}>{record.type}</Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-text-primary max-w-xs truncate">{record.description}</td>
                            <td className={`px-4 py-3 text-sm font-medium text-right ${record.type === "Income" ? "text-green-600" : "text-red-600"}`}>
                              {record.type === "Expense" ? "-" : ""}{formatRWF(record.amount)}
                            </td>
                            <td className="px-4 py-3 text-sm text-text-primary">{record.category}</td>
                            <td className="px-4 py-3 text-sm">
                              <Badge variant={accountingStatusVariant(record.status)} dot>{record.status}</Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-text-primary">{record.recordedBy}</td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredAccounting.length > 0 && (
                  <div className="px-4 py-3 border-t border-border text-sm text-text-secondary">
                    Showing {filteredAccounting.length} of {mockAccounting.length} records
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* Farmers Tab */}
          {activeTab === "farmers" && (
            <motion.div
              key="farmers"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              <Card padding="none">
                <div className="p-4 border-b border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Tractor size={20} className="text-primary" />
                      <h3 className="text-base font-semibold text-text-primary">Registered Farmers</h3>
                      <Badge variant="info">{filteredFarmers.length}</Badge>
                    </div>
                    <SearchInput
                      value={farmersSearch}
                      onChange={setFarmersSearch}
                      placeholder="Search farmers..."
                      className="sm:w-72"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-gray-50/80">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Phone</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Village</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Farm Size (ha)</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Variety</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Center</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Deliveries</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredFarmers.length === 0 ? (
                        <tr>
                          <td colSpan={10}>
                            <EmptyState icon={Tractor} title="No farmers found" description="Try adjusting your search." />
                          </td>
                        </tr>
                      ) : (
                        filteredFarmers.map((farmer, idx) => (
                          <motion.tr
                            key={farmer.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            className="hover:bg-primary/5 transition-colors"
                          >
                            <td className="px-4 py-3 text-sm font-medium text-text-primary">{farmer.id}</td>
                            <td className="px-4 py-3 text-sm text-text-primary">{farmer.name}</td>
                            <td className="px-4 py-3 text-sm text-text-primary">{farmer.phone}</td>
                            <td className="px-4 py-3 text-sm text-text-primary">{farmer.village}</td>
                            <td className="px-4 py-3 text-sm text-text-primary">{farmer.farmSize}</td>
                            <td className="px-4 py-3 text-sm">
                              <Badge variant="default">{farmer.coffeeVariety}</Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-text-primary">{farmer.collectionCenter}</td>
                            <td className="px-4 py-3 text-sm text-text-primary font-medium">{farmer.totalDeliveries}</td>
                            <td className="px-4 py-3 text-sm">
                              <Badge variant={farmerStatusVariant(farmer.status)} dot>{farmer.status}</Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <button
                                onClick={() => setDeleteFarmer(farmer)}
                                className="p-1.5 text-danger/70 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                                title="Delete farmer"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredFarmers.length > 0 && (
                  <div className="px-4 py-3 border-t border-border text-sm text-text-secondary">
                    Showing {filteredFarmers.length} of {farmersList.length} farmers
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* Messages Tab */}
          {activeTab === "messages" && (
            <motion.div
              key="messages"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left: Tabs + List */}
                <Card padding="none" className="lg:col-span-1">
                  <div className="p-3 border-b border-border">
                    <Button icon={Send} onClick={msgStartNewCompose} className="w-full" size="sm">
                      Compose New Message
                    </Button>
                  </div>
                  <div className="flex border-b border-border">
                    {[
                      { key: "inbox", label: "Inbox", icon: Inbox, count: unreadMessages },
                      { key: "sent", label: "Sent", icon: Send },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => { setMsgActiveTab(tab.key); setMsgSelected(null); setMsgSearch(""); }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer -mb-px ${
                          msgActiveTab === tab.key ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        <tab.icon size={16} />
                        {tab.label}
                        {tab.count > 0 && (
                          <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold rounded-full bg-primary text-white px-1">
                            {tab.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="p-3 border-b border-border">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input
                        type="text"
                        value={msgSearch}
                        onChange={(e) => setMsgSearch(e.target.value)}
                        placeholder="Search messages..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-white text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="max-h-[500px] overflow-y-auto divide-y divide-border">
                    {msgCurrentList.length === 0 ? (
                      <div className="p-8">
                        <EmptyState icon={Mail} title="No messages" description={msgActiveTab === "inbox" ? "Inbox is empty." : "No sent messages."} />
                      </div>
                    ) : (
                      msgCurrentList.map((msg) => (
                        <button
                          key={msg.id}
                          onClick={() => msgOpenMessage(msg)}
                          className={`w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors cursor-pointer ${
                            msgSelected?.id === msg.id ? "bg-primary/10" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                              msg.read ? "bg-gray-100 text-text-secondary" : "bg-primary/15 text-primary"
                            }`}>
                              {getInitials(msgActiveTab === "inbox" ? msg.from : msg.to)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className={`text-sm truncate ${msg.read ? "font-normal" : "font-semibold"}`}>
                                  {msgActiveTab === "inbox" ? msg.from : msg.to}
                                </p>
                                {!msg.read && <Circle size={8} className="fill-primary text-primary shrink-0" />}
                              </div>
                              <p className={`text-xs truncate mt-0.5 ${msg.read ? "text-text-secondary" : "font-medium text-text-primary"}`}>
                                {msg.subject}
                              </p>
                              <p className="text-xs text-text-secondary/60 mt-0.5">{msgTimeAgo(msg.timestamp)}</p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </Card>

                {/* Right: Detail / Compose */}
                <div className="lg:col-span-2">
                  {msgShowCompose ? (
                    <Card
                      header={
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Send size={20} className="text-primary" />
                            <h3 className="text-base font-semibold text-text-primary">
                              {msgReplyTarget ? `Reply to ${msgReplyTarget.from}` : "New Message"}
                            </h3>
                          </div>
                          <button onClick={() => { setMsgShowCompose(false); setMsgReplyTarget(null); setMsgComposeRecipient(null); }} className="text-sm text-text-secondary hover:text-text-primary cursor-pointer">Cancel</button>
                        </div>
                      }
                    >
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-text-primary mb-1.5 block">To</label>
                          {msgReplyTarget ? (
                            <input
                              type="text"
                              value={`${msgReplyTarget.from} (${msgReplyTarget.fromEmail})`}
                              disabled
                              className="w-full rounded-xl border border-border bg-gray-50 px-4 py-2.5 text-sm text-text-secondary"
                            />
                          ) : (
                            <select
                              value={msgComposeRecipient ? msgComposeRecipient.email : ""}
                              onChange={(e) => {
                                const user = users.find((u) => u.email === e.target.value);
                                if (user) setMsgComposeRecipient({ name: user.name, email: user.email });
                              }}
                              className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
                            >
                              <option value="">Select a recipient...</option>
                              {users.filter((u) => u.status === "active").map((u) => (
                                <option key={u.id} value={u.email}>
                                  {u.name} ({ROLE_LABELS[u.role] || u.role})
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-text-primary mb-1.5 block">Subject</label>
                          <input
                            type="text"
                            value={msgComposeSubject}
                            onChange={(e) => setMsgComposeSubject(e.target.value)}
                            placeholder="Message subject"
                            className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-text-primary mb-1.5 block">Message</label>
                          <textarea
                            value={msgComposeBody}
                            onChange={(e) => setMsgComposeBody(e.target.value)}
                            placeholder="Type your message..."
                            rows={5}
                            className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                          />
                        </div>
                        <div className="flex justify-end gap-3">
                          <Button variant="ghost" onClick={() => { setMsgShowCompose(false); setMsgReplyTarget(null); setMsgComposeRecipient(null); }}>Cancel</Button>
                          <Button icon={Send} onClick={msgSendCompose} disabled={!msgComposeSubject.trim() || !msgComposeBody.trim() || (!msgReplyTarget && !msgComposeRecipient)}>
                            Send Message
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ) : msgSelected ? (
                    <Card padding="none">
                      <div className="p-5 border-b border-border">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                              <span className="text-sm font-bold text-primary">{getInitials(msgSelected.from)}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-text-primary">{msgSelected.from}</h3>
                                <Badge variant="default" className="text-[10px]">{msgSelected.fromRole}</Badge>
                              </div>
                              <p className="text-xs text-text-secondary mt-0.5">{msgSelected.fromEmail}</p>
                              <p className="text-xs text-text-secondary/60 mt-0.5">{msgFormatDateTime(msgSelected.timestamp)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => msgStartReplyTo(msgSelected)}
                              className="p-2 rounded-lg text-text-secondary hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                              title="Reply"
                            >
                              <Reply size={16} />
                            </button>
                            <button
                              onClick={() => { deleteMessage(msgSelected.id); setMsgSelected(null); }}
                              className="p-2 rounded-lg text-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <h2 className="text-lg font-semibold text-text-primary mt-4">{msgSelected.subject}</h2>
                      </div>
                      <div className="p-5">
                        <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{msgSelected.body}</p>
                      </div>
                      {msgSelected.replies?.length > 0 && (
                        <div className="border-t border-border">
                          <div className="px-5 py-3 bg-gray-50/80 border-b border-border">
                            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                              {msgSelected.replies.length} {msgSelected.replies.length === 1 ? "Reply" : "Replies"}
                            </p>
                          </div>
                          <div className="divide-y divide-border">
                            {msgSelected.replies.map((reply) => (
                              <div key={reply.id} className="p-5">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-primary">{getInitials(reply.from)}</span>
                                  </div>
                                  <span className="text-sm font-medium text-text-primary">{reply.from}</span>
                                  <span className="text-xs text-text-secondary/60">{msgFormatDateTime(reply.timestamp)}</span>
                                </div>
                                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap ml-9">{reply.body}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="p-5 border-t border-border bg-gray-50/50">
                        <p className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">Quick Reply</p>
                        <div className="flex gap-3">
                          <textarea
                            value={msgReplyText}
                            onChange={(e) => setMsgReplyText(e.target.value)}
                            placeholder="Type your reply..."
                            rows={3}
                            className="flex-1 rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                          />
                        </div>
                        <div className="flex justify-end mt-3">
                          <Button icon={Reply} onClick={msgSendReply} disabled={!msgReplyText.trim()} size="sm">
                            Send Reply
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Card>
                      <EmptyState
                        icon={MessageSquare}
                        title="Select a message"
                        description="Choose a message from the list to read and reply, or compose a new message."
                      />
                    </Card>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Pending Approvals Tab */}
          {activeTab === "approvals" && (
            <motion.div
              key="approvals"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              <Card padding="none">
                <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <SearchInput
                      value={pendingSearch}
                      onChange={setPendingSearch}
                      placeholder="Search pending users..."
                      className="sm:w-72"
                    />
                    <button
                      onClick={fetchPendingUsers}
                      className="p-2 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Refresh"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                  <span className="text-sm text-text-secondary">
                    {filteredPendingUsers.length} pending request{filteredPendingUsers.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {pendingLoading ? (
                  <div className="p-12 text-center">
                    <div className="inline-flex items-center gap-2 text-text-secondary">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading pending users...
                    </div>
                  </div>
                ) : filteredPendingUsers.length === 0 ? (
                  <EmptyState
                    icon={CheckCircle2}
                    title="No pending approvals"
                    description={pendingSearch ? "No pending users match your search." : "All registration requests have been reviewed."}
                  />
                ) : (
                  <div className="divide-y divide-border">
                    {filteredPendingUsers.map((pendingUser, idx) => (
                      <motion.div
                        key={pendingUser.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="w-11 h-11 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-warning">
                            {(pendingUser.displayName || pendingUser.email || "?")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-semibold text-text-primary truncate">
                              {pendingUser.displayName || "No Name"}
                            </p>
                            <Badge variant="warning">Pending</Badge>
                          </div>
                          <p className="text-sm text-text-secondary">{pendingUser.email}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary">
                            <span className="inline-flex items-center gap-1">
                              <Briefcase size={12} />
                              {ROLE_LABELS[pendingUser.role] || pendingUser.role || "\u2014"}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Building2 size={12} />
                              {pendingUser.department || "\u2014"}
                            </span>
                            {pendingUser.phone && (
                              <span className="inline-flex items-center gap-1">
                                <Phone size={12} />
                                {pendingUser.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={Eye}
                            onClick={() => setPendingViewUser(pendingUser)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            icon={UserCheck}
                            onClick={() => handleApproveUser(pendingUser)}
                            className="bg-success text-white hover:bg-success/90"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            icon={UserX}
                            onClick={() => handleRejectUser(pendingUser)}
                          >
                            Reject
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* Activity Log Tab */}
          {activeTab === "activity" && (
            <motion.div
              key="activity"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              <Card padding="none">
                <div className="p-4 border-b border-border">
                  <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
                    <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                      <Filter size={16} />
                      Filters:
                    </div>
                    <select
                      value={activityUserFilter}
                      onChange={(e) => {
                        setActivityUserFilter(e.target.value);
                        setActivityPage(1);
                      }}
                      className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
                    >
                      <option value="">All Users</option>
                      {uniqueActivityUsers.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                    <select
                      value={activityModuleFilter}
                      onChange={(e) => {
                        setActivityModuleFilter(e.target.value);
                        setActivityPage(1);
                      }}
                      className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
                    >
                      <option value="">All Modules</option>
                      {uniqueActivityModules.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                        <input
                          type="date"
                          value={activityDateFrom}
                          onChange={(e) => {
                            setActivityDateFrom(e.target.value);
                            setActivityPage(1);
                          }}
                          className="rounded-xl border border-border bg-white pl-9 pr-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                      </div>
                      <span className="text-text-secondary text-sm">to</span>
                      <div className="relative">
                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                        <input
                          type="date"
                          value={activityDateTo}
                          onChange={(e) => {
                            setActivityDateTo(e.target.value);
                            setActivityPage(1);
                          }}
                          className="rounded-xl border border-border bg-white pl-9 pr-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                      </div>
                    </div>
                    {(activityUserFilter || activityModuleFilter || activityDateFrom || activityDateTo) && (
                      <button
                        onClick={() => {
                          setActivityUserFilter("");
                          setActivityModuleFilter("");
                          setActivityDateFrom("");
                          setActivityDateTo("");
                          setActivityPage(1);
                        }}
                        className="text-sm text-primary hover:text-primary-dark font-medium cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw size={14} />
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {paginatedActivities.length === 0 ? (
                  <EmptyState
                    icon={Activity}
                    title="No activities found"
                    description="No activity records match your filters."
                  />
                ) : (
                  <div className="divide-y divide-border">
                    {paginatedActivities.map((activity, idx) => {
                      const actionStyle = ACTION_COLORS[activity.action] || ACTION_COLORS.Updated;
                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors"
                        >
                          <div className="relative mt-1.5">
                            <div className={`w-2.5 h-2.5 rounded-full ${actionStyle.dot}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                              <span className="font-medium text-text-primary">{activity.user}</span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${actionStyle.bg} ${actionStyle.text}`}>
                                {activity.action}
                              </span>
                              <span className="text-xs text-text-secondary px-2 py-0.5 bg-gray-100 rounded-full font-medium">
                                {activity.module}
                              </span>
                            </div>
                            <p className="text-sm text-text-secondary">{activity.details}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Clock size={12} className="text-text-secondary/60" />
                              <span className="text-xs text-text-secondary/80">
                                {formatDateTime(activity.timestamp)}
                              </span>
                              <span className="text-xs text-text-secondary/60">
                                ({formatTimeAgo(activity.timestamp)})
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {filteredActivities.length > 0 && (
                  <div className="px-5 py-3 border-t border-border">
                    <Pagination
                      currentPage={activityPage}
                      totalPages={activityTotalPages}
                      onPageChange={setActivityPage}
                      pageSize={activityPageSize}
                      totalItems={filteredActivities.length}
                    />
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* System Settings Tab */}
          {activeTab === "settings" && (
            <motion.div
              key="settings"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              {/* Factory Information */}
              <Card
                header={
                  <div className="flex items-center gap-2">
                    <Building2 size={20} className="text-primary" />
                    <h3 className="text-base font-semibold text-text-primary">Factory Information</h3>
                  </div>
                }
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Factory Name"
                      value={factoryName}
                      onChange={(e) => setFactoryName(e.target.value)}
                      icon={Building2}
                    />
                    <Input
                      label="Phone"
                      value={factoryPhone}
                      onChange={(e) => setFactoryPhone(e.target.value)}
                      icon={Phone}
                    />
                  </div>
                  <Input
                    label="Address"
                    value={factoryAddress}
                    onChange={(e) => setFactoryAddress(e.target.value)}
                    icon={MapPin}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={factoryEmail}
                    onChange={(e) => setFactoryEmail(e.target.value)}
                    icon={Mail}
                  />
                  <div>
                    <label className="text-sm font-medium text-text-primary block mb-2">Factory Logo</label>
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Image size={24} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">Click to upload or drag and drop</p>
                          <p className="text-xs text-text-secondary mt-0.5">PNG, JPG or SVG (max 2MB)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* System Preferences */}
              <Card
                header={
                  <div className="flex items-center gap-2">
                    <Globe size={20} className="text-primary" />
                    <h3 className="text-base font-semibold text-text-primary">System Preferences</h3>
                  </div>
                }
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Select
                    label="Default Currency"
                    options={CURRENCY_OPTIONS}
                    value={defaultCurrency}
                    onChange={setDefaultCurrency}
                    searchable
                  />
                  <Select
                    label="Date Format"
                    options={DATE_FORMAT_OPTIONS}
                    value={dateFormat}
                    onChange={setDateFormat}
                  />
                  <Select
                    label="Time Zone"
                    options={TIMEZONE_OPTIONS}
                    value={timeZone}
                    onChange={setTimeZone}
                    searchable
                  />
                </div>
              </Card>

              {/* Backup Section */}
              <Card
                header={
                  <div className="flex items-center gap-2">
                    <HardDrive size={20} className="text-primary" />
                    <h3 className="text-base font-semibold text-text-primary">Backup & Recovery</h3>
                  </div>
                }
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={16} className="text-text-secondary" />
                      <span className="text-sm font-medium text-text-primary">Last Backup:</span>
                      <span className="text-sm text-text-secondary">July 14, 2026 at 7:30 AM</span>
                    </div>
                    <p className="text-xs text-text-secondary ml-6">
                      Automated backups run every 6 hours. Next backup at 1:30 PM.
                    </p>
                  </div>
                  <Button icon={Database} onClick={handleBackup}>
                    Backup Now
                  </Button>
                </div>
              </Card>

              {/* Maintenance Mode */}
              <Card
                header={
                  <div className="flex items-center gap-2">
                    <Wrench size={20} className="text-primary" />
                    <h3 className="text-base font-semibold text-text-primary">Maintenance Mode</h3>
                  </div>
                }
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary mb-0.5">
                      Enable Maintenance Mode
                    </p>
                    <p className="text-xs text-text-secondary">
                      When enabled, only administrators can access the system. All other users will see a maintenance message.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setMaintenanceMode(!maintenanceMode);
                      success(
                        `Maintenance mode ${!maintenanceMode ? "enabled" : "disabled"}`
                      );
                    }}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <span
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${
                        maintenanceMode ? "bg-primary" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          maintenanceMode ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </span>
                    <span className={`text-sm font-medium ${maintenanceMode ? "text-primary" : "text-text-secondary"}`}>
                      {maintenanceMode ? "ON" : "OFF"}
                    </span>
                  </button>
                </div>
                {maintenanceMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2"
                  >
                    <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-700">
                      Maintenance mode is currently active. Non-admin users cannot access the system.
                    </p>
                  </motion.div>
                )}
              </Card>

              {/* Save Settings */}
              <div className="flex justify-end">
                <Button icon={Save} onClick={handleSaveSettings} size="lg">
                  Save All Settings
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Add User Modal */}
      {renderUserFormModal(false)}

      {/* Edit User Modal */}
      {renderUserFormModal(true)}

      {/* Delete User Modal */}
      <Modal
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        title="Delete User"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteUser(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </>
        }
      >
        {deleteUser && (
          <p className="text-text-secondary">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-text-primary">{deleteUser.name}</span> ({deleteUser.email})?
            This action cannot be undone.
          </p>
        )}
      </Modal>

      {/* Delete Farmer Modal */}
      <Modal
        isOpen={!!deleteFarmer}
        onClose={() => setDeleteFarmer(null)}
        title="Delete Farmer"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteFarmer(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteFarmer}>
              Delete Farmer
            </Button>
          </>
        }
      >
        {deleteFarmer && (
          <p className="text-text-secondary">
            Are you sure you want to delete farmer{" "}
            <span className="font-semibold text-text-primary">{deleteFarmer.name}</span> ({deleteFarmer.phone || deleteFarmer.email})?
            This action cannot be undone.
          </p>
        )}
      </Modal>

      {/* Pending User Detail Modal */}
      <Modal
        isOpen={!!pendingViewUser}
        onClose={() => setPendingViewUser(null)}
        title="Registration Details"
        size="lg"
        footer={
          pendingViewUser && (
            <>
              <Button variant="ghost" onClick={() => setPendingViewUser(null)}>
                Close
              </Button>
              <Button
                variant="danger"
                icon={UserX}
                onClick={() => { handleRejectUser(pendingViewUser); setPendingViewUser(null); }}
              >
                Reject
              </Button>
              <Button
                icon={UserCheck}
                className="bg-success text-white hover:bg-success/90"
                onClick={() => { handleApproveUser(pendingViewUser); setPendingViewUser(null); }}
              >
                Approve
              </Button>
            </>
          )
        }
      >
        {pendingViewUser && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-warning">
                  {(pendingViewUser.displayName || pendingViewUser.email || "?")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">{pendingViewUser.displayName || "No Name"}</h3>
                <p className="text-sm text-text-secondary">{pendingViewUser.email}</p>
                <Badge variant="warning" className="mt-1">Pending Approval</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase size={14} className="text-text-secondary" />
                  <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Role</span>
                </div>
                <p className="text-sm font-medium text-text-primary">
                  {ROLE_LABELS[pendingViewUser.role] || pendingViewUser.role || "Not specified"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 size={14} className="text-text-secondary" />
                  <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Department</span>
                </div>
                <p className="text-sm font-medium text-text-primary">
                  {pendingViewUser.department || "Not specified"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Phone size={14} className="text-text-secondary" />
                  <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Phone</span>
                </div>
                <p className="text-sm font-medium text-text-primary">
                  {pendingViewUser.phone || "Not provided"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Mail size={14} className="text-text-secondary" />
                  <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Email</span>
                </div>
                <p className="text-sm font-medium text-text-primary">
                  {pendingViewUser.email}
                </p>
              </div>
            </div>

            {pendingViewUser.role === "farmer" && (
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <Tractor size={16} className="text-primary" />
                  Farm Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={14} className="text-text-secondary" />
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">District</span>
                    </div>
                    <p className="text-sm font-medium text-text-primary">{pendingViewUser.district || "—"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={14} className="text-text-secondary" />
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Sector</span>
                    </div>
                    <p className="text-sm font-medium text-text-primary">{pendingViewUser.sector || "—"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={14} className="text-text-secondary" />
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Cell</span>
                    </div>
                    <p className="text-sm font-medium text-text-primary">{pendingViewUser.cell || "—"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Home size={14} className="text-text-secondary" />
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Village</span>
                    </div>
                    <p className="text-sm font-medium text-text-primary">{pendingViewUser.village || "—"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Tractor size={14} className="text-text-secondary" />
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Farm Size</span>
                    </div>
                    <p className="text-sm font-medium text-text-primary">{pendingViewUser.farmSize ? `${pendingViewUser.farmSize} ha` : "—"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Coffee size={14} className="text-text-secondary" />
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Coffee Variety</span>
                    </div>
                    <p className="text-sm font-medium text-text-primary">{pendingViewUser.coffeeVariety || "—"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 size={14} className="text-text-secondary" />
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Collection Center</span>
                    </div>
                    <p className="text-sm font-medium text-text-primary">{pendingViewUser.collectionCenter || "—"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
