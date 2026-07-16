import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  User,
  Factory,
  Building2,
  Leaf,
  MapPin,
  Bell,
  Camera,
  Save,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Globe,
  Clock,
  MapPinned,
  Users,
  BadgeCheck,
  X,
  Check,
  ChevronRight,
  Shield,
  Palette,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../contexts/AuthContext";
import { ROLE_SETTINGS_TABS } from "../../utils/constants";

const allTabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "factory", label: "Factory", icon: Factory },
  { id: "departments", label: "Departments", icon: Building2 },
  { id: "grades", label: "Coffee Grades", icon: Leaf },
  { id: "centers", label: "Collection Centers", icon: MapPin },
  { id: "notifications", label: "Notifications", icon: Bell },
];

const initialProfile = {
  fullName: "Amara Nkemdirim",
  email: "amara.nkemdirim@coms.com",
  phone: "+234 801 234 5678",
  department: "Administration",
  role: "System Administrator",
  joinDate: "2023-06-15",
  initials: "AN",
};

const initialFactory = {
  factoryName: "Mahembe Coffee Factory",
  registrationNumber: "RC-2019/FGN/128456",
  street: "42 Plantation Avenue",
  city: "Lagos",
  province: "Lagos State",
  country: "Nigeria",
  phone: "+234 1 234 5678",
  email: "info@mahembecoffee.com",
  website: "https://www.mahembecoffee.com",
  startTime: "06:00",
  endTime: "18:00",
};

const initialDepartments = [
  { id: 1, name: "Production", description: "Oversees coffee processing and manufacturing", memberCount: 45 },
  { id: 2, name: "Collection", description: "Manages leaf collection from farmers", memberCount: 22 },
  { id: 3, name: "Packaging", description: "Handles product packaging and labeling", memberCount: 18 },
  { id: 4, name: "Administration", description: "General administrative operations", memberCount: 12 },
  { id: 5, name: "Finance", description: "Financial planning and accounting", memberCount: 8 },
  { id: 6, name: "Quality Control", description: "Ensures product quality standards", memberCount: 10 },
  { id: 7, name: "Maintenance", description: "Equipment and facility maintenance", memberCount: 14 },
];

const initialGrades = [
  { id: 1, name: "AA", description: "Premium Grade - Largest bean size" },
  { id: 2, name: "AB", description: "Premium Grade - Medium bean size" },
  { id: 3, name: "PB", description: "Peaberry - Single round bean" },
  { id: 4, name: "C", description: "Common Grade - Smaller bean" },
  { id: 5, name: "TT", description: "Light beans from AA and AB" },
  { id: 6, name: "T", description: "Smallest and lightest beans" },
  { id: 7, name: "E", description: "Elephant Grade - Oversized beans" },
  { id: 8, name: "MH/ML", description: "Mill Hand / Machine Grade" },
];

const initialCenters = [
  { id: 1, name: "Central Collection Point", location: "Main Factory Premises", manager: "Emeka Okonkwo", farmers: 124, status: "active" },
  { id: 2, name: "Northern Hub", location: "Kaduna Road, Abuja", manager: "Fatima Abubakar", farmers: 86, status: "active" },
  { id: 3, name: "Southern Hub", location: "Port Harcourt Industrial Area", manager: "Ngozi Eze", farmers: 98, status: "active" },
  { id: 4, name: "Eastern Hub", location: "Enugu State Agro Hub", manager: "Obiora Nwosu", farmers: 67, status: "active" },
  { id: 5, name: "Western Hub", location: "Ibadan Farm Settlement", manager: "Adeola Olatunde", farmers: 73, status: "inactive" },
];

const initialNotifications = {
  emailNotifications: true,
  lowStockAlerts: true,
  dailyReports: false,
  paymentReminders: true,
  collectionUpdates: true,
  qualityAlerts: true,
};

const tabContentVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.15 } },
};

function Toggle({ enabled, onToggle, label, description }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {description && (
          <p className="text-xs text-text-secondary mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2
          focus:ring-primary/40 focus:ring-offset-2
          ${enabled ? "bg-primary" : "bg-gray-200"}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full
            bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out
            ${enabled ? "translate-x-5.5" : "translate-x-0.5"} mt-0.5
          `}
        />
      </button>
    </div>
  );
}

function ProfileSection() {
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({ defaultValues: initialProfile });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch: watchPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm();

  const newPassword = watchPassword("newPassword");

  const onProfileSubmit = useCallback(() => {
    setProfileSaving(true);
    setTimeout(() => {
      setProfileSaving(false);
      toast.success("Profile updated successfully");
    }, 1200);
  }, [toast]);

  const onPasswordSubmit = useCallback(() => {
    setPasswordSaving(true);
    setTimeout(() => {
      setPasswordSaving(false);
      resetPassword();
      toast.success("Password changed successfully");
    }, 1200);
  }, [resetPassword, toast]);

  return (
    <motion.div variants={tabContentVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <Card>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold border-4 border-white shadow-md">
              {initialProfile.initials}
            </div>
            <button className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer">
              <Camera size={20} className="text-white" />
            </button>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold text-text-primary">{initialProfile.fullName}</h3>
            <p className="text-sm text-text-secondary">{initialProfile.role}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
              <Badge variant="success" dot>Active</Badge>
              <span className="text-xs text-text-secondary">Joined {new Date(initialProfile.joinDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card header={<h3 className="text-base font-semibold text-text-primary">Personal Information</h3>}>
        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              icon={User}
              {...registerProfile("fullName", { required: "Full name is required" })}
              error={profileErrors.fullName?.message}
            />
            <Input
              label="Email Address"
              icon={Mail}
              disabled
              {...registerProfile("email")}
              className="opacity-70"
            />
            <Input
              label="Phone Number"
              icon={Phone}
              {...registerProfile("phone", { required: "Phone number is required" })}
              error={profileErrors.phone?.message}
            />
            <Input
              label="Department"
              icon={Building2}
              {...registerProfile("department")}
              disabled
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={profileSaving} icon={Save}>Save Profile</Button>
          </div>
        </form>
      </Card>

      <Card header={<h3 className="text-base font-semibold text-text-primary flex items-center gap-2"><Shield size={18} /> Change Password</h3>}>
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
          <div className="max-w-md">
            <Input
              label="Current Password"
              type={showCurrentPassword ? "text" : "password"}
              icon={Shield}
              {...registerPassword("currentPassword", { required: "Current password is required" })}
              error={passwordErrors.currentPassword?.message}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <div className="relative">
              <Input
                label="New Password"
                type={showNewPassword ? "text" : "password"}
                icon={Shield}
                {...registerPassword("newPassword", {
                  required: "New password is required",
                  minLength: { value: 8, message: "Password must be at least 8 characters" },
                })}
                error={passwordErrors.newPassword?.message}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-[38px] text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="relative">
              <Input
                label="Confirm New Password"
                type={showConfirmPassword ? "text" : "password"}
                icon={Shield}
                {...registerPassword("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (val) => val === newPassword || "Passwords do not match",
                })}
                error={passwordErrors.confirmPassword?.message}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[38px] text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={passwordSaving} icon={Save} variant="secondary">Update Password</Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}

function FactorySection() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: initialFactory });

  const onSubmit = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Factory settings updated successfully");
    }, 1200);
  }, [toast]);

  return (
    <motion.div variants={tabContentVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <Card header={<h3 className="text-base font-semibold text-text-primary">General Information</h3>}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Factory Name"
              icon={Factory}
              {...register("factoryName", { required: "Factory name is required" })}
              error={errors.factoryName?.message}
            />
            <Input
              label="Registration Number"
              icon={BadgeCheck}
              {...register("registrationNumber", { required: "Registration number is required" })}
              error={errors.registrationNumber?.message}
            />
          </div>

          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
              <MapPinned size={16} /> Address
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Street Address"
                icon={MapPin}
                {...register("street", { required: "Street address is required" })}
                error={errors.street?.message}
              />
              <Input
                label="City"
                icon={Building2}
                {...register("city", { required: "City is required" })}
                error={errors.city?.message}
              />
              <Input
                label="Province / State"
                icon={MapPin}
                {...register("province", { required: "Province is required" })}
                error={errors.province?.message}
              />
              <Input
                label="Country"
                icon={Globe}
                {...register("country", { required: "Country is required" })}
                error={errors.country?.message}
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
              <Phone size={16} /> Contact Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Phone"
                icon={Phone}
                {...register("phone", { required: "Phone is required" })}
                error={errors.phone?.message}
              />
              <Input
                label="Email"
                icon={Mail}
                {...register("email", { required: "Email is required" })}
                error={errors.email?.message}
              />
              <Input
                label="Website"
                icon={Globe}
                {...register("website")}
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
              <Clock size={16} /> Working Hours
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
              <Input
                label="Start Time"
                type="time"
                icon={Clock}
                {...register("startTime", { required: "Start time is required" })}
                error={errors.startTime?.message}
              />
              <Input
                label="End Time"
                type="time"
                icon={Clock}
                {...register("endTime", { required: "End time is required" })}
                error={errors.endTime?.message}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={saving} icon={Save}>Save Factory Settings</Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}

function DepartmentsSection() {
  const { toast } = useToast();
  const [departments, setDepartments] = useState(initialDepartments);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptDesc, setNewDeptDesc] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [deleteModal, setDeleteModal] = useState({ open: false, dept: null });

  const handleAdd = () => {
    if (!newDeptName.trim()) return;
    setDepartments([...departments, {
      id: Date.now(),
      name: newDeptName.trim(),
      description: newDeptDesc.trim() || "No description",
      memberCount: 0,
    }]);
    setNewDeptName("");
    setNewDeptDesc("");
    toast.success(`Department "${newDeptName.trim()}" added`);
  };

  const handleEdit = (dept) => {
    setEditingId(dept.id);
    setEditName(dept.name);
    setEditDesc(dept.description);
  };

  const handleSaveEdit = (id) => {
    if (!editName.trim()) return;
    setDepartments(departments.map((d) => d.id === id ? { ...d, name: editName.trim(), description: editDesc.trim() } : d));
    setEditingId(null);
    toast.success("Department updated");
  };

  const handleDelete = () => {
    setDepartments(departments.filter((d) => d.id !== deleteModal.dept.id));
    setDeleteModal({ open: false, dept: null });
    toast.success("Department deleted");
  };

  return (
    <motion.div variants={tabContentVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <Card header={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-text-primary">Departments ({departments.length})</h3>
        </div>
      }>
        <div className="space-y-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="New department name..."
                icon={Building2}
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Description (optional)..."
                value={newDeptDesc}
                onChange={(e) => setNewDeptDesc(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <Button onClick={handleAdd} icon={Plus} disabled={!newDeptName.trim()}>Add</Button>
          </div>
        </div>

        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {departments.map((dept) => (
              <motion.div
                key={dept.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Building2 size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  {editingId === dept.id ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 rounded-lg border border-primary px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                        autoFocus
                      />
                      <input
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="flex-1 rounded-lg border border-border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                        placeholder="Description"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-text-primary">{dept.name}</p>
                      <p className="text-xs text-text-secondary truncate">{dept.description}</p>
                    </>
                  )}
                </div>
                <Badge variant="info">{dept.memberCount} members</Badge>
                <div className="flex items-center gap-1 shrink-0">
                  {editingId === dept.id ? (
                    <>
                      <button onClick={() => handleSaveEdit(dept.id)} className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors cursor-pointer"><Check size={16} /></button>
                      <button onClick={() => setEditingId(null)} className="p-2 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors cursor-pointer"><X size={16} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(dept)} className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"><Pencil size={16} /></button>
                      <button onClick={() => setDeleteModal({ open: true, dept })} className="p-2 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"><Trash2 size={16} /></button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Card>

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, dept: null })}
        title="Delete Department"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal({ open: false, dept: null })}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} icon={Trash2}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Are you sure you want to delete <strong className="text-text-primary">{deleteModal.dept?.name}</strong>? This action cannot be undone and may affect assigned employees.
        </p>
      </Modal>
    </motion.div>
  );
}

function GradesSection() {
  const { toast } = useToast();
  const [grades, setGrades] = useState(initialGrades);
  const [newGradeName, setNewGradeName] = useState("");
  const [newGradeDesc, setNewGradeDesc] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [deleteModal, setDeleteModal] = useState({ open: false, grade: null });

  const handleAdd = () => {
    if (!newGradeName.trim()) return;
    setGrades([...grades, {
      id: Date.now(),
      name: newGradeName.trim().toUpperCase(),
      description: newGradeDesc.trim() || "No description",
    }]);
    setNewGradeName("");
    setNewGradeDesc("");
    toast.success(`Grade "${newGradeName.trim().toUpperCase()}" added`);
  };

  const handleEdit = (grade) => {
    setEditingId(grade.id);
    setEditName(grade.name);
    setEditDesc(grade.description);
  };

  const handleSaveEdit = (id) => {
    if (!editName.trim()) return;
    setGrades(grades.map((g) => g.id === id ? { ...g, name: editName.trim().toUpperCase(), description: editDesc.trim() } : g));
    setEditingId(null);
    toast.success("Grade updated");
  };

  const handleDelete = () => {
    setGrades(grades.filter((g) => g.id !== deleteModal.grade.id));
    setDeleteModal({ open: false, grade: null });
    toast.success("Grade deleted");
  };

  return (
    <motion.div variants={tabContentVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <Card header={<h3 className="text-base font-semibold text-text-primary">Coffee Grades ({grades.length})</h3>}>
        <div className="space-y-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="w-40">
              <Input
                placeholder="Grade code..."
                icon={Leaf}
                value={newGradeName}
                onChange={(e) => setNewGradeName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Description..."
                value={newGradeDesc}
                onChange={(e) => setNewGradeDesc(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <Button onClick={handleAdd} icon={Plus} disabled={!newGradeName.trim()}>Add Grade</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {grades.map((grade) => (
              <motion.div
                key={grade.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-accent font-bold text-sm shrink-0">
                  {grade.name}
                </div>
                <div className="flex-1 min-w-0">
                  {editingId === grade.id ? (
                    <div className="space-y-2">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-lg border border-primary px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30"
                        autoFocus
                      />
                      <input
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full rounded-lg border border-border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                        placeholder="Description"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-text-primary">{grade.name}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{grade.description}</p>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {editingId === grade.id ? (
                    <>
                      <button onClick={() => handleSaveEdit(grade.id)} className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors cursor-pointer"><Check size={16} /></button>
                      <button onClick={() => setEditingId(null)} className="p-2 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors cursor-pointer"><X size={16} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(grade)} className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"><Pencil size={16} /></button>
                      <button onClick={() => setDeleteModal({ open: true, grade })} className="p-2 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"><Trash2 size={16} /></button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Card>

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, grade: null })}
        title="Delete Coffee Grade"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal({ open: false, grade: null })}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} icon={Trash2}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Are you sure you want to delete grade <strong className="text-text-primary">{deleteModal.grade?.name}</strong>? This may affect existing inventory records.
        </p>
      </Modal>
    </motion.div>
  );
}

function CentersSection() {
  const { toast } = useToast();
  const [centers, setCenters] = useState(initialCenters);
  const [newCenter, setNewCenter] = useState({ name: "", location: "", manager: "" });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: "", location: "", manager: "" });
  const [deleteModal, setDeleteModal] = useState({ open: false, center: null });

  const handleAdd = () => {
    if (!newCenter.name.trim()) return;
    setCenters([...centers, {
      id: Date.now(),
      name: newCenter.name.trim(),
      location: newCenter.location.trim() || "Not specified",
      manager: newCenter.manager.trim() || "Unassigned",
      farmers: 0,
      status: "active",
    }]);
    setNewCenter({ name: "", location: "", manager: "" });
    toast.success(`Collection center "${newCenter.name.trim()}" added`);
  };

  const handleEdit = (center) => {
    setEditingId(center.id);
    setEditData({ name: center.name, location: center.location, manager: center.manager });
  };

  const handleSaveEdit = (id) => {
    if (!editData.name.trim()) return;
    setCenters(centers.map((c) => c.id === id ? { ...c, ...editData, name: editData.name.trim(), location: editData.location.trim(), manager: editData.manager.trim() } : c));
    setEditingId(null);
    toast.success("Center updated");
  };

  const handleDelete = () => {
    setCenters(centers.filter((c) => c.id !== deleteModal.center.id));
    setDeleteModal({ open: false, center: null });
    toast.success("Collection center deleted");
  };

  return (
    <motion.div variants={tabContentVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <Card header={<h3 className="text-base font-semibold text-text-primary">Collection Centers ({centers.length})</h3>}>
        <div className="p-4 rounded-xl bg-gray-50 border border-border mb-6">
          <h4 className="text-sm font-medium text-text-primary mb-3">Add New Center</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              placeholder="Center name..."
              icon={MapPin}
              value={newCenter.name}
              onChange={(e) => setNewCenter({ ...newCenter, name: e.target.value })}
            />
            <Input
              placeholder="Location..."
              icon={MapPinned}
              value={newCenter.location}
              onChange={(e) => setNewCenter({ ...newCenter, location: e.target.value })}
            />
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Manager name..."
                  icon={User}
                  value={newCenter.manager}
                  onChange={(e) => setNewCenter({ ...newCenter, manager: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
              </div>
              <Button onClick={handleAdd} icon={Plus} disabled={!newCenter.name.trim()}>Add</Button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {centers.map((center) => (
              <motion.div
                key={center.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${center.status === "active" ? "bg-primary/10 text-primary" : "bg-gray-100 text-text-secondary"}`}>
                    <MapPin size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {editingId === center.id ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="w-full sm:w-48 rounded-lg border border-primary px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30"
                          autoFocus
                        />
                        <input
                          value={editData.location}
                          onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                          className="w-full sm:w-48 rounded-lg border border-border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                          placeholder="Location"
                        />
                        <input
                          value={editData.manager}
                          onChange={(e) => setEditData({ ...editData, manager: e.target.value })}
                          className="w-full sm:w-40 rounded-lg border border-border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                          placeholder="Manager"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-text-primary">{center.name}</p>
                          <Badge variant={center.status === "active" ? "success" : "default"} dot>
                            {center.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
                          <MapPinned size={12} /> {center.location}
                          <span className="mx-1">·</span>
                          <User size={12} /> {center.manager}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text-primary">{center.farmers}</p>
                    <p className="text-xs text-text-secondary">farmers</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {editingId === center.id ? (
                      <>
                        <button onClick={() => handleSaveEdit(center.id)} className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors cursor-pointer"><Check size={16} /></button>
                        <button onClick={() => setEditingId(null)} className="p-2 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors cursor-pointer"><X size={16} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(center)} className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"><Pencil size={16} /></button>
                        <button onClick={() => setDeleteModal({ open: true, center })} className="p-2 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"><Trash2 size={16} /></button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Card>

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, center: null })}
        title="Delete Collection Center"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal({ open: false, center: null })}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} icon={Trash2}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Are you sure you want to delete <strong className="text-text-primary">{deleteModal.center?.name}</strong>? This will remove all associated farmer records.
        </p>
      </Modal>
    </motion.div>
  );
}

function NotificationsSection() {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState(initialNotifications);
  const [saving, setSaving] = useState(false);

  const toggle = useCallback((key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Notification preferences saved");
    }, 1000);
  };

  const notificationOptions = [
    { key: "emailNotifications", label: "Email Notifications", description: "Receive email updates for important system events and activities" },
    { key: "lowStockAlerts", label: "Low Stock Alerts", description: "Get notified when inventory items fall below minimum thresholds" },
    { key: "dailyReports", label: "Daily Reports", description: "Receive automated daily production and collection summary reports" },
    { key: "paymentReminders", label: "Payment Reminders", description: "Alerts for upcoming and overdue farmer and supplier payments" },
    { key: "collectionUpdates", label: "Collection Updates", description: "Real-time notifications when new coffee cherry collections are recorded" },
    { key: "qualityAlerts", label: "Quality Alerts", description: "Immediate alerts when quality control tests fail or require attention" },
  ];

  return (
    <motion.div variants={tabContentVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <Card header={
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-text-primary">Notification Preferences</h3>
          <Badge variant="info">{Object.values(prefs).filter(Boolean).length} active</Badge>
        </div>
      }>
        <div className="divide-y divide-border">
          {notificationOptions.map((opt) => (
            <Toggle
              key={opt.key}
              enabled={prefs[opt.key]}
              onToggle={() => toggle(opt.key)}
              label={opt.label}
              description={opt.description}
            />
          ))}
        </div>
        <div className="flex justify-end mt-6 pt-4 border-t border-border">
          <Button onClick={handleSave} loading={saving} icon={Save}>Save Preferences</Button>
        </div>
      </Card>
    </motion.div>
  );
}

function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { userProfile } = useAuth();
  const role = userProfile?.role || "admin";
  const allowedTabs = ROLE_SETTINGS_TABS[role] || ["profile"];
  const tabs = allTabs.filter((t) => allowedTabs.includes(t.id));

  const renderContent = () => {
    switch (activeTab) {
      case "profile": return <ProfileSection />;
      case "factory": return <FactorySection />;
      case "departments": return <DepartmentsSection />;
      case "grades": return <GradesSection />;
      case "centers": return <CentersSection />;
      case "notifications": return <NotificationsSection />;
      default: return <ProfileSection />;
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-sm text-text-secondary mt-1">Manage your account, factory, and system preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <nav className="lg:w-56 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-border p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                      transition-all duration-200 whitespace-nowrap cursor-pointer
                      ${isActive
                        ? "bg-primary text-white shadow-sm"
                        : "text-text-secondary hover:text-text-primary hover:bg-gray-50"
                      }
                    `}
                  >
                    <Icon size={18} />
                    <span className="hidden sm:inline lg:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <div key={activeTab}>
                {renderContent()}
              </div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
