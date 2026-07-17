import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Users,
  UserCheck,
  Tractor,
  Briefcase,
  Clock,
  Search,
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Save,
  Activity,
  AlertTriangle,
  Eye,
  EyeOff,
  Filter,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Home,
  UserX,
  CheckCircle2,
  Coffee,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import SearchInput from "../../components/ui/SearchInput";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/ui/EmptyState";
import StatCard from "../../components/ui/StatCard";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../contexts/AuthContext";
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
  { id: 4, user: "Dilani Herath", action: "Updated", module: "Production", details: "Updated batch #1042 status to 'In Progress'", timestamp: "2026-07-14 08:30:00" },
  { id: 5, user: "Chaminda Rajapaksa", action: "Created", module: "Inventory", details: "Added new stock entry: 500 kg Black Coffee AA", timestamp: "2026-07-14 08:15:00" },
  { id: 6, user: "Kamal Perera", action: "Updated", module: "Employees", details: "Shift assignment updated for evening crew", timestamp: "2026-07-14 08:00:00" },
  { id: 7, user: "Anita Jayawardena", action: "Created", module: "Employees", details: "Registered new employee: Nipuni Wijesinghe - Payroll Officer", timestamp: "2026-07-14 07:45:00" },
  { id: 8, user: "Madhavi Liyanage", action: "Created", module: "Collection", details: "Recorded coffee collection: 320 kg from Nyungwe cooperative", timestamp: "2026-07-14 07:30:00" },
  { id: 9, user: "Wasantha Jayasuriya", action: "Updated", module: "Production", details: "Completed batch #1041: 320 kg green coffee processed", timestamp: "2026-07-14 07:00:00" },
  { id: 10, user: "Sunil Fernando", action: "Created", module: "Production", details: "Started new production batch #1043: Green Coffee", timestamp: "2026-07-14 06:45:00" },
  { id: 11, user: "Dissanayake Bandara", action: "Updated", module: "Settings", details: "Updated factory contact information", timestamp: "2026-07-14 06:30:00" },
  { id: 12, user: "Priya Bandara", action: "Deleted", module: "Collection", details: "Removed duplicate collection record #C-4521", timestamp: "2026-07-13 17:00:00" },
  { id: 13, user: "Kamal Perera", action: "Created", module: "Inventory", details: "Stock transfer: 200 kg from Warehouse A to Processing", timestamp: "2026-07-13 16:45:00" },
  { id: 14, user: "Nimal Silva", action: "Created", module: "Farmers", details: "Registered new farmer: Emmanuel Ndayisaba - 2.5 hectares", timestamp: "2026-07-13 16:30:00" },
  { id: 15, user: "Anita Jayawardena", action: "Updated", module: "Employees", details: "Updated leave request for Dilani Herath - Approved", timestamp: "2026-07-13 16:00:00" },
  { id: 16, user: "Dilani Herath", action: "Updated", module: "Production", details: "Quality check passed for batch #1040", timestamp: "2026-07-13 15:45:00" },
  { id: 17, user: "Chaminda Rajapaksa", action: "Deleted", module: "Inventory", details: "Removed expired stock entry: Fertilizer batch #FB-203", timestamp: "2026-07-13 15:30:00" },
  { id: 18, user: "Madhavi Liyanage", action: "Updated", module: "Farmers", details: "Updated cooperative details: Kigali Coffee Growers", timestamp: "2026-07-13 15:15:00" },
  { id: 19, user: "Sanduni Ranasinghe", action: "Created", module: "Inventory", details: "Received shipment: 1,000 kg packaging materials", timestamp: "2026-07-13 15:00:00" },
  { id: 20, user: "Kamal Perera", action: "Created", module: "Reports", details: "Generated monthly production report for June 2026", timestamp: "2026-07-13 14:30:00" },
  { id: 21, user: "Dissanayake Bandara", action: "Updated", module: "Settings", details: "System backup configuration updated", timestamp: "2026-07-13 14:15:00" },
  { id: 22, user: "Wasantha Jayasuriya", action: "Deleted", module: "Production", details: "Cancelled production batch #1039 - quality issue", timestamp: "2026-07-13 14:00:00" },
  { id: 23, user: "Nimal Silva", action: "Created", module: "Collection", details: "Recorded coffee collection: 280 kg from Huye cooperative", timestamp: "2026-07-13 13:45:00" },
  { id: 24, user: "Sunil Fernando", action: "Updated", module: "Production", details: "Adjusted processing parameters for batch #1042", timestamp: "2026-07-13 13:30:00" },
  { id: 25, user: "Lakshman Peris", action: "Created", module: "Inventory", details: "Conducted weekly inventory audit - Warehouse B", timestamp: "2026-07-13 13:15:00" },
  { id: 26, user: "Kavisha Dissanayake", action: "Updated", module: "Farmers", details: "Updated payment records for 15 farmers", timestamp: "2026-07-13 13:00:00" },
  { id: 27, user: "Anita Jayawardena", action: "Created", module: "Employees", details: "Scheduled training session for new collection officers", timestamp: "2026-07-13 12:30:00" },
  { id: 28, user: "Mahinda Gamage", action: "Updated", module: "Production", details: "Machine maintenance log updated - CTC Line 2", timestamp: "2026-07-13 12:15:00" },
  { id: 29, user: "Dissanayake Bandara", action: "Created", module: "Users", details: "Created new admin account for system auditor", timestamp: "2026-07-13 11:45:00" },
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
  const [pendingViewUser, setPendingViewUser] = useState(null);

  const [activityPage, setActivityPage] = useState(1);
  const [activityUserFilter, setActivityUserFilter] = useState("");
  const [activityModuleFilter, setActivityModuleFilter] = useState("");
  const activityPageSize = 8;

  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingSearch, setPendingSearch] = useState("");
  const [showApproveAll, setShowApproveAll] = useState(false);
  const [approvingAll, setApprovingAll] = useState(false);

  const { success, error: toastError, info } = useToast();
  const { approveUser, rejectUser: rejectUserAuth, userProfile } = useAuth();
  const { data: farmersList, loading: farmersLoading, remove: removeFarmer } = useRealtimeCollection("farmers", {
    orderByField: "joinedDate",
    orderDirection: "desc",
    seedData: farmersSeed,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
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

  const stats = useMemo(
    () => ({
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.status === "active").length,
      totalFarmers: 523,
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
      return matchUser && matchModule;
    });
  }, [activityUserFilter, activityModuleFilter]);

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
      const farmerId = deleteFarmer.id;
      await removeFarmer(farmerId);

      try {
        const { doc: firestoreDoc, deleteDoc: firestoreDeleteDoc } = await import("firebase/firestore");
        const { db } = await import("../../firebase/config");
        await firestoreDeleteDoc(firestoreDoc(db, "users", farmerId));
      } catch (err) {
        console.warn("Failed to delete corresponding user account:", err);
      }

      success(`Farmer "${deleteFarmer.name}" deleted successfully`);
    } catch (err) {
      toastError(`Failed to delete farmer "${deleteFarmer.name}". ${err.message}`);
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

  const pendingUnsubRef = useRef(null);

  const fetchPendingUsers = useCallback(async () => {
    if (pendingUnsubRef.current) {
      pendingUnsubRef.current();
      pendingUnsubRef.current = null;
    }
    setPendingLoading(true);

    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || "";
    const isDemo = !apiKey || apiKey.includes("demo") || apiKey.includes("placeholder") || apiKey.length < 20;
    if (isDemo) {
      try {
        const pending = JSON.parse(localStorage.getItem("coms_pending_users") || "[]");
        const pendingFarmers = JSON.parse(localStorage.getItem("coms_pending_farmers") || "[]");
        const usersList = pending
          .filter((u) => u.status === "pending")
          .map((u) => ({ id: u.uid || u.id, ...u }));
        const mergedList = usersList.map((u) => {
          if (u.role === "farmer") {
            const fp = pendingFarmers.find((f) => f.userId === u.id || f.id === u.id);
            if (fp) return { ...u, ...fp };
          }
          return u;
        });
        setPendingUsers(mergedList);
      } catch {
        setPendingUsers([]);
      }
      setPendingLoading(false);
      return;
    }

    try {
      const { collection, query, where, onSnapshot, doc, getDoc } = await import("firebase/firestore");
      const { db } = await import("../../firebase/config");
      const q = query(collection(db, "users"), where("status", "==", "pending"));
      pendingUnsubRef.current = onSnapshot(
        q,
        async (snapshot) => {
          const rawList = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          const mergedList = await Promise.all(
            rawList.map(async (u) => {
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
          setPendingLoading(false);
        },
        (err) => {
          console.error("Pending users snapshot error:", err);
          toastError("Failed to load pending users from the server.");
          setPendingUsers([]);
          setPendingLoading(false);
        }
      );
    } catch (err) {
      console.error("Failed to subscribe to pending users:", err);
      toastError("Could not connect to the database. Pending users unavailable.");
      setPendingUsers([]);
      setPendingLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    if (activeTab !== "approvals") return;
    fetchPendingUsers();
    return () => {
      if (pendingUnsubRef.current) {
        pendingUnsubRef.current();
        pendingUnsubRef.current = null;
      }
    };
  }, [activeTab, fetchPendingUsers]);

  async function handleApproveUser(pendingUser) {
    try {
      await approveUser(pendingUser.id);
      setPendingUsers((prev) => prev.filter((u) => u.id !== pendingUser.id));
      success(`"${pendingUser.displayName || pendingUser.name || pendingUser.email}" has been approved and can now log in.`);
    } catch (err) {
      toastError(err?.message || "Failed to approve user. Please try again.");
    }
  }

  async function handleRejectUser(pendingUser) {
    try {
      await rejectUserAuth(pendingUser.id);
      setPendingUsers((prev) => prev.filter((u) => u.id !== pendingUser.id));
      success(`"${pendingUser.displayName || pendingUser.name || pendingUser.email}" registration has been rejected.`);
    } catch (err) {
      toastError(err?.message || "Failed to reject user. Please try again.");
    }
  }

  async function handleApproveAll() {
    setApprovingAll(true);
    let approved = 0;
    let failed = 0;
    for (const pendingUser of pendingUsers) {
      try {
        await approveUser(pendingUser.id);
        approved++;
      } catch {
        failed++;
      }
    }
    setPendingUsers([]);
    setShowApproveAll(false);
    setApprovingAll(false);
    if (failed === 0) {
      success(`All ${approved} pending user${approved !== 1 ? "s" : ""} approved successfully.`);
    } else {
      toastError(`${approved} approved, ${failed} failed. Check individual entries and try again.`);
    }
  }

  const filteredPendingUsers = useMemo(() => {
    if (!pendingSearch) return pendingUsers;
    const s = pendingSearch.toLowerCase();
    return pendingUsers.filter(
      (u) =>
        (u.displayName || u.name || "").toLowerCase().includes(s) ||
        (u.email || "").toLowerCase().includes(s) ||
        (u.role || "").toLowerCase().includes(s) ||
        (u.department || "").toLowerCase().includes(s) ||
        (u.phone || "").toLowerCase().includes(s) ||
        (u.collectionCenter || "").toLowerCase().includes(s) ||
        (u.district || "").toLowerCase().includes(s)
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
  ];

  const tabs = [
    { key: "users", label: "Users", icon: Users },
    { key: "approvals", label: "Approvals", icon: Clock, badge: pendingUsers.length },
    { key: "activity", label: "Activity", icon: Activity },
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={isEdit ? "Leave blank to keep current" : "Enter password"}
                  className={`w-full rounded-xl border bg-white pl-10 pr-10 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${errors.password
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
                className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 cursor-pointer ${errors.role
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
                className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 cursor-pointer ${errors.department
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
      </motion.div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary", bg: "bg-primary/10", borderColor: "#2E7D32", change: "+12%", up: true },
          { label: "Active Users", value: stats.activeUsers, icon: UserCheck, color: "text-green-600", bg: "bg-green-100", borderColor: "#16A34A", change: "+8%", up: true },
          { label: "Total Farmers", value: `${stats.totalFarmers}+`, icon: Tractor, color: "text-blue-600", bg: "bg-blue-100", borderColor: "#2563EB", change: "+5%", up: true },
          { label: "Pending Approvals", value: pendingUsers.length, icon: Clock, color: "text-amber-600", bg: "bg-amber-100", borderColor: "#D97706", change: pendingUsers.length > 0 ? "Action needed" : "All clear", up: pendingUsers.length === 0 },
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
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer -mb-px whitespace-nowrap ${activeTab === tab.key
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
                                  className={`p-2 rounded-lg transition-colors cursor-pointer ${user.status === "active"
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
                  {filteredPendingUsers.length > 1 && (
                    <Button
                      size="sm"
                      icon={UserCheck}
                      onClick={() => setShowApproveAll(true)}
                      className="bg-success text-white hover:bg-success/90"
                    >
                      Approve All ({filteredPendingUsers.length})
                    </Button>
                  )}
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
                            {(pendingUser.displayName || pendingUser.name || pendingUser.email || "?")
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
                              {pendingUser.displayName || pendingUser.name || "No Name"}
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
                              <Coffee size={12} />
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
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
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
                    {(activityUserFilter || activityModuleFilter) && (
                      <button
                        onClick={() => {
                          setActivityUserFilter("");
                          setActivityModuleFilter("");
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
                  <Coffee size={14} className="text-text-secondary" />
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
                    <p className="text-sm font-medium text-text-primary">{pendingViewUser.district || "\u2014"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={14} className="text-text-secondary" />
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Sector</span>
                    </div>
                    <p className="text-sm font-medium text-text-primary">{pendingViewUser.sector || "\u2014"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={14} className="text-text-secondary" />
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Cell</span>
                    </div>
                    <p className="text-sm font-medium text-text-primary">{pendingViewUser.cell || "\u2014"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Home size={14} className="text-text-secondary" />
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Village</span>
                    </div>
                    <p className="text-sm font-medium text-text-primary">{pendingViewUser.village || "\u2014"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Tractor size={14} className="text-text-secondary" />
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Farm Size</span>
                    </div>
                    <p className="text-sm font-medium text-text-primary">{pendingViewUser.farmSize ? `${pendingViewUser.farmSize} ha` : "\u2014"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Coffee size={14} className="text-text-secondary" />
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Coffee Variety</span>
                    </div>
                    <p className="text-sm font-medium text-text-primary">{pendingViewUser.coffeeVariety || "\u2014"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
      {/* Approve All Confirmation Modal */}
      <Modal
        isOpen={showApproveAll}
        onClose={() => !approvingAll && setShowApproveAll(false)}
        title="Approve All Pending Users"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowApproveAll(false)} disabled={approvingAll}>
              Cancel
            </Button>
            <Button
              icon={UserCheck}
              className="bg-success text-white hover:bg-success/90"
              onClick={handleApproveAll}
              loading={approvingAll}
            >
              {approvingAll ? "Approving..." : `Approve All (${pendingUsers.length})`}
            </Button>
          </>
        }
      >
        <p className="text-text-secondary">
          Are you sure you want to approve <span className="font-semibold text-text-primary">{pendingUsers.length} pending user{pendingUsers.length !== 1 ? "s" : ""}</span>?
          They will all be able to log in immediately.
        </p>
      </Modal>

    </motion.div>
  );
}
