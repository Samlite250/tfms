import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserPlus,
  Users,
  UserCheck,
  Building2,
  CalendarOff,
  Eye,
  Pencil,
  Trash2,
  UserCog,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import SearchInput from "../../components/ui/SearchInput";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import StatCard from "../../components/ui/StatCard";
import { useToast } from "../../components/ui/Toast";

const DEPARTMENTS = ["Production", "Collection", "Packaging", "Administration", "Finance"];

const STATUS_VARIANT = {
  Active: "success",
  Inactive: "default",
  "On Leave": "warning",
  Suspended: "danger",
};

const mockEmployees = [
  { id: "EMP001", firstName: "Kamal", lastName: "Perera", department: "Production", position: "Factory Supervisor", phone: "0771234567", email: "kamal.p@coms.com", status: "Active", joinDate: "2020-03-15", gender: "Male", employmentType: "Full-time" },
  { id: "EMP002", firstName: "Nimal", lastName: "Silva", department: "Collection", position: "Collection Officer", phone: "0772345678", email: "nimal.s@coms.com", status: "Active", joinDate: "2021-06-01", gender: "Male", employmentType: "Full-time" },
  { id: "EMP003", firstName: "Sunil", lastName: "Fernando", department: "Production", position: "Machine Operator", phone: "0773456789", email: "sunil.f@coms.com", status: "Active", joinDate: "2019-11-20", gender: "Male", employmentType: "Full-time" },
  { id: "EMP004", firstName: "Anita", lastName: "Jayawardena", department: "Administration", position: "HR Manager", phone: "0774567890", email: "anita.j@coms.com", status: "Active", joinDate: "2018-01-10", gender: "Female", employmentType: "Full-time" },
  { id: "EMP005", firstName: "Ravi", lastName: "Wickrama", department: "Finance", position: "Senior Accountant", phone: "0775678901", email: "ravi.w@coms.com", status: "Active", joinDate: "2019-05-22", gender: "Male", employmentType: "Full-time" },
  { id: "EMP006", firstName: "Dilani", lastName: "Herath", department: "Packaging", position: "Packaging Lead", phone: "0776789012", email: "dilani.h@coms.com", status: "On Leave", joinDate: "2020-08-14", gender: "Female", employmentType: "Full-time" },
  { id: "EMP007", firstName: "Chaminda", lastName: "Rajapaksa", department: "Production", position: "Quality Inspector", phone: "0777890123", email: "chaminda.r@coms.com", status: "Active", joinDate: "2021-02-28", gender: "Male", employmentType: "Full-time" },
  { id: "EMP008", firstName: "Priya", lastName: "Bandara", department: "Collection", position: "Coffee Grader", phone: "0778901234", email: "priya.b@coms.com", status: "Active", joinDate: "2022-01-05", gender: "Female", employmentType: "Part-time" },
  { id: "EMP009", firstName: "Mahinda", lastName: "Gamage", department: "Production", position: "Maintenance Tech", phone: "0779012345", email: "mahinda.g@coms.com", status: "Inactive", joinDate: "2017-09-12", gender: "Male", employmentType: "Full-time" },
  { id: "EMP010", firstName: "Kavisha", lastName: "Dissanayake", department: "Administration", position: "Office Assistant", phone: "0770123456", email: "kavisha.d@coms.com", status: "Active", joinDate: "2023-04-18", gender: "Female", employmentType: "Contract" },
  { id: "EMP011", firstName: "Thilina", lastName: "Weerasinghe", department: "Finance", position: "Accounts Clerk", phone: "0771122334", email: "thilina.w@coms.com", status: "Active", joinDate: "2022-07-01", gender: "Male", employmentType: "Full-time" },
  { id: "EMP012", firstName: "Sanduni", lastName: "Ranasinghe", department: "Packaging", position: "Packaging Operator", phone: "0772233445", email: "sanduni.r@coms.com", status: "On Leave", joinDate: "2021-10-15", gender: "Female", employmentType: "Part-time" },
  { id: "EMP013", firstName: "Wasantha", lastName: "Jayasuriya", department: "Production", position: "Shift Supervisor", phone: "0773344556", email: "wasantha.j@coms.com", status: "Active", joinDate: "2018-06-20", gender: "Male", employmentType: "Full-time" },
  { id: "EMP014", firstName: "Madhavi", lastName: "Liyanage", department: "Collection", position: "Field Coordinator", phone: "0774455667", email: "madhavi.l@coms.com", status: "Active", joinDate: "2023-02-10", gender: "Female", employmentType: "Full-time" },
  { id: "EMP015", firstName: "Lakshman", lastName: "Peris", department: "Administration", position: "Admin Officer", phone: "0775566778", email: "lakshman.p@coms.com", status: "Suspended", joinDate: "2020-12-01", gender: "Male", employmentType: "Contract" },
  { id: "EMP016", firstName: "Nipuni", lastName: "Wijesinghe", department: "Finance", position: "Payroll Officer", phone: "0776677889", email: "nipuni.w@coms.com", status: "Active", joinDate: "2021-09-05", gender: "Female", employmentType: "Full-time" },
  { id: "EMP017", firstName: "Duminda", lastName: "Senaratne", department: "Production", position: "Process Engineer", phone: "0777788990", email: "duminda.s@coms.com", status: "Active", joinDate: "2022-03-15", gender: "Male", employmentType: "Full-time" },
];

export default function EmployeesPage() {
  const [employeesList, setEmployeesList] = useState(mockEmployees);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteModal, setDeleteModal] = useState(null);
  const { success } = useToast();

  const stats = useMemo(() => {
    const total = employeesList.length;
    const active = employeesList.filter((e) => e.status === "Active").length;
    const departments = new Set(employeesList.map((e) => e.department)).size;
    const onLeave = employeesList.filter((e) => e.status === "On Leave").length;
    return { total, active, departments, onLeave };
  }, [employeesList]);

  const filtered = useMemo(() => {
    return employeesList.filter((emp) => {
      const matchSearch =
        !search ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        emp.id.toLowerCase().includes(search.toLowerCase()) ||
        emp.phone.includes(search);
      const matchDept = !deptFilter || emp.department === deptFilter;
      const matchStatus = !statusFilter || emp.status === statusFilter;
      return matchSearch && matchDept && matchStatus;
    });
  }, [employeesList, search, deptFilter, statusFilter]);

  function handleDelete() {
    setEmployeesList((prev) => prev.filter((e) => e.id !== deleteModal.id));
    success(`Employee ${deleteModal.firstName} ${deleteModal.lastName} deleted successfully`);
    setDeleteModal(null);
  }

  const columns = [
    {
      header: "Employee ID",
      accessor: "id",
      render: (row) => <span className="font-medium text-primary">{row.id}</span>,
    },
    {
      header: "Name",
      accessor: "firstName",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
            {row.firstName[0]}{row.lastName[0]}
          </div>
          <div>
            <p className="font-medium text-text-primary">{row.firstName} {row.lastName}</p>
            <p className="text-xs text-text-secondary">{row.email}</p>
          </div>
        </div>
      ),
    },
    { header: "Department", accessor: "department" },
    { header: "Position", accessor: "position" },
    { header: "Phone", accessor: "phone" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status] || "default"} dot>
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Join Date",
      accessor: "joinDate",
      render: (row) => new Date(row.joinDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <UserCog size={28} className="text-primary" />
            Employee Management
          </h1>
          <p className="text-text-secondary mt-1">Manage all employees of the coffee factory</p>
        </div>
        <Link to="/employees/new">
          <Button icon={UserPlus}>Add Employee</Button>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Employees" value={stats.total} color="text-primary" bg="bg-primary/10" borderColor="#2E7D32" delay={0} />
        <StatCard icon={UserCheck} label="Active" value={stats.active} color="text-green-600" bg="bg-green-100" borderColor="#16A34A" delay={0.1} />
        <StatCard icon={Building2} label="Departments" value={stats.departments} color="text-blue-600" bg="bg-blue-100" borderColor="#2563EB" delay={0.2} />
        <StatCard icon={CalendarOff} label="On Leave" value={stats.onLeave} color="text-amber-600" bg="bg-amber-100" borderColor="#D97706" delay={0.3} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card padding="none">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search employees..." className="sm:w-72" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50/80">
                  {columns.map((col) => (
                    <th
                      key={col.accessor}
                      className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"
                    >
                      {col.header}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1}>
                      <EmptyState
                        icon={Users}
                        title="No employees found"
                        description="Try adjusting your search or filters."
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((emp, idx) => (
                    <motion.tr
                      key={emp.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-primary/5 transition-colors"
                    >
                      {columns.map((col) => (
                        <td key={col.accessor} className="px-4 py-3 text-sm text-text-primary">
                          {col.render ? col.render(emp) : emp[col.accessor]}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/employees/${emp.id}`}>
                            <button className="p-2 rounded-lg text-text-secondary hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer" title="View">
                              <Eye size={16} />
                            </button>
                          </Link>
                          <Link to={`/employees/${emp.id}/edit`}>
                            <button className="p-2 rounded-lg text-text-secondary hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer" title="Edit">
                              <Pencil size={16} />
                            </button>
                          </Link>
                          <button
                            onClick={() => setDeleteModal(emp)}
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

          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-border text-sm text-text-secondary">
              Showing {filtered.length} of {employeesList.length} employees
            </div>
          )}
        </Card>
      </motion.div>

      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Employee"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        {deleteModal && (
          <p className="text-text-secondary">
            Are you sure you want to delete <span className="font-semibold text-text-primary">{deleteModal.firstName} {deleteModal.lastName}</span> ({deleteModal.id})? This action cannot be undone.
          </p>
        )}
      </Modal>
    </div>
  );
}
