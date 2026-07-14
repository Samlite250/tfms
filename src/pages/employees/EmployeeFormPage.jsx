import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Save,
  X,
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  MapPin,
  Briefcase,
  Heart,
  Wallet,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { useToast } from "../../components/ui/Toast";

const DEPARTMENTS = [
  { value: "Production", label: "Production" },
  { value: "Collection", label: "Collection" },
  { value: "Packaging", label: "Packaging" },
  { value: "Administration", label: "Administration" },
  { value: "Finance", label: "Finance" },
];

const EMPLOYMENT_TYPES = [
  { value: "Full-time", label: "Full-time" },
  { value: "Part-time", label: "Part-time" },
  { value: "Contract", label: "Contract" },
];

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const mockEditData = {
  firstName: "Kamal",
  lastName: "Perera",
  phone: "0771234567",
  email: "kamal.p@tfms.com",
  dateOfBirth: "1985-06-15",
  gender: "Male",
  nationalId: "851234567V",
  department: "Production",
  position: "Factory Supervisor",
  employmentType: "Full-time",
  joinDate: "2020-03-15",
  address: "45 Temple Road, Kandy",
  emergencyName: "Sunethra Perera",
  emergencyPhone: "0771234568",
  emergencyRelationship: "Spouse",
  basicSalary: "85000",
  allowances: "15000",
};

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon size={16} className="text-primary" />
      </div>
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
    </div>
  );
}

export default function EmployeeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success } = useToast();
  const isEdit = Boolean(id);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm({
    defaultValues: isEdit ? mockEditData : {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      dateOfBirth: "",
      gender: "",
      nationalId: "",
      department: "",
      position: "",
      employmentType: "Full-time",
      joinDate: "",
      address: "",
      emergencyName: "",
      emergencyPhone: "",
      emergencyRelationship: "",
      basicSalary: "",
      allowances: "",
    },
  });

  const deptValue = watch("department");
  const genderValue = watch("gender");
  const empTypeValue = watch("employmentType");

  function onSubmit() {
    success(isEdit ? "Employee updated successfully" : "Employee added successfully");
    navigate("/employees");
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link
          to="/employees"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-4 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to Employees
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">
          {isEdit ? "Edit Employee" : "Add New Employee"}
        </h1>
        <p className="text-text-secondary mt-1">
          {isEdit ? "Update employee information" : "Fill in the details to add a new employee"}
        </p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <SectionHeader icon={User} title="Personal Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="Enter first name"
                error={errors.firstName?.message}
                {...register("firstName", { required: "First name is required" })}
              />
              <Input
                label="Last Name"
                placeholder="Enter last name"
                error={errors.lastName?.message}
                {...register("lastName", { required: "Last name is required" })}
              />
              <Input
                label="Phone Number"
                placeholder="077XXXXXXX"
                icon={Phone}
                error={errors.phone?.message}
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: { value: /^[0-9]{10}$/, message: "Enter a valid 10-digit phone number" },
                })}
              />
              <Input
                label="Email"
                placeholder="name@tfms.com"
                type="email"
                icon={Mail}
                error={errors.email?.message}
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+$/i, message: "Enter a valid email" },
                })}
              />
              <Input
                label="Date of Birth"
                type="date"
                icon={Calendar}
                error={errors.dateOfBirth?.message}
                {...register("dateOfBirth", { required: "Date of birth is required" })}
              />
              <Select
                label="Gender"
                placeholder="Select gender"
                options={GENDER_OPTIONS}
                value={genderValue}
                onChange={(val) => setValue("gender", val)}
                error={errors.gender?.message}
              />
              <Input
                label="National ID"
                placeholder="e.g. 851234567V"
                icon={CreditCard}
                error={errors.nationalId?.message}
                {...register("nationalId", { required: "National ID is required" })}
                className="sm:col-span-2"
              />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <SectionHeader icon={Briefcase} title="Employment Details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Department"
                placeholder="Select department"
                options={DEPARTMENTS}
                value={deptValue}
                onChange={(val) => setValue("department", val)}
                error={errors.department?.message}
                searchable
              />
              <Input
                label="Position"
                placeholder="e.g. Factory Supervisor"
                error={errors.position?.message}
                {...register("position", { required: "Position is required" })}
              />
              <Select
                label="Employment Type"
                placeholder="Select type"
                options={EMPLOYMENT_TYPES}
                value={empTypeValue}
                onChange={(val) => setValue("employmentType", val)}
                error={errors.employmentType?.message}
              />
              <Input
                label="Join Date"
                type="date"
                icon={Calendar}
                error={errors.joinDate?.message}
                {...register("joinDate", { required: "Join date is required" })}
              />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <SectionHeader icon={MapPin} title="Address" />
            <Input
              label="Full Address"
              placeholder="Enter full residential address"
              icon={MapPin}
              error={errors.address?.message}
              {...register("address", { required: "Address is required" })}
            />
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <SectionHeader icon={Heart} title="Emergency Contact" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Contact Name"
                placeholder="Full name"
                error={errors.emergencyName?.message}
                {...register("emergencyName", { required: "Emergency contact name is required" })}
              />
              <Input
                label="Contact Phone"
                placeholder="077XXXXXXX"
                icon={Phone}
                error={errors.emergencyPhone?.message}
                {...register("emergencyPhone", { required: "Emergency contact phone is required" })}
              />
              <Input
                label="Relationship"
                placeholder="e.g. Spouse"
                error={errors.emergencyRelationship?.message}
                {...register("emergencyRelationship", { required: "Relationship is required" })}
              />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <SectionHeader icon={Wallet} title="Salary Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Basic Salary (LKR)"
                placeholder="e.g. 85000"
                type="number"
                icon={Wallet}
                error={errors.basicSalary?.message}
                {...register("basicSalary", { required: "Basic salary is required" })}
              />
              <Input
                label="Allowances (LKR)"
                placeholder="e.g. 15000"
                type="number"
                icon={Wallet}
                error={errors.allowances?.message}
                {...register("allowances", { required: "Allowances amount is required" })}
              />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-end gap-3 pb-6"
        >
          <Link to="/employees">
            <Button variant="ghost" icon={X}>Cancel</Button>
          </Link>
          <Button type="submit" icon={Save} loading={isSubmitting}>
            {isEdit ? "Update Employee" : "Add Employee"}
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
