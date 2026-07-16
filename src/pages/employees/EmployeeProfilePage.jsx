import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Pencil,
  Clock,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  User,
  Briefcase,
  Heart,
  Building2,
  BadgeCheck,
  Wallet,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

const STATUS_VARIANT = {
  Active: "success",
  Inactive: "default",
  "On Leave": "warning",
  Suspended: "danger",
};

const mockEmployee = {
  id: "EMP001",
  firstName: "Kamal",
  lastName: "Perera",
  department: "Production",
  position: "Factory Supervisor",
  phone: "0771234567",
  email: "kamal.p@coms.com",
  status: "Active",
  joinDate: "2020-03-15",
  dateOfBirth: "1985-06-15",
  gender: "Male",
  nationalId: "851234567V",
  employmentType: "Full-time",
  address: "45 Temple Road, Kandy, Central Province",
  emergencyName: "Sunethra Perera",
  emergencyPhone: "0771234568",
  emergencyRelationship: "Spouse",
  basicSalary: 85000,
  allowances: 15000,
};

function generateAttendance() {
  const records = [];
  const statuses = ["Present", "Present", "Present", "Present", "Present", "Present", "Late", "Leave", "Absent"];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0) continue;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const checkInHour = status === "Late" ? `08:${String(Math.floor(Math.random() * 30) + 15).padStart(2, "0")}` : `07:${String(Math.floor(Math.random() * 15) + 45).padStart(2, "0")}`;
    const checkOutTime = `17:${String(Math.floor(Math.random() * 30) + 15).padStart(2, "0")}`;
    records.push({
      date: date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      checkIn: status === "Absent" ? "--:--" : checkInHour,
      checkOut: status === "Absent" || status === "Leave" ? "--:--" : checkOutTime,
      status,
    });
  }
  return records;
}

function generateSalaryHistory() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const basic = 85000;
    const allowances = 15000;
    const deductions = Math.floor(Math.random() * 5000) + 2000;
    months.push({
      month: d.toLocaleDateString("en-US", { year: "numeric", month: "long" }),
      basic,
      allowances,
      deductions,
      netPay: basic + allowances - deductions,
    });
  }
  return months;
}

const ATTENDANCE_STATUS_COLOR = {
  Present: "success",
  Late: "warning",
  Absent: "danger",
  Leave: "info",
};

const tabs = [
  { key: "overview", label: "Overview", icon: User },
  { key: "attendance", label: "Attendance", icon: Clock },
  { key: "salary", label: "Salary", icon: Wallet },
];

export default function EmployeeProfilePage() {
  const { id: _id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const emp = mockEmployee;
  const attendance = generateAttendance();
  const salaryHistory = generateSalaryHistory();

  const fullName = `${emp.firstName} ${emp.lastName}`;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          to="/employees"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-4 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to Employees
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold shrink-0">
              {emp.firstName[0]}{emp.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h1 className="text-2xl font-bold text-text-primary">{fullName}</h1>
                <Badge variant={STATUS_VARIANT[emp.status]} dot>{emp.status}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2 text-sm text-text-secondary">
                <span className="flex items-center gap-1.5"><Building2 size={14} /> {emp.department}</span>
                <span className="flex items-center gap-1.5"><Briefcase size={14} /> {emp.position}</span>
                <span className="flex items-center gap-1.5"><BadgeCheck size={14} /> {emp.id}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link to={`/employees/${emp.id}/edit`}>
                <Button variant="outline" size="sm" icon={Pencil}>Edit</Button>
              </Link>
              <Button size="sm" icon={Clock}>Mark Attendance</Button>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-border overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap
                ${activeTab === tab.key
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-secondary hover:bg-gray-100 hover:text-text-primary"
                }
              `}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <Card>
              <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
                <User size={18} className="text-primary" />
                Personal Details
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Full Name", value: fullName },
                  { label: "Email", value: emp.email, icon: Mail },
                  { label: "Phone", value: emp.phone, icon: Phone },
                  { label: "Date of Birth", value: new Date(emp.dateOfBirth).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
                  { label: "Gender", value: emp.gender },
                  { label: "National ID", value: emp.nationalId, icon: CreditCard },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-text-secondary">{item.label}</span>
                    <span className="text-sm font-medium text-text-primary">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Briefcase size={18} className="text-primary" />
                Employment Details
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Employee ID", value: emp.id },
                  { label: "Department", value: emp.department },
                  { label: "Position", value: emp.position },
                  { label: "Employment Type", value: emp.employmentType },
                  { label: "Join Date", value: new Date(emp.joinDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
                  { label: "Status", value: emp.status },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-text-secondary">{item.label}</span>
                    {item.label === "Status" ? (
                      <Badge variant={STATUS_VARIANT[item.value]} dot>{item.value}</Badge>
                    ) : (
                      <span className="text-sm font-medium text-text-primary">{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-primary" />
                Address
              </h3>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <MapPin size={18} className="text-text-secondary mt-0.5 shrink-0" />
                <p className="text-sm text-text-primary">{emp.address}</p>
              </div>
            </Card>

            <Card>
              <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Heart size={18} className="text-primary" />
                Emergency Contact
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-text-secondary">Name</span>
                  <span className="text-sm font-medium text-text-primary">{emp.emergencyName}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-text-secondary">Phone</span>
                  <span className="text-sm font-medium text-text-primary">{emp.emergencyPhone}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-text-secondary">Relationship</span>
                  <span className="text-sm font-medium text-text-primary">{emp.emergencyRelationship}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === "attendance" && (
          <motion.div
            key="attendance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card padding="none">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-base font-semibold text-text-primary">Attendance History</h3>
                <p className="text-sm text-text-secondary mt-1">Last 30 working days</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-gray-50/80">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Check In</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Check Out</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {attendance.map((rec, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3 text-sm font-medium text-text-primary">{rec.date}</td>
                        <td className="px-6 py-3 text-sm text-text-secondary">{rec.checkIn}</td>
                        <td className="px-6 py-3 text-sm text-text-secondary">{rec.checkOut}</td>
                        <td className="px-6 py-3">
                          <Badge variant={ATTENDANCE_STATUS_COLOR[rec.status]} dot>{rec.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === "salary" && (
          <motion.div
            key="salary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card hover>
                <p className="text-sm text-text-secondary mb-1">Basic Salary</p>
                <p className="text-xl font-bold text-text-primary">LKR {emp.basicSalary.toLocaleString()}</p>
              </Card>
              <Card hover>
                <p className="text-sm text-text-secondary mb-1">Allowances</p>
                <p className="text-xl font-bold text-text-primary">LKR {emp.allowances.toLocaleString()}</p>
              </Card>
              <Card hover>
                <p className="text-sm text-text-secondary mb-1">Gross Salary</p>
                <p className="text-xl font-bold text-primary">LKR {(emp.basicSalary + emp.allowances).toLocaleString()}</p>
              </Card>
            </div>

            <Card padding="none">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-base font-semibold text-text-primary">Salary History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-gray-50/80">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Month</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Basic</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Allowances</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Deductions</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Net Pay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {salaryHistory.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3 text-sm font-medium text-text-primary">{row.month}</td>
                        <td className="px-6 py-3 text-sm text-text-primary text-right">LKR {row.basic.toLocaleString()}</td>
                        <td className="px-6 py-3 text-sm text-text-primary text-right">LKR {row.allowances.toLocaleString()}</td>
                        <td className="px-6 py-3 text-sm text-danger text-right">-LKR {row.deductions.toLocaleString()}</td>
                        <td className="px-6 py-3 text-sm font-semibold text-primary text-right">LKR {row.netPay.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
