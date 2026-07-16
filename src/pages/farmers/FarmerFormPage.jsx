import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowLeft, Save, X, User, MapPin, Leaf, Building2 } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { useToast } from "../../components/ui/Toast";

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

const coffeeVarietyOptions = [
  { value: "Red Bourbon", label: "Red Bourbon" },
  { value: "Jackson", label: "Jackson" },
  { value: "BM 139", label: "BM 139" },
  { value: "SL28", label: "SL28" },
];

const collectionCenterOptions = [
  { value: "Mushubi CC", label: "Mushubi CC" },
  { value: "Rulangala CC", label: "Rulangala CC" },
  { value: "Kyanja CC", label: "Kyanja CC" },
  { value: "Ntinda CC", label: "Ntinda CC" },
  { value: "Kisementi CC", label: "Kisementi CC" },
];

const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

const mockFarmer = {
  name: "Mugisha Patrick",
  phone: "+256 772 123456",
  email: "mugisha.p@gmail.com",
  dateOfBirth: "1985-06-15",
  gender: "Male",
  village: "Kyanja",
  district: "Kampala",
  province: "Central",
  country: "Uganda",
  farmSize: 2.5,
  coffeeVariety: "Red Bourbon",
  collectionCenter: "Kyanja CC",
  status: "Active",
};

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

function FarmerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const isEdit = Boolean(id);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      dateOfBirth: "",
      gender: null,
      village: "",
      district: "",
      province: "",
      country: "Uganda",
      farmSize: "",
      coffeeVariety: null,
      collectionCenter: null,
      status: "Active",
    },
  });

  useEffect(() => {
    if (isEdit) {
      reset(mockFarmer);
    }
  }, [isEdit, reset]);

  function onSubmit(data) {
    if (isEdit) {
      success(`Farmer ${data.name} has been updated successfully.`);
    } else {
      success(`Farmer ${data.name} has been registered successfully.`);
    }
    navigate("/farmers");
  }

  return (
    <div className="min-h-screen bg-bg">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <motion.div variants={staggerItem} className="mb-6">
          <button
            onClick={() => navigate("/farmers")}
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors cursor-pointer mb-4"
          >
            <ArrowLeft size={16} />
            Back to Farmers
          </button>
          <h1 className="text-2xl font-bold text-text-primary">
            {isEdit ? "Edit Farmer" : "Register New Farmer"}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {isEdit ? "Update farmer details below" : "Fill in the details to register a new coffee farmer"}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <motion.div variants={staggerItem} className="mb-6">
            <Card
              header={
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User size={16} className="text-primary" />
                  </div>
                  <h2 className="text-base font-semibold text-text-primary">Personal Information</h2>
                </div>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="Enter full name"
                  error={errors.name?.message}
                  {...register("name", { required: "Full name is required" })}
                />
                <Input
                  label="Phone Number"
                  placeholder="+256 7XX XXX XXX"
                  error={errors.phone?.message}
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^\+256\s?\d{3}\s?\d{3,6}$/,
                      message: "Enter a valid Ugandan phone number (e.g. +256 772 123456)",
                    },
                  })}
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="email@example.com"
                  error={errors.email?.message}
                  {...register("email", {
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  error={errors.dateOfBirth?.message}
                  {...register("dateOfBirth")}
                />
                <Controller
                  name="gender"
                  control={control}
                  rules={{ required: "Gender is required" }}
                  render={({ field }) => (
                    <Select
                      label="Gender"
                      options={genderOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select gender"
                      error={errors.gender?.message}
                    />
                  )}
                />
              </div>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem} className="mb-6">
            <Card
              header={
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin size={16} className="text-primary" />
                  </div>
                  <h2 className="text-base font-semibold text-text-primary">Address</h2>
                </div>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Village"
                  placeholder="Enter village"
                  error={errors.village?.message}
                  {...register("village", { required: "Village is required" })}
                />
                <Input
                  label="District"
                  placeholder="Enter district"
                  error={errors.district?.message}
                  {...register("district", { required: "District is required" })}
                />
                <Input
                  label="Province"
                  placeholder="Enter province"
                  {...register("province")}
                />
                <Input
                  label="Country"
                  placeholder="Country"
                  {...register("country")}
                />
              </div>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem} className="mb-6">
            <Card
              header={
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Leaf size={16} className="text-primary" />
                  </div>
                  <h2 className="text-base font-semibold text-text-primary">Farm Information</h2>
                </div>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Farm Size (acres)"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g. 2.5"
                  error={errors.farmSize?.message}
                  {...register("farmSize", {
                    required: "Farm size is required",
                    min: { value: 0.1, message: "Farm size must be at least 0.1 acres" },
                  })}
                />
                <Controller
                  name="coffeeVariety"
                  control={control}
                  rules={{ required: "Coffee variety is required" }}
                  render={({ field }) => (
                    <Select
                      label="Coffee Variety"
                      options={coffeeVarietyOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select coffee variety"
                      error={errors.coffeeVariety?.message}
                    />
                  )}
                />
              </div>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem} className="mb-6">
            <Card
              header={
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 size={16} className="text-primary" />
                  </div>
                  <h2 className="text-base font-semibold text-text-primary">Collection Center & Status</h2>
                </div>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  name="collectionCenter"
                  control={control}
                  rules={{ required: "Collection center is required" }}
                  render={({ field }) => (
                    <Select
                      label="Collection Center"
                      options={collectionCenterOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select collection center"
                      error={errors.collectionCenter?.message}
                      searchable
                    />
                  )}
                />
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Status"
                      options={statusOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select status"
                    />
                  )}
                />
              </div>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem} className="flex items-center justify-end gap-3">
            <Button variant="ghost" icon={X} onClick={() => navigate("/farmers")}>
              Cancel
            </Button>
            <Button type="submit" icon={Save} loading={isSubmitting}>
              {isEdit ? "Update Farmer" : "Register Farmer"}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}

export default FarmerFormPage;
